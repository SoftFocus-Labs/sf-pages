// ============================================================
// Masterpager — Drag & Drop Landing Page Builder
// ============================================================

(function () {
  'use strict';

  // ===== CONSTANTS =====
  const STORAGE_KEY = 'masterpager_projects';
  const ACTIVE_KEY = 'masterpager_active';

  // ===== STATE =====
  const state = {
    components: [],
    selectedId: null,
    activeTab: 'visual',
    codeTab: 'html',
    history: [],
    historyIndex: -1,
    iconPickerCallback: null,
    activeProjectId: null,
    canvasBg: '',
    pageAlignment: 'center',
    pageTitle: '',
  };

  // ===== COMPONENT DEFINITIONS =====
  const COMPONENT_DEFS = {
    section: {
      label: 'Section',
      container: true,
      defaultStyles: { padding: '40px 24px', backgroundColor: '' },
    },
    row: {
      label: 'Row',
      container: true,
      defaultStyles: { padding: '16px' },
    },
    'columns-2': {
      label: '2 Columns',
      container: true,
      columns: 2,
      defaultStyles: { display: 'flex', gap: '16px', padding: '16px' },
    },
    'columns-3': {
      label: '3 Columns',
      container: true,
      columns: 3,
      defaultStyles: { display: 'flex', gap: '16px', padding: '16px' },
    },
    'columns-4': {
      label: '4 Columns',
      container: true,
      columns: 4,
      defaultStyles: { display: 'flex', gap: '16px', padding: '16px' },
    },
    column: {
      label: 'Column',
      container: true,
      defaultStyles: { flex: '1', minHeight: '60px' },
    },
    heading: {
      label: 'Heading',
      editable: true,
      defaultContent: 'Your Heading Here',
      defaultStyles: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', padding: '8px 16px' },
    },
    text: {
      label: 'Text',
      editable: true,
      defaultContent: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      defaultStyles: { fontSize: '16px', color: '#4a4a6a', lineHeight: '1.6', padding: '8px 16px' },
    },
    image: {
      label: 'Image',
      defaultProps: { src: '', alt: 'Image', imageFit: 'contain' },
      defaultStyles: { padding: '8px 16px' },
    },
    button: {
      label: 'Button',
      defaultProps: { text: 'Click Me', href: '#' },
      defaultStyles: {
        padding: '8px 16px',
        buttonBg: '#027ac4',
        buttonColor: '#ffffff',
        buttonPadding: '12px 28px',
        buttonRadius: '6px',
        fontSize: '15px',
        fontWeight: '600',
      },
    },
    icon: {
      label: 'Icon',
      defaultProps: { iconName: 'star' },
      defaultStyles: {
        padding: '8px 16px',
        textAlign: 'center',
        iconSize: '40px',
        color: '#027ac4',
      },
    },
    svg: {
      label: 'Vector',
      defaultProps: { svgCode: '' },
      defaultStyles: { padding: '8px 16px', textAlign: 'center' },
    },
    embed: {
      label: 'Embed',
      defaultProps: { embedCode: '' },
      defaultStyles: { padding: '8px 16px' },
    },
    divider: {
      label: 'Divider',
      defaultStyles: { padding: '8px 16px', borderColor: '#e0e0f0', borderWidth: '2px' },
    },
    spacer: {
      label: 'Spacer',
      defaultStyles: { height: '40px' },
    },
    calendly: {
      label: 'Calendly',
      defaultProps: { calendlyUrl: '' },
      defaultStyles: { padding: '8px 16px' },
    },
  };

  const FONT_OPTIONS = [
    'Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display',
    'Poppins', 'Raleway', 'Oswald', 'Merriweather', 'PT Sans', 'PT Serif',
    'Nunito', 'Nunito Sans', 'Ubuntu', 'Rubik', 'Work Sans', 'Fira Sans',
    'Barlow', 'Quicksand', 'Mulish', 'Karla', 'Libre Baskerville',
    'Crimson Text', 'Josefin Sans', 'Cabin', 'Archivo', 'DM Sans',
    'DM Serif Display', 'Space Grotesk', 'Sora', 'Outfit',
    'Plus Jakarta Sans', 'Manrope', 'Bitter', 'Cormorant Garamond',
  ];

  const LUCIDE_ICONS = [
    'activity','airplay','alert-circle','alert-triangle','anchor','archive',
    'arrow-down','arrow-left','arrow-right','arrow-up','at-sign','award',
    'bar-chart-2','battery','bell','bluetooth','bold','book','bookmark',
    'box','briefcase','calendar','camera','check','check-circle','chevron-down',
    'chevron-left','chevron-right','chevron-up','circle','clipboard','clock',
    'cloud','code','coffee','command','compass','copy','cpu','credit-card',
    'crop','crosshair','database','dollar-sign','download','droplet',
    'edit','external-link','eye','facebook','fast-forward','feather',
    'file','film','filter','flag','folder','gift','github','globe',
    'grid-3x3','hash','headphones','heart','help-circle','home','image','inbox',
    'info','key','layers','layout','life-buoy','link','list',
    'lock','log-in','log-out','mail','map','map-pin','maximize','menu',
    'message-circle','message-square','mic','minimize','minus','monitor','moon',
    'more-horizontal','more-vertical','mouse-pointer','move','music',
    'octagon','package','paperclip','pause','pen-tool','percent','phone',
    'pie-chart','play','plus','pocket','power','printer','radio','refresh-cw',
    'repeat','rewind','rotate-cw','rss','save','scissors','search','send',
    'server','settings','share-2','shield','shopping-bag','shopping-cart','shuffle',
    'sidebar','skip-back','skip-forward','slash','sliders','smartphone',
    'smile','speaker','square','star','stop-circle','sun','sunrise','sunset',
    'tablet','tag','target','terminal','thermometer','thumbs-down','thumbs-up',
    'toggle-left','toggle-right','trash-2','trending-down','trending-up','triangle',
    'truck','tv','type','umbrella','underline','unlock','upload',
    'user','users','video','voicemail','volume-2','watch','wifi','wind',
    'x','zap','zoom-in','zoom-out','rocket','flame','sparkles','wand-2',
    'palette','brush','pen','newspaper','megaphone','crown','gem','trophy',
    'graduation-cap','building-2','store','car','plane','bike',
    'trees','mountain','waves',
  ];

  // ===== UTILITIES =====
  let idCounter = 0;
  function uid() { return 'c' + (++idCounter) + '_' + Math.random().toString(36).slice(2, 7); }
  function projId() { return 'p' + Date.now() + '_' + Math.random().toString(36).slice(2, 7); }

  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function findComponent(id, tree) {
    for (const comp of tree) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponent(id, comp.children);
        if (found) return found;
      }
    }
    return null;
  }

  function findParent(id, tree, parent) {
    for (const comp of tree) {
      if (comp.id === id) return { parent, list: tree };
      if (comp.children) {
        const found = findParent(id, comp.children, comp);
        if (found) return found;
      }
    }
    return null;
  }

  function removeComponent(id, tree) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === id) {
        return tree.splice(i, 1)[0];
      }
      if (tree[i].children) {
        const removed = removeComponent(id, tree[i].children);
        if (removed) return removed;
      }
    }
    return null;
  }

  function getAncestors(id, tree, path) {
    path = path || [];
    for (const comp of tree) {
      if (comp.id === id) return [...path, comp];
      if (comp.children) {
        const found = getAncestors(id, comp.children, [...path, comp]);
        if (found) return found;
      }
    }
    return null;
  }

  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return d.toLocaleDateString();
  }

  // ===== TOAST =====
  function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type || 'success'}`;
    const iconName = type === 'error' ? 'alert-circle' : 'check-circle';
    toast.innerHTML = `<i data-lucide="${iconName}"></i><span>${escHtml(message)}</span>`;
    document.body.appendChild(toast);
    lucide.createIcons({ nodes: [toast] });

    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

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
    state.selectedId = null;
    state.history = [];
    state.historyIndex = -1;
    pushHistory();
    renderCanvas();
    renderStylesPanel();
    updateProjectNameUI();
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

  // ===== COMPONENT FACTORY =====
  function createComponent(type) {
    const def = COMPONENT_DEFS[type];
    if (!def) return null;

    const comp = {
      id: uid(),
      type,
      styles: { ...(def.defaultStyles || {}) },
      props: { ...(def.defaultProps || {}) },
      content: def.defaultContent || '',
      children: null,
    };

    if (def.container) {
      comp.children = [];
    }

    if (def.columns) {
      comp.children = [];
      for (let i = 0; i < def.columns; i++) {
        comp.children.push(createComponent('column'));
      }
    }

    return comp;
  }

  // ===== DOM REFERENCES =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const canvasEl = $('#canvas');
  const canvasEmpty = $('#canvasEmpty');
  const stylesPanelBody = $('#stylesPanelBody');
  const codeTextarea = $('#codeTextarea');
  const breadcrumbEl = $('#breadcrumb');
  const canvasBgInput = $('#canvasBgInput');
  const canvasBgReset = $('#canvasBgReset');

  // ===== CUSTOM SELECT COMPONENT =====
  let activeDropdown = null;

  function createCustomSelect(options, currentValue, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'mp-select-wrapper';

    const selectedOption = options.find(o => o.value === currentValue) || options[0];

    const trigger = document.createElement('button');
    trigger.className = 'mp-select-trigger';
    trigger.type = 'button';
    trigger.innerHTML = `
      <span class="trigger-text">${escHtml(selectedOption ? selectedOption.label : '')}</span>
      <svg class="trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    `;

    const dropdown = document.createElement('div');
    dropdown.className = 'mp-select-dropdown';

    options.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'mp-select-option' + (opt.value === currentValue ? ' selected' : '');
      item.dataset.value = opt.value;
      item.innerHTML = `
        <svg class="option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        <span>${escHtml(opt.label)}</span>
      `;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        trigger.querySelector('.trigger-text').textContent = opt.label;
        dropdown.querySelectorAll('.mp-select-option').forEach(o => o.classList.remove('selected'));
        item.classList.add('selected');
        closeDropdown();
        onChange(opt.value);
      });
      dropdown.appendChild(item);
    });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains('visible')) {
        closeDropdown();
      } else {
        if (activeDropdown) closeDropdown();
        dropdown.classList.add('visible');
        trigger.classList.add('open');
        activeDropdown = { dropdown, trigger };
      }
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);
    return wrapper;
  }

  function closeDropdown() {
    if (activeDropdown) {
      activeDropdown.dropdown.classList.remove('visible');
      activeDropdown.trigger.classList.remove('open');
      activeDropdown = null;
    }
  }

  document.addEventListener('click', () => closeDropdown());

  // ===== CUSTOM CONFIRM MODAL =====
  function showConfirmModal(title, message, onConfirm, confirmLabel) {
    const modal = $('#confirmModal');
    $('#confirmTitle').textContent = title;
    $('#confirmMessage').textContent = message;
    const okBtn = $('#confirmOk');
    okBtn.textContent = confirmLabel || 'Confirm';
    modal.classList.remove('hidden');

    const cleanup = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      closeBtn.removeEventListener('click', handleCancel);
    };

    const handleOk = () => { cleanup(); onConfirm(); };
    const handleCancel = () => { cleanup(); };

    const cancelBtn = $('#confirmCancel');
    const closeBtn = $('#closeConfirm');

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
  }

  // ===== CODE BETA WARNING =====
  let codeBetaWarningShown = false;

  function showCodeBetaWarning(onProceed, onGoBack) {
    const modal = $('#codeBetaModal');
    const riskyBtn = $('#codeBetaRisky');
    const backBtn = $('#codeBetaBack');
    const closeBtn = $('#closeCodeBeta');
    modal.classList.remove('hidden');

    const cleanup = () => {
      modal.classList.add('hidden');
      riskyBtn.removeEventListener('click', handleRisky);
      backBtn.removeEventListener('click', handleBack);
      closeBtn.removeEventListener('click', handleBack);
    };

    const handleRisky = () => { cleanup(); codeBetaWarningShown = true; onProceed(); };
    const handleBack = () => { cleanup(); onGoBack(); };

    riskyBtn.addEventListener('click', handleRisky);
    backBtn.addEventListener('click', handleBack);
    closeBtn.addEventListener('click', handleBack);
  }

  // ===== CALENDLY MODAL =====
  let calendlyCallback = null;

  function showCalendlyModal(onConfirm, onCancel) {
    const modal = $('#calendlyModal');
    const input = $('#calendlyUrlInput');
    const okBtn = $('#calendlyOk');
    const cancelBtn = $('#calendlyCancel');
    const closeBtn = $('#closeCalendly');
    input.value = '';
    modal.classList.remove('hidden');
    input.focus();

    const cleanup = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      closeBtn.removeEventListener('click', handleCancel);
      input.removeEventListener('keydown', handleKey);
    };

    const handleOk = () => { cleanup(); onConfirm(input.value.trim()); };
    const handleCancel = () => { cleanup(); if (onCancel) onCancel(); };
    const handleKey = (e) => { if (e.key === 'Enter') handleOk(); if (e.key === 'Escape') handleCancel(); };

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
    input.addEventListener('keydown', handleKey);
  }

  // ===== RENDER CANVAS =====
  function applyCanvasBg() {
    if (state.canvasBg) {
      canvasEl.style.backgroundColor = state.canvasBg;
      canvasBgInput.value = rgbToHex(state.canvasBg);
    } else {
      canvasEl.style.backgroundColor = '';
      canvasBgInput.value = '#f8f9fc';
    }
  }

  function rgbToHex(color) {
    if (!color) return '#f8f9fc';
    if (color.startsWith('#')) {
      // Ensure it's a valid 6-char hex
      if (color.length === 4) return '#' + color[1]+color[1] + color[2]+color[2] + color[3]+color[3];
      return color.length >= 7 ? color.slice(0, 7) : color;
    }
    // Parse rgb/rgba
    const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return '#' + r + g + b;
    }
    return '#f8f9fc';
  }

  function renderCanvas() {
    canvasEl.querySelectorAll('.comp-wrapper, .drop-indicator').forEach(el => el.remove());

    if (state.components.length === 0) {
      canvasEmpty.classList.remove('hidden');
    } else {
      canvasEmpty.classList.add('hidden');
      state.components.forEach(comp => {
        canvasEl.appendChild(renderComponentEl(comp));
      });
    }

    applyCanvasBg();
    lucide.createIcons();
    updateBreadcrumb();
    updateCodeEditor();
  }

  function renderComponentEl(comp) {
    const def = COMPONENT_DEFS[comp.type];
    const wrapper = document.createElement('div');
    wrapper.className = 'comp-wrapper';
    wrapper.dataset.componentId = comp.id;
    if (comp.id === state.selectedId) wrapper.classList.add('selected');

    if (comp.type === 'column') {
      wrapper.classList.add('is-column');
    }

    const label = document.createElement('div');
    label.className = 'comp-label';
    label.textContent = def.label;
    wrapper.appendChild(label);

    const actions = document.createElement('div');
    actions.className = 'comp-actions';
    actions.innerHTML = `
      <button class="duplicate-btn" title="Duplicate"><i data-lucide="copy"></i></button>
      <button class="move-up-btn" title="Move Up"><i data-lucide="chevron-up"></i></button>
      <button class="move-down-btn" title="Move Down"><i data-lucide="chevron-down"></i></button>
      <button class="delete-btn" title="Delete"><i data-lucide="trash-2"></i></button>
    `;
    wrapper.appendChild(actions);

    const inner = document.createElement('div');
    inner.className = `comp-${comp.type.replace('columns-', 'columns')}`;
    applyStylesToElement(inner, comp);

    switch (comp.type) {
      case 'section':
      case 'row':
        inner.classList.add('container-drop-zone');
        if (comp.children && comp.children.length === 0) inner.classList.add('empty-container');
        if (comp.children) comp.children.forEach(child => inner.appendChild(renderComponentEl(child)));
        setupDropZone(inner, comp.id);
        break;

      case 'columns-2':
      case 'columns-3':
      case 'columns-4':
        inner.className = 'comp-columns';
        applyStylesToElement(inner, comp);
        if (comp.children) comp.children.forEach(child => inner.appendChild(renderComponentEl(child)));
        break;

      case 'column':
        inner.className = 'comp-column container-drop-zone';
        applyStylesToElement(inner, comp);
        if (comp.children && comp.children.length === 0) inner.classList.add('empty-container');
        if (comp.children) comp.children.forEach(child => inner.appendChild(renderComponentEl(child)));
        setupDropZone(inner, comp.id);
        break;

      case 'heading':
        if (comp.content.includes('\n')) {
          inner.innerHTML = escHtml(comp.content).replace(/\n/g, '<br>');
        } else {
          inner.textContent = comp.content;
        }
        if (comp.id === state.selectedId) {
          inner.setAttribute('contenteditable', 'true');
          inner.addEventListener('input', () => { comp.content = inner.innerText; });
          inner.addEventListener('blur', () => { pushHistory(); });
        }
        break;

      case 'text':
        if (comp.content.includes('\n')) {
          inner.innerHTML = escHtml(comp.content).replace(/\n/g, '<br>');
        } else {
          inner.textContent = comp.content;
        }
        if (comp.id === state.selectedId) {
          inner.setAttribute('contenteditable', 'true');
          inner.addEventListener('input', () => { comp.content = inner.innerText; });
          inner.addEventListener('blur', () => { pushHistory(); });
        }
        break;

      case 'image':
        if (comp.props.src) {
          const img = document.createElement('img');
          img.src = comp.props.src;
          img.alt = comp.props.alt || 'Image';
          const fit = comp.props.imageFit || 'contain';
          img.style.width = comp.styles.width || '100%';
          if (comp.styles.height) img.style.height = comp.styles.height;
          if (fit === 'cover') img.style.objectFit = 'cover';
          inner.appendChild(img);
        } else {
          inner.innerHTML = `<div class="image-placeholder"><i data-lucide="image"></i><span>Set image URL in styles panel</span></div>`;
        }
        break;

      case 'button': {
        const btn = document.createElement('a');
        btn.textContent = comp.props.text || 'Click Me';
        btn.href = '#';
        btn.onclick = (e) => e.preventDefault();
        btn.style.background = comp.styles.buttonBg || '#027ac4';
        btn.style.color = comp.styles.buttonColor || '#ffffff';
        btn.style.padding = comp.styles.buttonPadding || '12px 28px';
        btn.style.borderRadius = comp.styles.buttonRadius || '6px';
        btn.style.fontSize = comp.styles.fontSize || '15px';
        btn.style.fontWeight = comp.styles.fontWeight || '600';
        if (comp.styles.buttonSizing === 'fill') {
          btn.style.display = 'block';
          btn.style.width = '100%';
          btn.style.textAlign = 'center';
          btn.style.boxSizing = 'border-box';
        } else {
          btn.style.display = 'inline-block';
        }
        btn.style.textDecoration = 'none';
        btn.style.fontFamily = comp.styles.fontFamily || 'inherit';
        inner.appendChild(btn);
        break;
      }

      case 'icon': {
        const iconName = comp.props.iconName || 'star';
        inner.innerHTML = `<i data-lucide="${iconName}"></i>`;
        const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
        inner.style.justifyContent = alignMap[comp.styles.textAlign] || 'center';
        const svgParent = inner;
        setTimeout(() => {
          lucide.createIcons({ nodes: [svgParent] });
          const svg = svgParent.querySelector('svg');
          if (svg) {
            svg.style.width = comp.styles.iconSize || '40px';
            svg.style.height = comp.styles.iconSize || '40px';
            svg.style.color = comp.styles.color || '#027ac4';
          }
        }, 0);
        break;
      }

      case 'svg':
        if (comp.props.svgCode) {
          inner.innerHTML = comp.props.svgCode;
          const svgEl = inner.querySelector('svg');
          if (svgEl) {
            if (comp.styles.width) svgEl.style.width = comp.styles.width;
            if (comp.styles.height) svgEl.style.height = comp.styles.height;
            svgEl.style.maxWidth = '100%';
            svgEl.style.display = 'block';
            const align = comp.styles.textAlign || 'center';
            if (align === 'center') svgEl.style.margin = '0 auto';
            else if (align === 'right') svgEl.style.margin = '0 0 0 auto';
            else svgEl.style.margin = '0';
          }
        } else {
          inner.innerHTML = `<div class="svg-placeholder"><i data-lucide="shapes"></i><span>Upload or paste SVG in styles panel</span></div>`;
        }
        break;

      case 'embed':
        if (comp.props.embedCode) {
          inner.innerHTML = comp.props.embedCode;
        } else {
          inner.innerHTML = `<div class="embed-placeholder"><i data-lucide="code"></i><span>Paste embed code in styles panel</span></div>`;
        }
        break;

      case 'calendly':
        if (comp.props.calendlyUrl) {
          const iframe = document.createElement('iframe');
          iframe.src = comp.props.calendlyUrl;
          iframe.style.width = '100%';
          iframe.style.height = comp.styles.height || '660px';
          iframe.style.border = 'none';
          iframe.style.borderRadius = '8px';
          inner.appendChild(iframe);
        } else {
          inner.innerHTML = `<div class="calendly-placeholder"><i data-lucide="calendar"></i><span>Set Calendly URL in styles panel</span></div>`;
        }
        break;

      case 'divider': {
        const hr = document.createElement('hr');
        hr.style.borderColor = comp.styles.borderColor || '#e0e0f0';
        hr.style.borderWidth = comp.styles.borderWidth || '2px';
        hr.style.borderStyle = 'solid';
        hr.style.borderBottom = 'none';
        if (comp.styles.maxWidth) hr.style.maxWidth = comp.styles.maxWidth;
        if (comp.styles.width) hr.style.width = comp.styles.width;
        inner.appendChild(hr);
        break;
      }

      case 'spacer':
        break;
    }

    wrapper.appendChild(inner);

    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.selectedId !== comp.id) {
        selectComponent(comp.id);
      }
    });

    wrapper.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteComponent(comp.id); });
    wrapper.querySelector('.duplicate-btn').addEventListener('click', (e) => { e.stopPropagation(); duplicateComponent(comp.id); });
    wrapper.querySelector('.move-up-btn').addEventListener('click', (e) => { e.stopPropagation(); moveComponent(comp.id, -1); });
    wrapper.querySelector('.move-down-btn').addEventListener('click', (e) => { e.stopPropagation(); moveComponent(comp.id, 1); });

    return wrapper;
  }

  function applyStylesToElement(el, comp) {
    const s = comp.styles;
    const skip = ['buttonBg', 'buttonColor', 'buttonPadding', 'buttonRadius', 'buttonSizing', 'iconSize', 'borderColor', 'borderWidth'];
    const cssMap = {
      padding: 'padding', paddingTop: 'paddingTop', paddingRight: 'paddingRight', paddingBottom: 'paddingBottom', paddingLeft: 'paddingLeft', margin: 'margin', backgroundColor: 'backgroundColor',
      color: 'color', fontSize: 'fontSize', fontWeight: 'fontWeight',
      fontFamily: 'fontFamily', fontStyle: 'fontStyle', textAlign: 'textAlign',
      lineHeight: 'lineHeight', letterSpacing: 'letterSpacing',
      display: 'display', flexDirection: 'flexDirection',
      justifyContent: 'justifyContent', alignItems: 'alignItems',
      gap: 'gap', flex: 'flex', minHeight: 'minHeight',
      width: 'width', height: 'height', maxWidth: 'maxWidth', maxHeight: 'maxHeight',
      borderRadius: 'borderRadius', opacity: 'opacity',
      backgroundImage: 'backgroundImage', backgroundSize: 'backgroundSize',
      backgroundPosition: 'backgroundPosition',
      borderLeft: 'borderLeft', borderTop: 'borderTop',
      boxShadow: 'boxShadow', overflow: 'overflow', backdropFilter: 'backdropFilter',
      WebkitBackdropFilter: 'webkitBackdropFilter',
    };

    for (const [key, cssProp] of Object.entries(cssMap)) {
      if (s[key] && !skip.includes(key)) el.style[cssProp] = s[key];
    }

    if (s.backgroundColor) el.style.backgroundColor = s.backgroundColor;

    if (comp.type !== 'divider' && comp.type !== 'button') {
      if (s.borderWidth && s.borderWidth !== '0px') {
        el.style.border = `${s.borderWidth} solid ${s.borderColor || '#e0e0f0'}`;
      }
    }
  }

  // ===== SELECTION =====
  function selectComponent(id) {
    state.selectedId = id;
    renderCanvas();
    renderStylesPanel();
  }

  function deselectAll() {
    state.selectedId = null;
    canvasEl.querySelectorAll('.comp-wrapper.selected').forEach(w => w.classList.remove('selected'));
    renderStylesPanel();
    updateBreadcrumb();
  }

  // ===== COMPONENT OPERATIONS =====
  function deleteComponent(id) {
    pushHistory();
    removeComponent(id, state.components);
    if (state.selectedId === id) state.selectedId = null;
    renderCanvas();
    renderStylesPanel();
  }

  function duplicateComponent(id) {
    const info = findParent(id, state.components, null);
    if (!info) return;
    const { list } = info;
    const idx = list.findIndex(c => c.id === id);
    pushHistory();
    const clone = deepClone(list[idx]);
    reassignIds(clone);
    list.splice(idx + 1, 0, clone);
    renderCanvas();
  }

  function reassignIds(comp) {
    comp.id = uid();
    if (comp.children) comp.children.forEach(reassignIds);
  }

  function moveComponent(id, direction) {
    const info = findParent(id, state.components, null);
    if (!info) return;
    const { list } = info;
    const idx = list.findIndex(c => c.id === id);
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= list.length) return;
    pushHistory();
    [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
    renderCanvas();
  }

  // ===== DRAG & DROP =====
  let dragType = null;
  let dragComponentType = null;
  let dragComponentId = null;

  const canvasDropTop = $('#canvasDropTop');
  const canvasDropBottom = $('#canvasDropBottom');

  let isDragging = false;
  let bottomPadScrolled = false;

  function updateDropPads(clientY) {
    const scrollContainer = canvasEl.closest('.canvas-scroll');
    const rect = scrollContainer.getBoundingClientRect();
    const nearTop = clientY - rect.top < 32;
    const nearBottom = rect.bottom - clientY < 32;

    // Don't hide a pad if the user is actively hovering over it
    const hoveringTop = canvasDropTop.classList.contains('drag-hover');
    const hoveringBottom = canvasDropBottom.classList.contains('drag-hover');

    canvasDropTop.classList.toggle('drag-active', nearTop || hoveringTop);
    if (!nearTop && !hoveringTop) canvasDropTop.classList.remove('drag-hover');

    canvasDropBottom.classList.toggle('drag-active', nearBottom || hoveringBottom);
    if (!nearBottom && !hoveringBottom) canvasDropBottom.classList.remove('drag-hover');
  }

  function hideDropPads() {
    canvasDropTop.classList.remove('drag-active', 'drag-hover');
    canvasDropBottom.classList.remove('drag-active', 'drag-hover');
    isDragging = false;
    bottomPadScrolled = false;
  }

  function initPanelDrag() {
    $$('.component-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        dragType = 'new';
        dragComponentType = item.dataset.type;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.textContent = COMPONENT_DEFS[dragComponentType]?.label || item.dataset.type;
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => ghost.remove(), 0);
        isDragging = true;
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        dragType = null;
        dragComponentType = null;
        clearDropIndicators();
        canvasEl.classList.remove('drag-over');
        hideDropPads();
      });
    });
  }

  function setupCanvasDropZone() {
    canvasEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = dragType === 'new' ? 'copy' : 'move';
      if (e.target === canvasEl || e.target === canvasEmpty) {
        canvasEl.classList.add('drag-over');
        showDropIndicator(canvasEl, e.clientY);
      }
    });

    canvasEl.addEventListener('dragleave', (e) => {
      if (!canvasEl.contains(e.relatedTarget)) {
        canvasEl.classList.remove('drag-over');
        clearDropIndicators();
      }
    });

    canvasEl.addEventListener('drop', (e) => {
      e.preventDefault();
      canvasEl.classList.remove('drag-over');
      clearDropIndicators();
      const dropIndex = getDropIndex(canvasEl, e.clientY);

      if (dragType === 'new' && dragComponentType) {
        if (dragComponentType === 'calendly') {
          const capturedType = dragComponentType;
          showCalendlyModal((url) => {
            pushHistory();
            const comp = createComponent(capturedType);
            if (comp) { comp.props.calendlyUrl = url; state.components.splice(dropIndex, 0, comp); state.selectedId = comp.id; }
            renderCanvas();
            renderStylesPanel();
          });
          return;
        }
        pushHistory();
        const comp = createComponent(dragComponentType);
        if (comp) { state.components.splice(dropIndex, 0, comp); state.selectedId = comp.id; }
      } else if (dragType === 'move' && dragComponentId) {
        pushHistory();
        const comp = removeComponent(dragComponentId, state.components);
        if (comp) state.components.splice(dropIndex, 0, comp);
      }

      renderCanvas();
      renderStylesPanel();
    });

    // Show drop pads based on proximity to top/bottom edges
    canvasEl.closest('.canvas-scroll').addEventListener('dragover', (e) => {
      if (isDragging) updateDropPads(e.clientY);
    });

    // Drop pads above/below canvas
    function setupDropPad(pad, insertIndex) {
      pad.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = dragType === 'new' ? 'copy' : 'move';
        pad.classList.add('drag-hover');
      });
      pad.addEventListener('dragleave', (e) => {
        if (!pad.contains(e.relatedTarget)) pad.classList.remove('drag-hover');
      });
      pad.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        pad.classList.remove('drag-hover');
        const idx = typeof insertIndex === 'function' ? insertIndex() : insertIndex;

        if (dragType === 'new' && dragComponentType) {
          if (dragComponentType === 'calendly') {
            const capturedType = dragComponentType;
            showCalendlyModal((url) => {
              pushHistory();
              const comp = createComponent(capturedType);
              if (comp) { comp.props.calendlyUrl = url; state.components.splice(idx, 0, comp); state.selectedId = comp.id; }
              renderCanvas();
              renderStylesPanel();
            });
            return;
          }
          pushHistory();
          const comp = createComponent(dragComponentType);
          if (comp) { state.components.splice(idx, 0, comp); state.selectedId = comp.id; }
        } else if (dragType === 'move' && dragComponentId) {
          pushHistory();
          const comp = removeComponent(dragComponentId, state.components);
          if (comp) state.components.splice(idx, 0, comp);
        }

        renderCanvas();
        renderStylesPanel();
      });
    }

    setupDropPad(canvasDropTop, 0);
    setupDropPad(canvasDropBottom, () => state.components.length);

    // Scroll to bottom when dragging into the bottom drop pad
    canvasDropBottom.addEventListener('dragover', () => {
      if (!bottomPadScrolled) {
        bottomPadScrolled = true;
        const scrollContainer = canvasEl.closest('.canvas-scroll');
        setTimeout(() => {
          scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
        }, 210);
      }
    });

    // Deselect when clicking dead space around or on the canvas (not on a component)
    canvasEl.closest('.canvas-scroll').addEventListener('click', (e) => {
      if (e.target.closest('.comp-wrapper')) return;
      deselectAll();
    });
  }

  function setupDropZone(el, parentId) {
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = dragType === 'new' ? 'copy' : 'move';
      el.classList.add('drag-over-container');
      const parent = findComponent(parentId, state.components);
      if (parent && parent.children) showDropIndicator(el, e.clientY);
    });

    el.addEventListener('dragleave', (e) => {
      if (!el.contains(e.relatedTarget)) {
        el.classList.remove('drag-over-container');
        clearDropIndicators(el);
      }
    });

    el.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove('drag-over-container');
      clearDropIndicators(el);

      const parent = findComponent(parentId, state.components);
      if (!parent || !parent.children) return;
      const dropIndex = getDropIndex(el, e.clientY);

      if (dragType === 'new' && dragComponentType) {
        if (dragComponentType === 'column') return;
        if (dragComponentType === 'calendly') {
          const capturedType = dragComponentType;
          showCalendlyModal((url) => {
            pushHistory();
            const comp = createComponent(capturedType);
            if (comp) { comp.props.calendlyUrl = url; parent.children.splice(dropIndex, 0, comp); state.selectedId = comp.id; }
            renderCanvas();
            renderStylesPanel();
          });
          return;
        }
        pushHistory();
        const comp = createComponent(dragComponentType);
        if (comp) { parent.children.splice(dropIndex, 0, comp); state.selectedId = comp.id; }
      } else if (dragType === 'move' && dragComponentId) {
        if (dragComponentId === parentId) return;
        pushHistory();
        const comp = removeComponent(dragComponentId, state.components);
        if (comp) parent.children.splice(dropIndex, 0, comp);
      }

      renderCanvas();
      renderStylesPanel();
    });
  }

  function showDropIndicator(container, clientY) {
    clearDropIndicators(container);
    const wrappers = Array.from(container.children).filter(c => c.classList.contains('comp-wrapper'));
    if (wrappers.length === 0) return;

    let insertBefore = null;
    for (const w of wrappers) {
      const rect = w.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) { insertBefore = w; break; }
    }

    const indicator = document.createElement('div');
    indicator.className = 'drop-indicator';
    if (insertBefore) container.insertBefore(indicator, insertBefore);
    else container.appendChild(indicator);
  }

  function clearDropIndicators(scope) {
    const root = scope || document;
    root.querySelectorAll('.drop-indicator').forEach(el => el.remove());
    if (!scope) document.querySelectorAll('.drag-over-container').forEach(el => el.classList.remove('drag-over-container'));
  }

  function getDropIndex(container, clientY) {
    const wrappers = Array.from(container.children).filter(c => c.classList.contains('comp-wrapper'));
    for (let i = 0; i < wrappers.length; i++) {
      const rect = wrappers[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return wrappers.length;
  }

  // ===== STYLES PANEL =====
  function renderStylesPanel() {
    const comp = state.selectedId ? findComponent(state.selectedId, state.components) : null;

    if (!comp) {
      stylesPanelBody.innerHTML = `
        <div class="no-selection">
          <i data-lucide="pointer"></i>
          <p>Select an element to edit its styles</p>
        </div>`;
      lucide.createIcons({ nodes: [stylesPanelBody] });
      return;
    }

    const def = COMPONENT_DEFS[comp.type];
    stylesPanelBody.innerHTML = '';

    if (def.editable) {
      stylesPanelBody.appendChild(buildSection('Content', 'type', 'purple', (body) => {
        body.appendChild(makeRow('Text', () => {
          const ta = document.createElement('textarea');
          ta.className = 'content-edit-area';
          ta.value = comp.content;
          ta.addEventListener('input', () => { comp.content = ta.value; renderCanvas(); });
          ta.addEventListener('blur', () => pushHistory());
          return ta;
        }));
      }));
    }

    if (comp.type === 'button') {
      stylesPanelBody.appendChild(buildSection('Button', 'mouse-pointer-click', 'orange', (body) => {
        body.appendChild(makeRow('Label', () => makeInput(comp.props.text || '', (v) => { comp.props.text = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Link URL', () => makeInput(comp.props.href || '#', (v) => { comp.props.href = v; pushHistory(); renderCanvas(); }, 'https://...')));
        body.appendChild(makeRow('Bg Color', () => makeColorInput(comp.styles.buttonBg || '#027ac4', (v) => { comp.styles.buttonBg = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Text Color', () => makeColorInput(comp.styles.buttonColor || '#ffffff', (v) => { comp.styles.buttonColor = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Padding', () => makeInput(comp.styles.buttonPadding || '12px 28px', (v) => { comp.styles.buttonPadding = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Radius', () => makeInput(comp.styles.buttonRadius || '6px', (v) => { comp.styles.buttonRadius = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Sizing', () => createCustomSelect(
          [{ label: 'Hug Contents', value: 'hug' }, { label: 'Fill Container', value: 'fill' }],
          comp.styles.buttonSizing || 'hug',
          (v) => { comp.styles.buttonSizing = v; pushHistory(); renderCanvas(); }
        )));
      }));
    }

    if (comp.type === 'image') {
      stylesPanelBody.appendChild(buildSection('Image', 'image', 'pink', (body) => {
        body.appendChild(makeRow('URL', () => makeInput(comp.props.src || '', (v) => { comp.props.src = v; pushHistory(); renderCanvas(); }, 'https://...')));
        body.appendChild(makeRow('Alt Text', () => makeInput(comp.props.alt || '', (v) => { comp.props.alt = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Fit', () => createCustomSelect(
          [{ label: 'Contain', value: 'contain' }, { label: 'Cover (Crop)', value: 'cover' }],
          comp.props.imageFit || 'contain',
          (v) => { comp.props.imageFit = v; pushHistory(); renderCanvas(); }
        )));
      }));
    }

    if (comp.type === 'icon') {
      stylesPanelBody.appendChild(buildSection('Icon', 'smile', 'yellow', (body) => {
        body.appendChild(makeRow('Icon', () => {
          const btn = document.createElement('button');
          btn.className = 'pick-icon-btn';
          btn.innerHTML = `<i data-lucide="${comp.props.iconName || 'star'}"></i><span>${comp.props.iconName || 'star'}</span>`;
          btn.addEventListener('click', () => {
            showIconPicker((iconName) => {
              comp.props.iconName = iconName;
              pushHistory();
              renderCanvas();
              renderStylesPanel();
            });
          });
          setTimeout(() => lucide.createIcons({ nodes: [btn] }), 0);
          return btn;
        }));
        body.appendChild(makeRow('Size', () => makeInput(comp.styles.iconSize || '40px', (v) => { comp.styles.iconSize = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Color', () => makeColorInput(comp.styles.color || '#027ac4', (v) => { comp.styles.color = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Align', () => makeAlignGroup(comp.styles.textAlign || 'center', (v) => { comp.styles.textAlign = v; pushHistory(); renderCanvas(); }, { includeJustify: false })));
      }));
    }

    if (comp.type === 'svg') {
      stylesPanelBody.appendChild(buildSection('Vector', 'shapes', 'pink', (body) => {
        body.appendChild(makeRow('Upload', () => {
          const btn = document.createElement('button');
          btn.className = 'svg-upload-btn';
          btn.textContent = 'Upload SVG File';
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = '.svg';
          fileInput.style.display = 'none';
          btn.addEventListener('click', () => fileInput.click());
          fileInput.addEventListener('change', () => {
            const file = fileInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
              comp.props.svgCode = e.target.result;
              pushHistory();
              renderCanvas();
              renderStylesPanel();
            };
            reader.readAsText(file);
          });
          btn.appendChild(fileInput);
          return btn;
        }));
        body.appendChild(makeRow('SVG Code', () => {
          const ta = document.createElement('textarea');
          ta.className = 'content-edit-area';
          ta.value = comp.props.svgCode || '';
          ta.placeholder = 'Paste SVG markup...';
          ta.rows = 6;
          ta.addEventListener('change', () => { comp.props.svgCode = ta.value; pushHistory(); renderCanvas(); });
          return ta;
        }));
        body.appendChild(makeRow('Width', () => makeInput(comp.styles.width || '', (v) => { comp.styles.width = v; pushHistory(); renderCanvas(); }, 'auto')));
        body.appendChild(makeRow('Height', () => makeInput(comp.styles.height || '', (v) => { comp.styles.height = v; pushHistory(); renderCanvas(); }, 'auto')));
        body.appendChild(makeRow('Align', () => makeAlignGroup(comp.styles.textAlign || 'center', (v) => { comp.styles.textAlign = v; pushHistory(); renderCanvas(); }, { includeJustify: false })));
      }));
    }

    if (comp.type === 'embed') {
      stylesPanelBody.appendChild(buildSection('Embed', 'code', 'teal', (body) => {
        body.appendChild(makeRow('Code', () => {
          const ta = document.createElement('textarea');
          ta.className = 'content-edit-area';
          ta.value = comp.props.embedCode || '';
          ta.placeholder = 'Paste HTML embed code...';
          ta.rows = 5;
          ta.addEventListener('change', () => { comp.props.embedCode = ta.value; pushHistory(); renderCanvas(); });
          return ta;
        }));
      }));
    }

    if (comp.type === 'calendly') {
      stylesPanelBody.appendChild(buildSection('Calendly', 'calendar', 'blue', (body) => {
        body.appendChild(makeRow('URL', () => makeInput(comp.props.calendlyUrl || '', (v) => { comp.props.calendlyUrl = v; pushHistory(); renderCanvas(); }, 'https://calendly.com/...')));
        body.appendChild(makeRow('Height', () => makeInput(comp.styles.height || '660px', (v) => { comp.styles.height = v; pushHistory(); renderCanvas(); }, '660px')));
      }));
    }

    if (['heading', 'text', 'button'].includes(comp.type)) {
      stylesPanelBody.appendChild(buildSection('Typography', 'type', 'indigo', (body) => {
        body.appendChild(makeRow('Font', () => {
          const opts = [{ label: 'Default', value: '' }];
          FONT_OPTIONS.forEach(f => opts.push({ label: f, value: `'${f}', sans-serif` }));
          return createCustomSelect(opts, comp.styles.fontFamily || '', (v) => { comp.styles.fontFamily = v; pushHistory(); renderCanvas(); });
        }));
        body.appendChild(makeRow('Size', () => makeInput(comp.styles.fontSize || '', (v) => { comp.styles.fontSize = v; pushHistory(); renderCanvas(); }, '16px')));
        body.appendChild(makeRow('Weight', () => createCustomSelect(
          [{ label: 'Light', value: '300' }, { label: 'Regular', value: '400' }, { label: 'Medium', value: '500' }, { label: 'Semi Bold', value: '600' }, { label: 'Bold', value: '700' }],
          comp.styles.fontWeight || '400', (v) => { comp.styles.fontWeight = v; pushHistory(); renderCanvas(); }
        )));
        body.appendChild(makeRow('Color', () => makeColorInput(comp.styles.color || '#1a1a2e', (v) => { comp.styles.color = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Align', () => makeAlignGroup(comp.styles.textAlign || 'left', (v) => { comp.styles.textAlign = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Line H.', () => makeInput(comp.styles.lineHeight || '', (v) => { comp.styles.lineHeight = v; pushHistory(); renderCanvas(); }, '1.5')));
        body.appendChild(makeRow('Spacing', () => makeInput(comp.styles.letterSpacing || '', (v) => { comp.styles.letterSpacing = v; pushHistory(); renderCanvas(); }, '0px')));
      }));
    }

    if (comp.children && !comp.type.startsWith('columns-')) {
      stylesPanelBody.appendChild(buildSection('Layout', 'layout', 'blue', (body) => {
        body.appendChild(makeRow('Display', () => createCustomSelect([{ label: 'Default', value: '' }, { label: 'Flex', value: 'flex' }, { label: 'Block', value: 'block' }], comp.styles.display || '', (v) => { comp.styles.display = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Direction', () => createCustomSelect([{ label: 'Column', value: 'column' }, { label: 'Row', value: 'row' }], comp.styles.flexDirection || 'column', (v) => { comp.styles.flexDirection = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Justify', () => createCustomSelect([{ label: 'Default', value: '' }, { label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Space Between', value: 'space-between' }, { label: 'Space Around', value: 'space-around' }], comp.styles.justifyContent || '', (v) => { comp.styles.justifyContent = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Align', () => createCustomSelect([{ label: 'Default', value: '' }, { label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Stretch', value: 'stretch' }], comp.styles.alignItems || '', (v) => { comp.styles.alignItems = v; pushHistory(); renderCanvas(); })));
        body.appendChild(makeRow('Gap', () => makeInput(comp.styles.gap || '', (v) => { comp.styles.gap = v; pushHistory(); renderCanvas(); }, '16px')));
      }));
    }

    stylesPanelBody.appendChild(buildSection('Spacing', 'move', 'cyan', (body) => {
      const sideInputs = {};
      const sides = [
        { label: 'Top', key: 'paddingTop' },
        { label: 'Right', key: 'paddingRight' },
        { label: 'Bottom', key: 'paddingBottom' },
        { label: 'Left', key: 'paddingLeft' },
      ];

      function parsePaddingShorthand(val) {
        const parts = val.trim().split(/\s+/);
        if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
        if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
        if (parts.length === 3) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
        return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
      }

      let mainPaddingInput = null;

      function syncSidesFromShorthand(val) {
        if (!val) return;
        const parsed = parsePaddingShorthand(val);
        const map = { paddingTop: parsed.top, paddingRight: parsed.right, paddingBottom: parsed.bottom, paddingLeft: parsed.left };
        sides.forEach(({ key }) => {
          comp.styles[key] = map[key];
          if (sideInputs[key]) sideInputs[key].value = map[key];
        });
      }

      function syncShorthandFromSides() {
        const t = comp.styles.paddingTop || '0px';
        const r = comp.styles.paddingRight || '0px';
        const b = comp.styles.paddingBottom || '0px';
        const l = comp.styles.paddingLeft || '0px';
        let shorthand;
        if (t === r && r === b && b === l) shorthand = t;
        else if (t === b && r === l) shorthand = t + ' ' + r;
        else if (r === l) shorthand = t + ' ' + r + ' ' + b;
        else shorthand = t + ' ' + r + ' ' + b + ' ' + l;
        comp.styles.padding = shorthand;
        if (mainPaddingInput) mainPaddingInput.value = shorthand;
      }

      body.appendChild(makeRow('Padding', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'mp-input';
        input.value = comp.styles.padding || '';
        input.placeholder = '8px 16px';
        input.addEventListener('change', () => {
          input.value = autoUnit(input.value);
          comp.styles.padding = input.value;
          syncSidesFromShorthand(input.value);
          pushHistory(); renderCanvas();
        });
        mainPaddingInput = input;
        return input;
      }));

      const padGrid = document.createElement('div');
      padGrid.className = 'padding-sides-grid';
      sides.forEach(({ label, key }) => {
        const cell = document.createElement('div');
        cell.className = 'padding-side-cell';
        const lbl = document.createElement('label');
        lbl.textContent = label;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'mp-input';
        input.value = comp.styles[key] || '';
        input.placeholder = '–';
        input.addEventListener('change', () => {
          input.value = autoUnit(input.value);
          comp.styles[key] = input.value;
          syncShorthandFromSides();
          pushHistory(); renderCanvas();
        });
        sideInputs[key] = input;
        cell.appendChild(lbl);
        cell.appendChild(input);
        padGrid.appendChild(cell);
      });

      // Populate sides from shorthand on initial render if sides are empty
      if (comp.styles.padding && !comp.styles.paddingTop && !comp.styles.paddingRight && !comp.styles.paddingBottom && !comp.styles.paddingLeft) {
        syncSidesFromShorthand(comp.styles.padding);
      }

      body.appendChild(padGrid);
      body.appendChild(makeRow('Margin', () => makeInput(comp.styles.margin || '', (v) => { comp.styles.margin = v; pushHistory(); renderCanvas(); }, '0px')));
    }));

    stylesPanelBody.appendChild(buildSection('Size', 'maximize', 'green', (body) => {
      body.appendChild(makeRow('Width', () => makeSizeInput(comp.styles.width || '', (v) => { comp.styles.width = v; pushHistory(); renderCanvas(); }, 'auto')));
      body.appendChild(makeRow('Height', () => makeSizeInput(comp.styles.height || '', (v) => { comp.styles.height = v; pushHistory(); renderCanvas(); }, 'auto')));
      body.appendChild(makeRow('Max H.', () => makeSizeInput(comp.styles.maxHeight || '', (v) => { comp.styles.maxHeight = v; pushHistory(); renderCanvas(); }, 'none')));
      body.appendChild(makeRow('Max W.', () => makeSizeInput(comp.styles.maxWidth || '', (v) => { comp.styles.maxWidth = v; pushHistory(); renderCanvas(); }, 'none')));
    }));

    stylesPanelBody.appendChild(buildSection('Background', 'palette', 'orange', (body) => {
      body.appendChild(makeRow('Color', () => makeColorInput(comp.styles.backgroundColor || '', (v) => { comp.styles.backgroundColor = v; pushHistory(); renderCanvas(); })));
      body.appendChild(makeRow('Image', () => makeInput(comp.styles.backgroundImage || '', (v) => { comp.styles.backgroundImage = v; pushHistory(); renderCanvas(); }, 'url(...)')));
      body.appendChild(makeRow('Size', () => createCustomSelect([{ label: 'Default', value: '' }, { label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }], comp.styles.backgroundSize || '', (v) => { comp.styles.backgroundSize = v; pushHistory(); renderCanvas(); })));
    }));

    stylesPanelBody.appendChild(buildSection('Border', 'square', 'slate', (body) => {
      body.appendChild(makeRow('Radius', () => makeInput(comp.styles.borderRadius || '', (v) => { comp.styles.borderRadius = v; pushHistory(); renderCanvas(); }, '0px')));
      body.appendChild(makeRow('Width', () => makeInput(comp.styles.borderWidth || '', (v) => { comp.styles.borderWidth = v; pushHistory(); renderCanvas(); }, '0px')));
      body.appendChild(makeRow('Color', () => makeColorInput(comp.styles.borderColor || '#e0e0f0', (v) => { comp.styles.borderColor = v; pushHistory(); renderCanvas(); })));
    }));

    stylesPanelBody.appendChild(buildSection('Effects', 'sparkles', 'pink', (body) => {
      body.appendChild(makeRow('Opacity', () => makeInput(comp.styles.opacity || '', (v) => { comp.styles.opacity = v; pushHistory(); renderCanvas(); }, '1')));
      body.appendChild(makeRow('Shadow', () => makeInput(comp.styles.boxShadow || '', (v) => { comp.styles.boxShadow = v; pushHistory(); renderCanvas(); }, '0 4px 12px rgba(0,0,0,0.1)')));
      body.appendChild(makeRow('Overflow', () => makeInput(comp.styles.overflow || '', (v) => { comp.styles.overflow = v; pushHistory(); renderCanvas(); }, 'hidden')));
      body.appendChild(makeRow('Backdrop', () => makeInput(comp.styles.backdropFilter || '', (v) => { comp.styles.backdropFilter = v; pushHistory(); renderCanvas(); }, 'blur(10px)')));
    }));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger delete-component-btn';
    delBtn.innerHTML = '<i data-lucide="trash-2"></i> Delete Component';
    delBtn.addEventListener('click', () => deleteComponent(comp.id));
    stylesPanelBody.appendChild(delBtn);

    lucide.createIcons({ nodes: [stylesPanelBody] });
  }

  // ===== STYLE PANEL HELPERS =====
  function autoUnit(val) {
    if (!val) return val;
    return val.trim().split(/\s+/).map(part => {
      if (/^-?\d+(\.\d+)?$/.test(part)) return part + 'px';
      return part;
    }).join(' ');
  }

  function buildSection(title, icon, color, populateFn) {
    const section = document.createElement('div');
    section.className = 'style-section';
    const header = document.createElement('div');
    header.className = 'style-section-header';
    header.innerHTML = `<i data-lucide="${icon}" class="sec-icon-${color}"></i><h4>${title}</h4><i data-lucide="chevron-down" class="chevron"></i>`;
    const body = document.createElement('div');
    body.className = 'style-section-body';
    header.addEventListener('click', () => {
      body.classList.toggle('collapsed');
      header.querySelector('.chevron').classList.toggle('collapsed');
    });
    populateFn(body);
    section.appendChild(header);
    section.appendChild(body);
    return section;
  }

  function makeRow(labelText, createControl) {
    const row = document.createElement('div');
    row.className = 'style-row';
    const lbl = document.createElement('label');
    lbl.textContent = labelText;
    const inputWrap = document.createElement('div');
    inputWrap.className = 'style-input';
    inputWrap.appendChild(createControl());
    row.appendChild(lbl);
    row.appendChild(inputWrap);
    return row;
  }

  function autoUnit(v) {
    v = v.trim();
    if (!v || v === 'auto' || v === 'none') return v;
    if (v.includes('rem')) return v;
    if (/^-?\d+(\.\d+)?$/.test(v)) return v + 'px';
    return v;
  }

  function makeSizeInput(value, onChange, placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'size-input-wrapper';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mp-input';
    input.value = value;
    if (placeholder) input.placeholder = placeholder;
    const suffix = document.createElement('span');
    suffix.className = 'size-input-suffix';
    suffix.textContent = value && value.includes('rem') ? 'rem' : 'px';
    suffix.style.display = value && value !== 'auto' && value !== 'none' ? '' : 'none';
    input.addEventListener('change', () => {
      const v = autoUnit(input.value);
      input.value = v;
      if (v && v !== 'auto' && v !== 'none') {
        suffix.textContent = v.includes('rem') ? 'rem' : 'px';
        suffix.style.display = '';
      } else {
        suffix.style.display = 'none';
      }
      onChange(v);
    });
    wrapper.appendChild(input);
    wrapper.appendChild(suffix);
    return wrapper;
  }

  function makeInput(value, onChange, placeholder) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mp-input';
    input.value = value;
    if (placeholder) input.placeholder = placeholder;
    input.addEventListener('change', () => onChange(input.value));
    return input;
  }

  function makeColorInput(value, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'color-input-wrapper';
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = value && value.match(/^#[0-9a-fA-F]{6}$/) ? value : '#ffffff';
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'mp-input';
    textInput.value = value;
    colorInput.addEventListener('input', () => { textInput.value = colorInput.value; onChange(colorInput.value); });
    textInput.addEventListener('change', () => { if (textInput.value.match(/^#[0-9a-fA-F]{6}$/)) colorInput.value = textInput.value; onChange(textInput.value); });
    wrapper.appendChild(colorInput);
    wrapper.appendChild(textInput);
    return wrapper;
  }

  function makeAlignGroup(current, onChange, { includeJustify = true } = {}) {
    const group = document.createElement('div');
    group.className = 'btn-group';
    const options = [{ val: 'left', icon: 'align-left' }, { val: 'center', icon: 'align-center' }, { val: 'right', icon: 'align-right' }];
    if (includeJustify) options.push({ val: 'justify', icon: 'align-justify' });
    options.forEach(a => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = a.val.charAt(0).toUpperCase() + a.val.slice(1);
      btn.innerHTML = `<i data-lucide="${a.icon}"></i>`;
      if (a.val === current) btn.classList.add('active');
      btn.addEventListener('click', () => { group.querySelectorAll('button').forEach(b => b.classList.remove('active')); btn.classList.add('active'); onChange(a.val); });
      group.appendChild(btn);
    });
    return group;
  }

  // ===== BREADCRUMB =====
  function updateBreadcrumb() {
    if (!state.selectedId) { breadcrumbEl.innerHTML = ''; return; }
    const ancestors = getAncestors(state.selectedId, state.components);
    if (!ancestors) return;
    let html = '<span data-select="">Page</span>';
    ancestors.forEach(comp => {
      html += `<span class="sep">/</span><span data-select="${comp.id}">${COMPONENT_DEFS[comp.type].label}</span>`;
    });
    breadcrumbEl.innerHTML = html;
    breadcrumbEl.querySelectorAll('[data-select]').forEach(span => {
      span.addEventListener('click', () => { const id = span.dataset.select; if (id) selectComponent(id); else deselectAll(); });
    });
  }

  // ===== ICON PICKER =====
  function showIconPicker(callback) {
    state.iconPickerCallback = callback;
    const modal = $('#iconPickerModal');
    modal.classList.remove('hidden');
    const search = $('#iconSearch');
    search.value = '';
    search.focus();
    populateIconGrid('');
  }

  function populateIconGrid(filter) {
    const grid = $('#iconGrid');
    const filtered = filter ? LUCIDE_ICONS.filter(name => name.includes(filter.toLowerCase())) : LUCIDE_ICONS;
    grid.innerHTML = filtered.map(name => `<div class="icon-grid-item" data-icon="${name}"><i data-lucide="${name}"></i><span>${name}</span></div>`).join('');
    lucide.createIcons({ nodes: [grid] });
    grid.querySelectorAll('.icon-grid-item').forEach(item => {
      item.addEventListener('click', () => {
        if (state.iconPickerCallback) { state.iconPickerCallback(item.dataset.icon); state.iconPickerCallback = null; }
        $('#iconPickerModal').classList.add('hidden');
      });
    });
  }

  // ===== HTML/CSS IMPORT PARSER =====

  function resolveVars(value, varsMap) {
    if (!value || typeof value !== 'string' || !value.includes('var(')) return value;
    return value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (_, name, fallback) => {
      let resolved = varsMap[name];
      if (resolved !== undefined) {
        // Recursively resolve nested var() references
        return resolveVars(resolved, varsMap);
      }
      if (fallback !== undefined) return fallback.trim();
      return '';
    });
  }

  function stripNestedBlocks(cssText) {
    // Remove @keyframes { ... { ... } ... } and @media { ... { ... } ... } blocks
    let result = '';
    let depth = 0;
    let inAtBlock = false;
    let i = 0;
    while (i < cssText.length) {
      if (!inAtBlock && cssText[i] === '@' && /^@(keyframes|media|supports|font-face)/.test(cssText.slice(i))) {
        inAtBlock = true;
        depth = 0;
        // Skip to first {
        while (i < cssText.length && cssText[i] !== '{') i++;
        depth = 1;
        i++;
        // Skip until matching closing }
        while (i < cssText.length && depth > 0) {
          if (cssText[i] === '{') depth++;
          else if (cssText[i] === '}') depth--;
          i++;
        }
        inAtBlock = false;
      } else {
        result += cssText[i];
        i++;
      }
    }
    return result;
  }

  function parseSimpleCSS(cssText) {
    const rules = {};
    const varsMap = {};
    cssText = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

    // Extract :root variables first
    const rootRegex = /:root\s*\{([^}]+)\}/g;
    let rootMatch;
    while ((rootMatch = rootRegex.exec(cssText))) {
      rootMatch[1].split(';').forEach(prop => {
        const colonIdx = prop.indexOf(':');
        if (colonIdx === -1) return;
        const key = prop.slice(0, colonIdx).trim();
        const value = prop.slice(colonIdx + 1).trim();
        if (key.startsWith('--') && value) {
          varsMap[key] = value;
        }
      });
    }

    // Resolve vars that reference other vars
    for (const key of Object.keys(varsMap)) {
      varsMap[key] = resolveVars(varsMap[key], varsMap);
    }

    // Strip nested @-blocks before regex matching
    const cleaned = stripNestedBlocks(cssText);

    const regex = /([^{]+)\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(cleaned))) {
      const selector = match[1].trim();
      if (selector === ':root') continue;
      const properties = {};
      match[2].split(';').forEach(prop => {
        const colonIdx = prop.indexOf(':');
        if (colonIdx === -1) return;
        const key = prop.slice(0, colonIdx).trim();
        let value = prop.slice(colonIdx + 1).trim();
        if (key && value) {
          value = resolveVars(value, varsMap);
          const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          properties[camelKey] = value;
        }
      });
      if (Object.keys(properties).length > 0) {
        // Handle grouped selectors: "h1, h2, h3 { ... }"
        selector.split(',').forEach(sel => {
          const s = sel.trim();
          // Skip pseudo-selectors (:hover, :focus, :active, :visited, ::before, ::after)
          if (!s || /::?(?:hover|focus|active|visited|before|after|first-child|last-child|nth-child|placeholder)/.test(s)) return;
          rules[s] = { ...(rules[s] || {}), ...properties };
        });
      }
    }

    // Handle animation initial states: if .reveal has opacity:0, check if .reveal.active
    // has opacity:1 and use those values instead (common scroll-reveal pattern)
    for (const sel of Object.keys(rules)) {
      const props = rules[sel];
      if (props.opacity === '0' && props.transform && /translateY/.test(props.transform)) {
        // This looks like a scroll-reveal initial state — look for .active counterpart
        const activeSel = sel + '.active';
        if (rules[activeSel]) {
          // Merge the active state into the base state
          Object.assign(props, rules[activeSel]);
        } else {
          // No active counterpart found — just remove the animation properties
          props.opacity = '1';
          delete props.transform;
        }
      }
    }

    // Attach varsMap to rules for resolving inline styles
    rules.__varsMap = varsMap;
    return rules;
  }

  function elementMatchesSimpleSelector(el, sel) {
    if (!el || el.nodeType !== 1) return false;
    const s = sel.trim();
    if (!s) return false;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';

    // Handle multi-class selectors like ".foo.bar" or "div.foo.bar"
    // Split on '.' but keep track of whether it starts with a tag
    if (s.includes('.') && (s.indexOf('.') > 0 || (s.match(/\./g) || []).length > 1)) {
      const parts = s.split('.');
      const tagPart = parts[0]; // could be empty if starts with '.'
      if (tagPart && tag !== tagPart) return false;
      for (let i = 1; i < parts.length; i++) {
        if (parts[i] && !(el.classList && el.classList.contains(parts[i]))) return false;
      }
      return true;
    }

    if (s.startsWith('#')) return el.id === s.slice(1);
    if (s.startsWith('.')) return el.classList && el.classList.contains(s.slice(1));
    return tag === s;
  }

  function elementMatchesSelector(el, selector) {
    // Handle compound descendant selectors like ".hero-text h1"
    const parts = selector.trim().split(/\s+/);
    if (parts.length === 0) return false;
    // The last part must match the element itself
    if (!elementMatchesSimpleSelector(el, parts[parts.length - 1])) return false;
    if (parts.length === 1) return true;
    // Walk ancestors to match remaining parts (right to left)
    let partIdx = parts.length - 2;
    let ancestor = el.parentElement;
    while (ancestor && partIdx >= 0) {
      if (elementMatchesSimpleSelector(ancestor, parts[partIdx])) {
        partIdx--;
      }
      ancestor = ancestor.parentElement;
    }
    return partIdx < 0;
  }

  function getElementStyles(el, cssRules) {
    const styles = {};
    const id = el.id;
    const classes = Array.from(el.classList || []);
    const tag = el.tagName ? el.tagName.toLowerCase() : '';

    // Apply universal selector (lowest specificity)
    if (cssRules['*']) Object.assign(styles, cssRules['*']);
    // Apply tag rules
    if (cssRules[tag]) Object.assign(styles, cssRules[tag]);
    // Apply class rules
    classes.forEach(cls => {
      if (cssRules['.' + cls]) Object.assign(styles, cssRules['.' + cls]);
    });
    // Apply ID rules
    if (id && cssRules['#' + id]) Object.assign(styles, cssRules['#' + id]);

    // Apply descendant/compound selectors
    for (const selector of Object.keys(cssRules)) {
      if (!selector.includes(' ')) continue; // Simple selectors already handled above
      if (elementMatchesSelector(el, selector)) {
        Object.assign(styles, cssRules[selector]);
      }
    }

    // Parse border shorthand into component properties
    if (styles.border && !styles.borderWidth) {
      const borderMatch = styles.border.match(/^(\d+\S*)\s+(\w+)\s+(.+)$/);
      if (borderMatch) {
        styles.borderWidth = borderMatch[1];
        styles.borderColor = borderMatch[3];
        // Also set individual sides for rendering
        if (!styles.borderLeft) styles.borderLeft = styles.border;
        if (!styles.borderTop) styles.borderTop = styles.border;
      }
    }

    // Inline styles override
    const varsMap = cssRules.__varsMap || {};
    if (el.style) {
      for (let i = 0; i < el.style.length; i++) {
        const prop = el.style[i];
        const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        let val = el.style.getPropertyValue(prop);
        if (val && val.includes('var(')) val = resolveVars(val, varsMap);
        styles[camelProp] = val;
      }
    }
    // Also check the raw style attribute for var() that the browser didn't parse
    const rawStyle = el.getAttribute('style');
    if (rawStyle && rawStyle.includes('var(')) {
      rawStyle.split(';').forEach(part => {
        const colonIdx = part.indexOf(':');
        if (colonIdx === -1) return;
        const key = part.slice(0, colonIdx).trim();
        let value = part.slice(colonIdx + 1).trim();
        if (key && value && value.includes('var(')) {
          value = resolveVars(value, varsMap);
          const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (value) styles[camelKey] = value;
        }
      });
    }
    return styles;
  }

  function elementToComponent(el, cssRules) {
    if (!el || el.nodeType !== 1) return null;
    const tag = el.tagName.toLowerCase();

    // Skip script and style tags
    if (tag === 'script' || tag === 'style' || tag === 'link' || tag === 'meta') return null;

    const elStyles = getElementStyles(el, cssRules);

    // Detect icons: <i data-lucide="...">
    if (tag === 'i' && el.dataset && el.dataset.lucide) {
      return {
        id: uid(),
        type: 'icon',
        props: { iconName: el.dataset.lucide },
        styles: {
          padding: elStyles.padding || '8px 16px',
          textAlign: elStyles.textAlign || 'center',
          iconSize: elStyles.width || elStyles.fontSize || '40px',
          color: elStyles.color || '#027ac4',
        },
        content: '',
        children: null,
      };
    }

    // SVG element (not a lucide icon) → Vector component
    if (tag === 'svg' && !el.classList.contains('lucide')) {
      return {
        id: uid(), type: 'svg',
        props: { svgCode: el.outerHTML },
        styles: {
          padding: elStyles.padding || '8px 16px',
          textAlign: elStyles.textAlign || 'center',
          width: el.getAttribute('width') || '',
          height: el.getAttribute('height') || '',
        },
        content: '', children: null,
      };
    }

    // SVG with data-lucide (already rendered icon)
    if (tag === 'svg' && el.classList.contains('lucide')) {
      const iconClass = Array.from(el.classList).find(c => c.startsWith('lucide-'));
      const iconName = iconClass ? iconClass.replace('lucide-', '') : 'star';
      return {
        id: uid(), type: 'icon', props: { iconName },
        styles: { padding: '8px 16px', textAlign: 'center', iconSize: '40px', color: elStyles.color || '#027ac4' },
        content: '', children: null,
      };
    }

    // Helper: extract text preserving <br> as newlines
    function extractText(element) {
      let text = '';
      for (const node of element.childNodes) {
        if (node.nodeType === 3) { // text node
          text += node.textContent;
        } else if (node.nodeType === 1) { // element node
          const nodeName = node.tagName.toLowerCase();
          if (nodeName === 'br') {
            text += '\n';
          } else {
            text += extractText(node);
          }
        }
      }
      return text.trim();
    }

    // Headings
    if (/^h[1-6]$/.test(tag)) {
      return {
        id: uid(), type: 'heading', props: {},
        styles: {
          fontSize: elStyles.fontSize || (tag === 'h1' ? '36px' : tag === 'h2' ? '28px' : tag === 'h3' ? '24px' : '20px'),
          fontWeight: elStyles.fontWeight || '700',
          color: elStyles.color || '#1a1a2e',
          padding: elStyles.padding || '8px 16px',
          textAlign: elStyles.textAlign || '',
          fontFamily: elStyles.fontFamily || '',
          lineHeight: elStyles.lineHeight || '',
          letterSpacing: elStyles.letterSpacing || '',
          margin: elStyles.margin || '',
          backgroundColor: elStyles.backgroundColor || '',
          borderRadius: elStyles.borderRadius || '',
          maxWidth: elStyles.maxWidth || '',
          opacity: elStyles.opacity || '',
          fontStyle: elStyles.fontStyle || '',
        },
        content: extractText(el),
        children: null,
      };
    }

    // Paragraphs
    if (tag === 'p') {
      return {
        id: uid(), type: 'text', props: {},
        styles: {
          fontSize: elStyles.fontSize || '16px',
          color: elStyles.color || '#4a4a6a',
          lineHeight: elStyles.lineHeight || '1.6',
          padding: elStyles.padding || '8px 16px',
          textAlign: elStyles.textAlign || '',
          fontFamily: elStyles.fontFamily || '',
          fontWeight: elStyles.fontWeight || '',
          letterSpacing: elStyles.letterSpacing || '',
          margin: elStyles.margin || '',
          backgroundColor: elStyles.backgroundColor || '',
          borderRadius: elStyles.borderRadius || '',
          maxWidth: elStyles.maxWidth || '',
          opacity: elStyles.opacity || '',
          fontStyle: elStyles.fontStyle || '',
        },
        content: extractText(el),
        children: null,
      };
    }

    // Images
    if (tag === 'img') {
      return {
        id: uid(), type: 'image',
        props: { src: el.getAttribute('src') || '', alt: el.getAttribute('alt') || 'Image' },
        styles: {
          padding: elStyles.padding || '8px 16px',
          borderRadius: elStyles.borderRadius || '',
          width: elStyles.width || '',
        },
        content: '', children: null,
      };
    }

    // HR = divider
    if (tag === 'hr') {
      return {
        id: uid(), type: 'divider', props: {},
        styles: {
          padding: elStyles.padding || '8px 16px',
          borderColor: elStyles.borderColor || elStyles.borderTopColor || '#e0e0f0',
          borderWidth: elStyles.borderWidth || elStyles.borderTopWidth || '2px',
        },
        content: '', children: null,
      };
    }

    // Calendly iframe
    if (tag === 'iframe' && (el.getAttribute('src') || '').includes('calendly.com')) {
      return {
        id: uid(), type: 'calendly',
        props: { calendlyUrl: el.getAttribute('src') || '' },
        styles: { padding: '8px 16px', height: el.style.height || el.getAttribute('height') || '660px' },
        content: '', children: null,
      };
    }

    // Iframe / embed
    if (tag === 'iframe' || tag === 'embed' || tag === 'object' || tag === 'video') {
      return {
        id: uid(), type: 'embed',
        props: { embedCode: el.outerHTML },
        styles: { padding: '8px 16px' },
        content: '', children: null,
      };
    }

    // Anchor tags — treat as buttons if they have block/inline-block display or button-like classes
    if (tag === 'a') {
      const hasRoundedRadius = elStyles.borderRadius && (parseInt(elStyles.borderRadius) >= 20 || elStyles.borderRadius.includes('50'));
      const hasPadding = elStyles.padding && elStyles.padding !== '0' && elStyles.padding !== '0px';
      const isButton = elStyles.display === 'inline-block' || elStyles.display === 'block' ||
                        Array.from(el.classList).some(c => /btn|button|cta/i.test(c)) ||
                        hasRoundedRadius ||
                        (hasPadding && el.children.length === 0 && el.textContent.trim().length < 50) ||
                        (el.children.length === 0 && el.textContent.trim().length < 50);
      if (isButton) {
        // Detect gradient or solid background
        const bgValue = elStyles.background || elStyles.backgroundColor || '';
        const buttonBg = bgValue.includes('gradient') ? bgValue : (elStyles.backgroundColor || bgValue || '#027ac4');
        return {
          id: uid(), type: 'button',
          props: { text: el.textContent.trim() || 'Click Me', href: el.getAttribute('href') || '#' },
          styles: {
            padding: '8px 16px',
            buttonBg: buttonBg,
            buttonColor: elStyles.color || '#ffffff',
            buttonPadding: elStyles.padding || '12px 28px',
            buttonRadius: elStyles.borderRadius || '6px',
            fontSize: elStyles.fontSize || '15px',
            fontWeight: elStyles.fontWeight || '600',
            fontFamily: elStyles.fontFamily || '',
          },
          content: '', children: null,
        };
      }
    }

    // Button element
    if (tag === 'button') {
      const bgValue = elStyles.background || elStyles.backgroundColor || '';
      const buttonBg = bgValue.includes('gradient') ? bgValue : (elStyles.backgroundColor || bgValue || '#027ac4');
      return {
        id: uid(), type: 'button',
        props: { text: el.textContent.trim() || 'Click Me', href: '#' },
        styles: {
          padding: '8px 16px',
          buttonBg: buttonBg,
          buttonColor: elStyles.color || '#ffffff',
          buttonPadding: elStyles.padding || '12px 28px',
          buttonRadius: elStyles.borderRadius || '6px',
          fontSize: elStyles.fontSize || '15px',
          fontWeight: elStyles.fontWeight || '600',
          fontFamily: elStyles.fontFamily || '',
        },
        content: '', children: null,
      };
    }

    // Input / textarea → embed
    if (tag === 'input' || tag === 'textarea') {
      return {
        id: uid(), type: 'embed',
        props: { embedCode: el.outerHTML },
        styles: { padding: '8px 16px' },
        content: '', children: null,
      };
    }

    // Form → treat like a section container
    if (tag === 'form') {
      const children = parseChildElements(el, cssRules);
      return {
        id: uid(), type: 'section', props: {},
        styles: {
          padding: elStyles.padding || '16px',
          backgroundColor: elStyles.backgroundColor || '',
          display: elStyles.display || '',
          flexDirection: elStyles.flexDirection || '',
          gap: elStyles.gap || '',
          borderRadius: elStyles.borderRadius || '',
          maxWidth: elStyles.maxWidth || '',
        },
        content: '',
        children: children,
      };
    }

    // Section tag
    if (tag === 'section' || tag === 'header' || tag === 'footer' || tag === 'main' || tag === 'article' || tag === 'nav') {
      const children = parseChildElements(el, cssRules);
      // Detect background: check both background and backgroundColor for gradients/colors
      let bgColor = elStyles.backgroundColor || '';
      let bgImage = elStyles.backgroundImage || '';
      if (elStyles.background) {
        if (elStyles.background.includes('gradient')) {
          bgImage = elStyles.background;
        } else if (!bgColor) {
          bgColor = elStyles.background;
        }
      }
      return {
        id: uid(), type: 'section', props: {},
        styles: {
          padding: elStyles.padding || '40px 24px',
          backgroundColor: bgColor,
          backgroundImage: bgImage,
          backgroundSize: elStyles.backgroundSize || '',
          margin: elStyles.margin || '',
          borderRadius: elStyles.borderRadius || '',
          maxWidth: elStyles.maxWidth || '',
          borderLeft: elStyles.borderLeft || '',
          borderTop: elStyles.borderTop || '',
          opacity: elStyles.opacity || '',
          width: elStyles.width || '',
          minHeight: elStyles.minHeight || '',
          display: elStyles.display || '',
          flexDirection: elStyles.flexDirection || '',
          justifyContent: elStyles.justifyContent || '',
          alignItems: elStyles.alignItems || '',
          gap: elStyles.gap || '',
          textAlign: elStyles.textAlign || '',
          boxShadow: elStyles.boxShadow || '',
          overflow: elStyles.overflow || '',
          backdropFilter: elStyles.backdropFilter || '',
        },
        content: '',
        children: children,
      };
    }

    // Div wrapping an HR = divider
    if (tag === 'div' && el.children.length === 1 && el.children[0].tagName === 'HR') {
      const hrStyles = getElementStyles(el.children[0], cssRules);
      return {
        id: uid(), type: 'divider', props: {},
        styles: {
          padding: elStyles.padding || '8px 16px',
          margin: elStyles.margin || '',
          maxWidth: hrStyles.maxWidth || elStyles.maxWidth || '',
          width: hrStyles.width || elStyles.width || '',
          borderColor: hrStyles.borderColor || hrStyles.borderTopColor || '#e0e0f0',
          borderWidth: hrStyles.borderWidth || hrStyles.borderTopWidth || '2px',
        },
        content: '', children: null,
      };
    }

    // Divs — detect if it's a flex row (columns), grid, or a generic container
    if (tag === 'div' || tag === 'li' || tag === 'ul') {
      const childElements = Array.from(el.children).filter(c => c.nodeType === 1 && !['script', 'style'].includes(c.tagName.toLowerCase()));
      const isFlex = elStyles.display === 'flex' || elStyles.display === 'inline-flex';
      const isFlexRow = isFlex && (!elStyles.flexDirection || elStyles.flexDirection === 'row');
      const isGrid = elStyles.display === 'grid' || elStyles.display === 'inline-grid';
      // Detect grid column count from grid-template-columns
      const gridCols = elStyles.gridTemplateColumns || '';
      const gridColCount = isGrid ? (gridCols.match(/\d+fr/g) || []).length || (gridCols.match(/repeat\(\s*(\d+)/)?.[1] ? parseInt(gridCols.match(/repeat\(\s*(\d+)/)[1]) : 0) : 0;
      const isMultiColGrid = isGrid && childElements.length >= 2;

      // If it's a grid with multiple children, treat as columns
      if (isMultiColGrid && childElements.length >= 2) {
        const numCols = Math.min(childElements.length, 4);
        const colType = numCols <= 2 ? 'columns-2' : numCols === 3 ? 'columns-3' : 'columns-4';

        const colChildren = childElements.map(child => {
          const innerChildren = parseChildElements(child, cssRules);
          const childStyles = getElementStyles(child, cssRules);
          let childBg = childStyles.backgroundColor || '';
          if (!childBg && childStyles.background) {
            childBg = childStyles.background.includes('gradient') ? '' : childStyles.background;
          }
          return {
            id: uid(), type: 'column', props: {},
            styles: {
              flex: childStyles.flex || '1',
              minHeight: childStyles.minHeight || '60px',
              padding: childStyles.padding || '',
              backgroundColor: childBg,
              borderRadius: childStyles.borderRadius || '',
              borderLeft: childStyles.borderLeft || '',
              borderTop: childStyles.borderTop || '',
              backgroundImage: childStyles.background && childStyles.background.includes('gradient') ? childStyles.background : '',
            },
            content: '',
            children: innerChildren,
          };
        });

        let bgColor = elStyles.backgroundColor || '';
        if (!bgColor && elStyles.background && !elStyles.background.includes('gradient')) bgColor = elStyles.background;
        return {
          id: uid(), type: colType, props: {},
          styles: {
            display: 'flex',
            gap: elStyles.gap || elStyles.gridGap || '16px',
            padding: elStyles.padding || '16px',
            backgroundColor: bgColor,
          },
          content: '',
          children: colChildren,
        };
      }

      // If it's a flex row with multiple children, treat as columns
      if (isFlexRow && childElements.length >= 2) {
        const numCols = Math.min(childElements.length, 4);
        const colType = numCols <= 2 ? 'columns-2' : numCols === 3 ? 'columns-3' : 'columns-4';

        const colChildren = childElements.map(child => {
          const innerChildren = parseChildElements(child, cssRules);
          const childStyles = getElementStyles(child, cssRules);
          let childBg = childStyles.backgroundColor || '';
          if (!childBg && childStyles.background && !childStyles.background.includes('gradient')) childBg = childStyles.background;
          return {
            id: uid(), type: 'column', props: {},
            styles: {
              flex: childStyles.flex || '1',
              minHeight: childStyles.minHeight || '60px',
              padding: childStyles.padding || '',
              backgroundColor: childBg,
              borderRadius: childStyles.borderRadius || '',
              borderLeft: childStyles.borderLeft || '',
              borderTop: childStyles.borderTop || '',
              backgroundImage: childStyles.background && childStyles.background.includes('gradient') ? childStyles.background : '',
            },
            content: '',
            children: innerChildren,
          };
        });

        let flexBg = elStyles.backgroundColor || '';
        if (!flexBg && elStyles.background && !elStyles.background.includes('gradient')) flexBg = elStyles.background;
        return {
          id: uid(), type: colType, props: {},
          styles: {
            display: 'flex',
            gap: elStyles.gap || elStyles.columnGap || '16px',
            padding: elStyles.padding || '16px',
            backgroundColor: flexBg,
          },
          content: '',
          children: colChildren,
        };
      }

      // If it contains a single Calendly iframe, treat as calendly component
      if (childElements.length === 1 && childElements[0].tagName.toLowerCase() === 'iframe' && (childElements[0].getAttribute('src') || '').includes('calendly.com')) {
        const iframe = childElements[0];
        return {
          id: uid(), type: 'calendly',
          props: { calendlyUrl: iframe.getAttribute('src') || '' },
          styles: { padding: elStyles.padding || '8px 16px', height: iframe.style.height || iframe.getAttribute('height') || '660px' },
          content: '', children: null,
        };
      }

      // If it contains only one image, treat as image wrapper
      if (childElements.length === 1 && childElements[0].tagName.toLowerCase() === 'img') {
        const img = childElements[0];
        return {
          id: uid(), type: 'image',
          props: { src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || 'Image' },
          styles: {
            padding: elStyles.padding || '8px 16px',
            borderRadius: elStyles.borderRadius || '',
            boxShadow: elStyles.boxShadow || '',
            overflow: elStyles.overflow || '',
          },
          content: '', children: null,
        };
      }

      // If it contains only text and is short, treat as text
      if (childElements.length === 0 && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (text.length < 500) {
          return {
            id: uid(), type: 'text', props: {},
            styles: {
              fontSize: elStyles.fontSize || '16px',
              color: elStyles.color || '#4a4a6a',
              lineHeight: elStyles.lineHeight || '1.6',
              padding: elStyles.padding || '8px 16px',
              textAlign: elStyles.textAlign || '',
              fontFamily: elStyles.fontFamily || '',
              fontWeight: elStyles.fontWeight || '',
              fontStyle: elStyles.fontStyle || '',
              margin: elStyles.margin || '',
              opacity: elStyles.opacity || '',
            },
            content: text,
            children: null,
          };
        }
      }

      // Generic container → section/row
      const children = parseChildElements(el, cssRules);
      if (children.length > 0) {
        let bgColor = elStyles.backgroundColor || '';
        let bgImage = '';
        if (elStyles.background) {
          if (elStyles.background.includes('gradient')) {
            bgImage = elStyles.background;
          } else if (!bgColor) {
            bgColor = elStyles.background;
          }
        }
        return {
          id: uid(), type: 'section', props: {},
          styles: {
            padding: elStyles.padding || '16px',
            backgroundColor: bgColor,
            backgroundImage: bgImage,
            display: elStyles.display || '',
            flexDirection: elStyles.flexDirection || '',
            justifyContent: elStyles.justifyContent || '',
            alignItems: elStyles.alignItems || '',
            gap: elStyles.gap || '',
            margin: elStyles.margin || '',
            borderRadius: elStyles.borderRadius || '',
            maxWidth: elStyles.maxWidth || '',
            borderLeft: elStyles.borderLeft || '',
            borderTop: elStyles.borderTop || '',
            opacity: elStyles.opacity || '',
            width: elStyles.width || '',
            minHeight: elStyles.minHeight || '',
            textAlign: elStyles.textAlign || '',
            boxShadow: elStyles.boxShadow || '',
            overflow: elStyles.overflow || '',
            backdropFilter: elStyles.backdropFilter || '',
          },
          content: '',
          children: children,
        };
      }

      // Div with no parseable children but has HTML content → embed
      if (el.innerHTML.trim()) {
        return {
          id: uid(), type: 'embed',
          props: { embedCode: el.innerHTML.trim() },
          styles: { padding: '8px 16px' },
          content: '', children: null,
        };
      }

      return null;
    }

    // Span with only text → text component
    if (tag === 'span' && el.textContent.trim()) {
      return {
        id: uid(), type: 'text', props: {},
        styles: {
          fontSize: elStyles.fontSize || '16px',
          color: elStyles.color || '#4a4a6a',
          padding: elStyles.padding || '8px 16px',
        },
        content: el.textContent.trim(),
        children: null,
      };
    }

    // Fallback: if element has inner HTML, treat as embed
    if (el.innerHTML.trim()) {
      return {
        id: uid(), type: 'embed',
        props: { embedCode: el.outerHTML },
        styles: { padding: '8px 16px' },
        content: '', children: null,
      };
    }

    return null;
  }

  function parseChildElements(parent, cssRules) {
    const children = [];
    for (const child of parent.children) {
      if (child.nodeType !== 1) continue;
      const comp = elementToComponent(child, cssRules);
      if (comp) children.push(comp);
    }
    return children;
  }

  // Runtime set of fonts discovered during import (added to FONT_OPTIONS dynamically)
  const _importedFonts = new Set();

  function importHTMLToComponents(htmlString) {
    const trimmed = htmlString.trim();
    if (!trimmed) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'text/html');

    // Extract CSS from <style> tags
    let cssRules = {};
    doc.querySelectorAll('style').forEach(styleEl => {
      Object.assign(cssRules, parseSimpleCSS(styleEl.textContent));
    });

    // Check for inline <style> in head too
    const headStyles = doc.head ? doc.head.querySelectorAll('style') : [];
    headStyles.forEach(styleEl => {
      Object.assign(cssRules, parseSimpleCSS(styleEl.textContent));
    });

    // Detect Google Fonts from <link> tags in head
    if (doc.head) {
      doc.head.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
        const href = link.getAttribute('href') || '';
        const familyMatches = href.matchAll(/family=([^&:]+)/g);
        for (const m of familyMatches) {
          const fontName = decodeURIComponent(m[1]).replace(/\+/g, ' ');
          _importedFonts.add(fontName);
          if (!FONT_OPTIONS.includes(fontName)) {
            FONT_OPTIONS.push(fontName);
          }
        }
      });
    }

    // Extract body-level defaults (font-family, color, background) for inheritance
    const bodyStyles = cssRules['body'] || {};
    const starStyles = cssRules['*'] || {};
    cssRules.__bodyDefaults = {
      fontFamily: bodyStyles.fontFamily || '',
      color: bodyStyles.color || '',
      backgroundColor: bodyStyles.backgroundColor || '',
      lineHeight: bodyStyles.lineHeight || '',
    };

    const body = doc.body;
    if (!body || !body.children.length) return null;

    const components = [];
    for (const child of body.children) {
      const comp = elementToComponent(child, cssRules);
      if (comp) components.push(comp);
    }

    // Apply body font/color defaults to all text components that lack explicit values
    if (components) {
      const defaults = cssRules.__bodyDefaults;
      (function applyDefaults(tree) {
        for (const c of tree) {
          if (c.type === 'heading' || c.type === 'text') {
            if (!c.styles.fontFamily && defaults.fontFamily) c.styles.fontFamily = defaults.fontFamily;
            if ((!c.styles.color || c.styles.color === '#1a1a2e' || c.styles.color === '#4a4a6a') && defaults.color) c.styles.color = defaults.color;
            if (!c.styles.lineHeight && defaults.lineHeight) c.styles.lineHeight = defaults.lineHeight;
          }
          if (c.children) applyDefaults(c.children);
        }
      })(components);
    }

    if (components.length === 0) return null;

    // Return components and body background for canvas coloring
    const bodyBg = bodyStyles.backgroundColor || bodyStyles.background || '';
    return { components, bodyBg };
  }

  function performImport() {
    const code = codeTextarea.value.trim();
    if (!code) {
      showToast('Nothing to import — paste some HTML first', 'error');
      return;
    }

    const result = importHTMLToComponents(code);
    if (!result || !result.components || result.components.length === 0) {
      showToast('Could not parse any components from the code', 'error');
      return;
    }

    const imported = result.components;
    const bodyBg = result.bodyBg || '';

    showConfirmModal(
      'Import to Visual Editor',
      `This will replace the current canvas with ${imported.length} imported component${imported.length > 1 ? 's' : ''}. Your current work will be saved in undo history. Continue?`,
      () => {
        pushHistory();
        state.components = imported;
        state.selectedId = null;

        // Apply imported body background as canvas background
        if (bodyBg) {
          state.canvasBg = bodyBg;
        }

        // Switch to visual editor
        state.activeTab = 'visual';
        $$('.tab-btn').forEach(b => b.classList.remove('active'));
        $$('.tab-btn')[0].classList.add('active');
        $('#visualEditor').classList.remove('hidden');
        $('#codeEditor').classList.add('hidden');

        renderCanvas();
        renderStylesPanel();
        showToast(`Imported ${imported.length} component${imported.length > 1 ? 's' : ''} successfully`);
      },
      'Import'
    );
  }

  // ===== CODE GENERATION =====
  function generateHTML() {
    const indent = '    ';
    function gen(comp, level) {
      const pad = indent.repeat(level);
      const cls = `pb-${comp.type.replace('columns-', 'cols-')}`;
      const id = comp.id;
      switch (comp.type) {
        case 'section': return `${pad}<section class="${cls}" id="${id}">\n${(comp.children || []).map(c => gen(c, level + 1)).join('\n')}\n${pad}</section>`;
        case 'row': return `${pad}<div class="${cls}" id="${id}">\n${(comp.children || []).map(c => gen(c, level + 1)).join('\n')}\n${pad}</div>`;
        case 'columns-2': case 'columns-3': case 'columns-4': return `${pad}<div class="${cls}" id="${id}">\n${(comp.children || []).map(c => gen(c, level + 1)).join('\n')}\n${pad}</div>`;
        case 'column': return `${pad}<div class="pb-column" id="${id}">\n${(comp.children || []).map(c => gen(c, level + 1)).join('\n')}\n${pad}</div>`;
        case 'heading': return `${pad}<h2 class="${cls}" id="${id}">${escHtml(comp.content).replace(/\n/g, '<br>')}</h2>`;
        case 'text': return `${pad}<p class="${cls}" id="${id}">${escHtml(comp.content).replace(/\n/g, '<br>')}</p>`;
        case 'image': return `${pad}<div class="${cls}" id="${id}">\n${pad}${indent}<img src="${escHtml(comp.props.src || 'https://placehold.co/800x400')}" alt="${escHtml(comp.props.alt || 'Image')}">\n${pad}</div>`;
        case 'button': return `${pad}<div class="${cls}" id="${id}">\n${pad}${indent}<a href="${escHtml(comp.props.href || '#')}" class="pb-btn">${escHtml(comp.props.text || 'Click Me')}</a>\n${pad}</div>`;
        case 'icon': return `${pad}<div class="${cls}" id="${id}">\n${pad}${indent}<i data-lucide="${comp.props.iconName || 'star'}"></i>\n${pad}</div>`;
        case 'svg': return `${pad}<div class="${cls}" id="${id}">\n${pad}${indent}${comp.props.svgCode || '<!-- SVG here -->'}\n${pad}</div>`;
        case 'embed': return `${pad}<div class="${cls}" id="${id}">\n${pad}${indent}${comp.props.embedCode || '<!-- Embed code here -->'}\n${pad}</div>`;
        case 'calendly': return `${pad}<div class="${cls}" id="${id}">\n${pad}${indent}<iframe src="${escHtml(comp.props.calendlyUrl || '')}" style="width:100%;height:${comp.styles.height || '660px'};border:none;border-radius:8px;"></iframe>\n${pad}</div>`;
        case 'divider': return `${pad}<div class="${cls}" id="${id}">\n${pad}${indent}<hr>\n${pad}</div>`;
        case 'spacer': return `${pad}<div class="${cls}" id="${id}"></div>`;
        default: return '';
      }
    }
    return state.components.map(c => gen(c, 2)).join('\n');
  }

  function generateCSS() {
    let css = '';
    const fontsUsed = new Set();
    function collect(comp) {
      const s = comp.styles;
      const cls = `#${comp.id}`;
      let rules = '';
      if (s.fontFamily) {
        const fontName = s.fontFamily.replace(/'/g, '').split(',')[0].trim();
        if (!['Arial', 'Georgia', 'Times New Roman', 'Courier New'].includes(fontName)) fontsUsed.add(fontName);
      }
      switch (comp.type) {
        case 'section': rules += buildCssRules(s, ['padding', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'margin', 'display', 'flexDirection', 'justifyContent', 'alignItems', 'gap', 'textAlign']); if (s.borderLeft) rules += `  border-left: ${s.borderLeft};\n`; if (s.borderTop) rules += `  border-top: ${s.borderTop};\n`; break;
        case 'row': rules += buildCssRules(s, ['padding', 'backgroundColor', 'display', 'flexDirection', 'justifyContent', 'alignItems', 'gap']); break;
        case 'columns-2': case 'columns-3': case 'columns-4': rules += '  display: flex;\n'; rules += buildCssRules(s, ['gap', 'padding', 'backgroundColor']); break;
        case 'column': rules += '  flex: 1;\n  min-width: 0;\n'; rules += buildCssRules(s, ['minHeight', 'padding', 'backgroundColor']); if (s.borderLeft) rules += `  border-left: ${s.borderLeft};\n`; if (s.borderTop) rules += `  border-top: ${s.borderTop};\n`; break;
        case 'heading': case 'text': rules += buildCssRules(s, ['padding', 'margin', 'fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'color', 'textAlign', 'lineHeight', 'letterSpacing', 'backgroundColor']); break;
        case 'image': rules += buildCssRules(s, ['padding', 'textAlign']); break;
        case 'button': rules += buildCssRules(s, ['padding', 'textAlign']); break;
        case 'icon': rules += buildCssRules(s, ['padding', 'textAlign']); break;
        case 'svg': rules += buildCssRules(s, ['padding', 'textAlign']); break;
        case 'calendly': rules += buildCssRules(s, ['padding']); break;
        case 'divider': rules += buildCssRules(s, ['padding', 'margin']); break;
        case 'spacer': rules += buildCssRules(s, ['height']); break;
      }
      if (s.borderRadius) rules += `  border-radius: ${s.borderRadius};\n`;
      if (s.opacity && s.opacity !== '1') rules += `  opacity: ${s.opacity};\n`;
      if (s.width) rules += `  width: ${s.width};\n`;
      if (s.height && comp.type !== 'spacer') rules += `  height: ${s.height};\n`;
      if (s.maxHeight) rules += `  max-height: ${s.maxHeight};\n`;
      if (s.maxWidth) rules += `  max-width: ${s.maxWidth};\n`;
      if (s.minHeight) rules += `  min-height: ${s.minHeight};\n`;
      if (s.boxShadow) rules += `  box-shadow: ${s.boxShadow};\n`;
      if (s.overflow) rules += `  overflow: ${s.overflow};\n`;
      if (s.backdropFilter) rules += `  backdrop-filter: ${s.backdropFilter};\n  -webkit-backdrop-filter: ${s.backdropFilter};\n`;
      if (rules) css += `${cls} {\n${rules}}\n\n`;
      if (comp.type === 'divider') {
        css += `${cls} hr {\n  border: none;\n  border-top: ${s.borderWidth || '2px'} solid ${s.borderColor || '#e0e0f0'};\n  margin: 0;\n  width: 100%;\n`;
        if (s.maxWidth) css += `  max-width: ${s.maxWidth};\n`;
        if (s.width) css += `  width: ${s.width};\n`;
        css += `}\n\n`;
      }
      if (comp.type === 'button') {
        const btnDisplay = s.buttonSizing === 'fill' ? 'block' : 'inline-block';
        const btnExtra = s.buttonSizing === 'fill' ? '  width: 100%;\n  text-align: center;\n  box-sizing: border-box;\n' : '';
        css += `${cls} .pb-btn {\n  display: ${btnDisplay};\n${btnExtra}  padding: ${s.buttonPadding || '12px 28px'};\n  background: ${s.buttonBg || '#027ac4'};\n  color: ${s.buttonColor || '#ffffff'};\n  text-decoration: none;\n  border-radius: ${s.buttonRadius || '6px'};\n  font-weight: ${s.fontWeight || '600'};\n  font-size: ${s.fontSize || '15px'};\n`;
        if (s.fontFamily) css += `  font-family: ${s.fontFamily};\n`;
        css += `  transition: opacity 200ms ease;\n}\n\n${cls} .pb-btn:hover {\n  opacity: 0.85;\n}\n\n`;
      }
      if (comp.type === 'icon') css += `${cls} svg {\n  width: ${s.iconSize || '40px'};\n  height: ${s.iconSize || '40px'};\n  color: ${s.color || '#027ac4'};\n}\n\n`;
      if (comp.type === 'svg') { let svgRules = '  max-width: 100%;\n  display: block;\n'; if (s.width) svgRules += `  width: ${s.width};\n`; if (s.height) svgRules += `  height: ${s.height};\n`; const svgAlign = s.textAlign || 'center'; if (svgAlign === 'center') svgRules += '  margin: 0 auto;\n'; else if (svgAlign === 'right') svgRules += '  margin: 0 0 0 auto;\n'; css += `${cls} svg {\n${svgRules}}\n\n`; }
      if (comp.type === 'calendly') css += `${cls} iframe {\n  width: 100%;\n  height: ${s.height || '660px'};\n  border: none;\n  border-radius: 8px;\n}\n\n`;
      if (comp.type === 'image') {
        let imgRules = '';
        imgRules += `  width: ${s.width || '100%'};\n`;
        if (s.height) imgRules += `  height: ${s.height};\n`;
        imgRules += '  max-width: 100%;\n  display: block;\n  border-radius: 8px;\n';
        if (comp.props.imageFit === 'cover') imgRules += '  object-fit: cover;\n';
        css += `${cls} img {\n${imgRules}}\n\n`;
      }
      if (comp.children) comp.children.forEach(collect);
    }
    state.components.forEach(collect);
    let fontImport = '';
    if (fontsUsed.size > 0) {
      const families = Array.from(fontsUsed).map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`).join('&');
      fontImport = `@import url('https://fonts.googleapis.com/css2?${families}&display=swap');\n\n`;
    }
    const bodyBgRule = state.canvasBg ? `\n  background-color: ${state.canvasBg};` : '';
    const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
    const alignValue = alignMap[state.pageAlignment] || 'center';
    const alignRule = `\n  display: flex;\n  flex-direction: column;\n  align-items: ${alignValue};`;
    const reset = `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  -webkit-font-smoothing: antialiased;${bodyBgRule}${alignRule}\n}\n\nbody > * {\n  width: 100%;\n}\n\nimg {\n  max-width: 100%;\n}\n\n`;
    // Collect IDs for responsive overrides that need to beat ID specificity
    const colGroupIds = [];
    const columnIds = [];
    const rowIds = [];
    const textComps = []; // { id, fontSize } for headings and text
    function collectResponsive(comp) {
      if (/^columns-\d$/.test(comp.type)) colGroupIds.push(`#${comp.id}`);
      if (comp.type === 'column') columnIds.push(`#${comp.id}`);
      if (comp.type === 'row') rowIds.push(`#${comp.id}`);
      if (comp.type === 'heading' || comp.type === 'text') {
        const defaultSize = comp.type === 'heading' ? '28px' : '16px';
        textComps.push({ id: comp.id, fontSize: comp.styles.fontSize || defaultSize });
      }
      if (comp.children) comp.children.forEach(collectResponsive);
    }
    state.components.forEach(collectResponsive);

    let responsive = '/* Responsive - Mobile */\n@media (max-width: 480px) {\n';
    if (colGroupIds.length) responsive += `  ${colGroupIds.join(',\n  ')} {\n    flex-direction: column;\n    gap: 16px;\n  }\n\n`;
    if (columnIds.length) responsive += `  ${columnIds.join(',\n  ')} {\n    width: 100%;\n  }\n\n`;
    if (rowIds.length) responsive += `  ${rowIds.join(',\n  ')} {\n    flex-wrap: wrap;\n  }\n\n`;
    // Scale each text component's font size down by 33%
    textComps.forEach(({ id, fontSize }) => {
      const parsed = parseFloat(fontSize);
      if (!isNaN(parsed)) {
        const unit = fontSize.replace(/[\d.]+/, '') || 'px';
        const scaled = Math.round(parsed * 0.75 * 100) / 100;
        responsive += `  #${id} {\n    font-size: ${scaled}${unit};\n  }\n\n`;
      }
    });
    responsive += '}\n';

    return fontImport + reset + css + responsive;
  }

  function buildCssRules(styles, props) {
    let rules = '';
    const cssMap = {
      padding: 'padding', paddingTop: 'padding-top', paddingRight: 'padding-right', paddingBottom: 'padding-bottom', paddingLeft: 'padding-left', margin: 'margin', backgroundColor: 'background-color', backgroundImage: 'background-image', backgroundSize: 'background-size', backgroundPosition: 'background-position',
      color: 'color', fontSize: 'font-size', fontWeight: 'font-weight', fontFamily: 'font-family', fontStyle: 'font-style', textAlign: 'text-align',
      lineHeight: 'line-height', letterSpacing: 'letter-spacing', display: 'display', flexDirection: 'flex-direction',
      justifyContent: 'justify-content', alignItems: 'align-items', gap: 'gap', minHeight: 'min-height', height: 'height',
    };
    for (const prop of props) {
      if (styles[prop]) rules += `  ${cssMap[prop] || prop}: ${styles[prop]};\n`;
      if (prop === 'padding') {
        for (const side of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
          if (styles[side]) rules += `  ${cssMap[side]}: ${styles[side]};\n`;
        }
      }
    }
    return rules;
  }

  function generateJS() {
    const hasIcons = (function check(tree) { for (const c of tree) { if (c.type === 'icon') return true; if (c.children && check(c.children)) return true; } return false; })(state.components);
    return hasIcons ? `// Initialize Lucide icons\nlucide.createIcons();\n` : '// No JavaScript needed for this page\n';
  }

  function generateFullPage() {
    const hasIcons = (function check(tree) { for (const c of tree) { if (c.type === 'icon') return true; if (c.children && check(c.children)) return true; } return false; })(state.components);
    // Collect all fonts used by components
    const fontsUsed = new Set();
    fontsUsed.add('Inter');
    (function collectFonts(tree) {
      for (const c of tree) {
        if (c.styles && c.styles.fontFamily) {
          const fontName = c.styles.fontFamily.replace(/'/g, '').split(',')[0].trim();
          if (fontName && !['Arial', 'Georgia', 'Times New Roman', 'Courier New'].includes(fontName)) {
            fontsUsed.add(fontName);
          }
        }
        if (c.children) collectFonts(c.children);
      }
    })(state.components);
    const families = Array.from(fontsUsed).map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700`).join('&');
    const fontsUrl = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.pageTitle || 'My Landing Page'}</title>
    <link href="${fontsUrl}" rel="stylesheet">
    ${hasIcons ? '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"><\/script>' : ''}
    <style>
${generateCSS()}
    </style>
</head>
<body>
${generateHTML()}
    ${hasIcons ? '<script>lucide.createIcons();<\/script>' : ''}
</body>
</html>`;
  }

  // ===== SYNTAX HIGHLIGHTING =====
  const codeHighlight = $('#codeHighlight');
  const codeHighlightCode = $('#codeHighlightCode');

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlightHTML(code) {
    return escapeHTML(code).replace(
      /(&lt;!--[\s\S]*?--&gt;)|(&lt;!DOCTYPE[^&]*&gt;)|(&lt;\/?)([\w-]+)((?:\s+[\w-]+(?:\s*=\s*(?:&quot;[^&]*&quot;|&#39;[^&]*&#39;|[^\s&gt;]+))?)*\s*\/?)(&gt;)|(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g,
      function(match, comment, doctype, open, tag, attrs, close, stringOutside) {
        if (comment) return '<span class="sh-comment">' + comment + '</span>';
        if (doctype) return '<span class="sh-doctype">' + doctype + '</span>';
        if (stringOutside) return '<span class="sh-string">' + stringOutside + '</span>';
        if (tag) {
          let result = '<span class="sh-punctuation">' + open + '</span>';
          result += '<span class="sh-tag">' + tag + '</span>';
          if (attrs) {
            result += attrs.replace(/([\w-]+)(\s*=\s*)(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;|[^\s&gt;]+)/g,
              '<span class="sh-attr-name">$1</span><span class="sh-operator">$2</span><span class="sh-attr-value">$3</span>');
          }
          result += '<span class="sh-punctuation">' + close + '</span>';
          return result;
        }
        return match;
      }
    );
  }

  function highlightCSS(code) {
    return escapeHTML(code).replace(
      /(\/\*[\s\S]*?\*\/)|([^{};\/\n]+?)(\s*\{)|([\w-]+)(\s*:\s*)([^;{}]+?)(;)|(\})/g,
      function(match, comment, selector, brace, prop, colon, value, semi, closeBrace) {
        if (comment) return '<span class="sh-comment">' + comment + '</span>';
        if (selector) return '<span class="sh-selector">' + selector + '</span><span class="sh-punctuation">' + brace + '</span>';
        if (prop) return '<span class="sh-property">' + prop + '</span><span class="sh-operator">' + colon + '</span><span class="sh-value">' + value + '</span><span class="sh-punctuation">' + semi + '</span>';
        if (closeBrace) return '<span class="sh-punctuation">' + closeBrace + '</span>';
        return match;
      }
    );
  }

  function highlightJS(code) {
    return escapeHTML(code).replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b(?:function|return|var|let|const|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|default|from|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|yield|async|await|null|undefined|true|false)\b)|(\b\d+\.?\d*\b)|([\w$]+)(?=\s*\()/gm,
      function(match, comment, string, keyword, number, func) {
        if (comment) return '<span class="sh-comment">' + comment + '</span>';
        if (string) return '<span class="sh-string">' + string + '</span>';
        if (keyword) return '<span class="sh-keyword">' + keyword + '</span>';
        if (number) return '<span class="sh-number">' + number + '</span>';
        if (func) return '<span class="sh-function">' + func + '</span>';
        return match;
      }
    );
  }

  function updateHighlight() {
    const code = codeTextarea.value;
    let highlighted;
    switch (state.codeTab) {
      case 'html': highlighted = highlightHTML(code); break;
      case 'css': highlighted = highlightCSS(code); break;
      case 'js': highlighted = highlightJS(code); break;
      default: highlighted = escapeHTML(code);
    }
    codeHighlightCode.innerHTML = highlighted + '\n';
  }

  function syncScroll() {
    codeHighlight.scrollTop = codeTextarea.scrollTop;
    codeHighlight.scrollLeft = codeTextarea.scrollLeft;
  }

  codeTextarea.addEventListener('input', updateHighlight);
  codeTextarea.addEventListener('scroll', syncScroll);

  // ===== CODE EDITOR =====
  function updateCodeEditor() {
    if (state.activeTab !== 'code') return;
    switch (state.codeTab) {
      case 'html': codeTextarea.value = generateFullPage(); break;
      case 'css': codeTextarea.value = generateCSS(); break;
      case 'js': codeTextarea.value = generateJS(); break;
    }
    updateHighlight();
  }

  // ===== PREVIEW =====
  function showPreview() {
    const modal = $('#previewModal');
    modal.classList.remove('hidden');
    const frame = $('#previewFrame');
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(generateFullPage());
    doc.close();
  }

  // ===== EXPORT =====
  function exportProject() {
    const html = generateFullPage();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const projects = loadAllProjects();
    const project = projects.find(p => p.id === state.activeProjectId);
    const projectName = (project && project.name) ? project.name : 'landing-page';
    const safeName = projectName.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '-').toLowerCase() || 'landing-page';
    a.download = safeName + '.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== PROJECTS MODAL UI =====
  function renderProjectsModal() {
    const projects = loadAllProjects();
    const list = $('#projectList');

    if (projects.length === 0) {
      list.innerHTML = '<div class="project-list-empty">No projects yet</div>';
      return;
    }

    list.innerHTML = '';
    projects.forEach(proj => {
      const item = document.createElement('div');
      item.className = 'project-list-item' + (proj.id === state.activeProjectId ? ' active' : '');
      item.innerHTML = `
        <div class="project-item-icon"><i data-lucide="file-text"></i></div>
        <div class="project-item-info">
          <div class="project-item-name">${escHtml(proj.name)}</div>
          <div class="project-item-date">${formatDate(proj.updatedAt)}</div>
        </div>
        <div class="project-item-actions">
          <button class="icon-btn rename-proj-btn" title="Rename"><i data-lucide="pencil"></i></button>
          <button class="icon-btn delete-proj-btn" title="Delete"><i data-lucide="trash-2"></i></button>
        </div>
      `;

      // Open project on click
      item.addEventListener('click', (e) => {
        if (e.target.closest('.icon-btn')) return;
        openProject(proj.id);
        $('#projectsModal').classList.add('hidden');
        showToast(`Opened "${proj.name}"`);
      });

      // Rename
      item.querySelector('.rename-proj-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showRenameModal(proj.id, proj.name);
      });

      // Delete
      item.querySelector('.delete-proj-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirmModal('Delete Project', `Delete "${proj.name}"? This cannot be undone.`, () => {
          deleteProject(proj.id);
          renderProjectsModal();
          showToast(`Deleted "${proj.name}"`);
        }, 'Delete');
      });

      list.appendChild(item);
    });

    lucide.createIcons({ nodes: [list] });
  }

  function showRenameModal(projId, currentName) {
    const modal = $('#renameModal');
    const input = $('#renameInput');
    input.value = currentName;
    modal.classList.remove('hidden');
    setTimeout(() => { input.focus(); input.select(); }, 50);

    const cleanup = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      closeBtn.removeEventListener('click', handleCancel);
      input.removeEventListener('keydown', handleKey);
    };

    const handleOk = () => {
      const name = input.value.trim();
      if (name) {
        renameProject(projId, name);
        renderProjectsModal();
        showToast(`Renamed to "${name}"`);
      }
      cleanup();
    };
    const handleCancel = () => cleanup();
    const handleKey = (e) => { if (e.key === 'Enter') handleOk(); if (e.key === 'Escape') handleCancel(); };

    const okBtn = $('#renameOk');
    const cancelBtn = $('#renameCancel');
    const closeBtn = $('#closeRename');

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
    input.addEventListener('keydown', handleKey);
  }

  // ===== PAGE TITLE MODAL =====
  function showPageTitleModal() {
    const modal = $('#pageTitleModal');
    const input = $('#pageTitleInput');
    input.value = state.pageTitle || '';
    modal.classList.remove('hidden');
    setTimeout(() => { input.focus(); input.select(); }, 50);

    const cleanup = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      closeBtn.removeEventListener('click', handleCancel);
      input.removeEventListener('keydown', handleKey);
    };

    const handleOk = () => {
      state.pageTitle = input.value.trim();
      scheduleAutoSave();
      showToast(state.pageTitle ? `Page title set to "${state.pageTitle}"` : 'Page title cleared');
      cleanup();
    };
    const handleCancel = () => cleanup();
    const handleKey = (e) => { if (e.key === 'Enter') handleOk(); if (e.key === 'Escape') handleCancel(); };

    const okBtn = $('#pageTitleOk');
    const cancelBtn = $('#pageTitleCancel');
    const closeBtn = $('#closePageTitle');

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
    input.addEventListener('keydown', handleKey);
  }

  // ===== INITIALIZATION =====
  let sessionIntroPlayed = false;

  function init() {
    // Play panel slide-in animation once per session
    if (!sessionIntroPlayed) {
      sessionIntroPlayed = true;
      $$('.panel').forEach(p => {
        p.classList.add('session-intro');
        p.addEventListener('animationend', () => p.classList.remove('session-intro'), { once: true });
      });
    }

    // Initialize project system first
    initProjectSystem();

    lucide.createIcons();
    initPanelDrag();
    setupCanvasDropZone();
    pushHistory();
    renderCanvas();

    // Tab switching
    function switchToCodeEditor() {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.tab-btn').forEach(b => { if (b.dataset.tab === 'code') b.classList.add('active'); });
      state.activeTab = 'code';
      $('#visualEditor').classList.add('hidden');
      $('#codeEditor').classList.remove('hidden');
      updateCodeEditor();
    }

    function switchToVisualEditor() {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.tab-btn').forEach(b => { if (b.dataset.tab === 'visual') b.classList.add('active'); });
      state.activeTab = 'visual';
      $('#visualEditor').classList.remove('hidden');
      $('#codeEditor').classList.add('hidden');
    }

    $$('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tab === 'code' && !codeBetaWarningShown) {
          showCodeBetaWarning(
            () => switchToCodeEditor(),
            () => switchToVisualEditor()
          );
          return;
        }
        if (btn.dataset.tab === 'visual') {
          switchToVisualEditor();
        } else {
          switchToCodeEditor();
        }
      });
    });

    // Code tabs
    $$('.code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.code-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.codeTab = tab.dataset.lang;
        updateCodeEditor();
      });
    });

    // Copy code
    $('#copyCodeBtn').addEventListener('click', () => {
      codeTextarea.select();
      navigator.clipboard.writeText(codeTextarea.value).then(() => {
        const btn = $('#copyCodeBtn');
        const origHTML = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="check"></i><span>Copied!</span>';
        lucide.createIcons({ nodes: [btn] });
        setTimeout(() => { btn.innerHTML = origHTML; lucide.createIcons({ nodes: [btn] }); }, 2000);
      });
    });

    // Import to Visual
    $('#importCodeBtn').addEventListener('click', performImport);

    // Preview
    $('#previewBtn').addEventListener('click', showPreview);
    $('#closePreview').addEventListener('click', () => $('#previewModal').classList.add('hidden'));

    // Preview device buttons
    $$('.preview-device-btns .icon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.preview-device-btns .icon-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $('#previewFrame').style.maxWidth = btn.dataset.width;
      });
    });

    // Export
    $('#exportBtn').addEventListener('click', exportProject);

    // Clear
    $('#clearBtn').addEventListener('click', () => {
      if (state.components.length === 0) return;
      showConfirmModal('Clear Canvas', 'Are you sure you want to remove all components from the canvas? This action cannot be undone.', () => {
        pushHistory();
        state.components = [];
        state.selectedId = null;
        renderCanvas();
        renderStylesPanel();
      });
    });

    // Undo/Redo
    $('#undoBtn').addEventListener('click', undo);
    $('#redoBtn').addEventListener('click', redo);

    // Canvas background color picker
    canvasBgInput.addEventListener('input', (e) => {
      state.canvasBg = e.target.value;
      applyCanvasBg();
      scheduleAutoSave();
    });
    canvasBgReset.addEventListener('click', () => {
      state.canvasBg = '';
      applyCanvasBg();
      scheduleAutoSave();
    });

    // Page Settings dropdown
    const pageSettingsBtn = $('#pageSettingsBtn');
    const pageSettingsDropdown = $('#pageSettingsDropdown');
    pageSettingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      pageSettingsDropdown.classList.toggle('visible');
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#pageSettingsWrapper')) {
        pageSettingsDropdown.classList.remove('visible');
      }
    });

    // Page Alignment buttons
    const alignBtns = pageSettingsDropdown.querySelectorAll('.page-align-btn');
    function updateAlignBtns() {
      alignBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.align === state.pageAlignment);
      });
    }
    updateAlignBtns();
    alignBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.pageAlignment = btn.dataset.align;
        updateAlignBtns();
        scheduleAutoSave();
        showToast('Page alignment set to ' + state.pageAlignment);
      });
    });

    // Page Title button
    $('#pageTitleBtn').addEventListener('click', () => {
      pageSettingsDropdown.classList.remove('visible');
      showPageTitleModal();
    });

    // Project selector
    $('#projectBtn').addEventListener('click', () => {
      renderProjectsModal();
      $('#projectsModal').classList.remove('hidden');
    });

    // New project
    $('#newProjectBtn').addEventListener('click', () => {
      saveCurrentProject();
      const proj = createNewProject('Untitled Project');
      openProject(proj.id);
      $('#projectsModal').classList.add('hidden');
      showToast('New project created');
    });

    // Close projects modal
    $('#closeProjects').addEventListener('click', () => $('#projectsModal').classList.add('hidden'));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedId && document.activeElement === document.body) {
          e.preventDefault();
          deleteComponent(state.selectedId);
        }
      }
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
        if (openModals.length > 0) {
          openModals.forEach(m => m.classList.add('hidden'));
          state.iconPickerCallback = null;
        } else {
          deselectAll();
        }
      }
    });

    // Click canvas to deselect
    canvasEl.addEventListener('click', (e) => {
      if (e.target === canvasEl || e.target === canvasEmpty) deselectAll();
    });

    // Icon picker
    $('#closeIconPicker').addEventListener('click', () => { $('#iconPickerModal').classList.add('hidden'); state.iconPickerCallback = null; });
    $('#iconSearch').addEventListener('input', (e) => populateIconGrid(e.target.value));

    // Close modals on overlay click
    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { overlay.classList.add('hidden'); state.iconPickerCallback = null; }
      });
    });
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
