// ============================================================
// Storage — project persistence (localStorage), autosave, history
// ============================================================
'use strict';

  // ===== PROJECT MANAGEMENT (localStorage) =====
  function loadAllProjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveAllProjects(projects) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  function getActiveProjectId() {
    return localStorage.getItem(ACTIVE_KEY);
  }

  function setActiveProjectId(id) {
    localStorage.setItem(ACTIVE_KEY, id);
    state.activeProjectId = id;
  }

  function saveCurrentProject() {
    if (!state.activeProjectId) return;
    const projects = loadAllProjects();
    const idx = projects.findIndex(p => p.id === state.activeProjectId);
    if (idx === -1) return;
    projects[idx].components = deepClone(state.components);
    projects[idx].canvasBg = state.canvasBg || '';
    projects[idx].pageAlignment = state.pageAlignment || 'center';
    projects[idx].pageTitle = state.pageTitle || '';
    projects[idx].googleAnalyticsId = state.googleAnalyticsId || '';
    projects[idx].favicon = state.favicon || '';
    projects[idx].faviconType = state.faviconType || '';
    projects[idx].updatedAt = Date.now();
    saveAllProjects(projects);
  }

  function createNewProject(name) {
    const projects = loadAllProjects();
    const project = {
      id: projId(),
      name: name || 'Untitled Project',
      components: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    projects.unshift(project);
    saveAllProjects(projects);
    return project;
  }

  function openProject(id) {
    const projects = loadAllProjects();
    const project = projects.find(p => p.id === id);
    if (!project) return;

    // Save current first
    saveCurrentProject();

    setActiveProjectId(id);
    state.components = deepClone(project.components || []);
    state.canvasBg = project.canvasBg || '';
    state.pageAlignment = project.pageAlignment || 'center';
    state.pageTitle = project.pageTitle || '';
    state.googleAnalyticsId = project.googleAnalyticsId || '';
    state.favicon = project.favicon || '';
    state.faviconType = project.faviconType || '';
    state.selectedId = null;
    state.history = [];
    state.historyIndex = -1;
    pushHistory();
    renderCanvas();
    renderStylesPanel();
    updateProjectNameUI();
    updateGaTag();
    updateExportDropdown();
  }

  function deleteProject(id) {
    let projects = loadAllProjects();
    projects = projects.filter(p => p.id !== id);
    saveAllProjects(projects);

    // If we deleted the active project, switch to another or create new
    if (state.activeProjectId === id) {
      if (projects.length > 0) {
        openProject(projects[0].id);
      } else {
        const newProj = createNewProject();
        openProject(newProj.id);
      }
    }
  }

  function duplicateProject(id) {
    const projects = loadAllProjects();
    const source = projects.find(p => p.id === id);
    if (!source) return;
    const dup = {
      id: projId(),
      name: source.name + ' (Copy)',
      components: deepClone(source.components || []),
      canvasBg: source.canvasBg || '',
      pageAlignment: source.pageAlignment || 'center',
      pageTitle: source.pageTitle || '',
      googleAnalyticsId: source.googleAnalyticsId || '',
      favicon: source.favicon || '',
      faviconType: source.faviconType || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    projects.unshift(dup);
    saveAllProjects(projects);
    return dup;
  }

  function renameProject(id, newName) {
    const projects = loadAllProjects();
    const project = projects.find(p => p.id === id);
    if (!project) return;
    project.name = newName;
    project.updatedAt = Date.now();
    saveAllProjects(projects);
    if (id === state.activeProjectId) {
      updateProjectNameUI();
    }
  }

  function updateProjectNameUI() {
    const projects = loadAllProjects();
    const project = projects.find(p => p.id === state.activeProjectId);
    const nameEl = document.getElementById('projectName');
    if (nameEl && project) {
      nameEl.textContent = project.name;
    }
  }

  function initProjectSystem() {
    let projects = loadAllProjects();
    let activeId = getActiveProjectId();

    // If no projects exist, create a default one
    if (projects.length === 0) {
      const proj = createNewProject('Untitled Project');
      activeId = proj.id;
    }

    // If active project doesn't exist, use the first one
    if (!projects.find(p => p.id === activeId)) {
      projects = loadAllProjects();
      activeId = projects[0]?.id;
    }

    if (activeId) {
      setActiveProjectId(activeId);
      const project = loadAllProjects().find(p => p.id === activeId);
      if (project) {
        state.components = deepClone(project.components || []);
        state.canvasBg = project.canvasBg || '';
        state.pageAlignment = project.pageAlignment || 'center';
        state.pageTitle = project.pageTitle || '';
        state.googleAnalyticsId = project.googleAnalyticsId || '';
        state.favicon = project.favicon || '';
        state.faviconType = project.faviconType || '';
      }
    }

    updateProjectNameUI();
  }

  // Auto-save debounce
  let autoSaveTimer = null;
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => saveCurrentProject(), 500);
  }

  // ===== HISTORY =====
  function pushHistory() {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(deepClone(state.components));
    state.historyIndex = state.history.length - 1;
    if (state.history.length > 50) {
      state.history.shift();
      state.historyIndex--;
    }
    scheduleAutoSave();
  }

  function undo() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      state.components = deepClone(state.history[state.historyIndex]);
      state.selectedId = null;
      renderCanvas();
      renderStylesPanel();
      scheduleAutoSave();
    }
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      state.components = deepClone(state.history[state.historyIndex]);
      state.selectedId = null;
      renderCanvas();
      renderStylesPanel();
      scheduleAutoSave();
    }
  }
