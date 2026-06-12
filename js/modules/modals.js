// ============================================================
// Modals & dialogs — confirm, code-beta, Calendly, GA, favicon,
// export-dropdown state, icon picker, projects/rename/page-title
// ============================================================
'use strict';

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

  // ===== GOOGLE ANALYTICS MODAL & TAG =====
  function showGaModal(onConfirm, onCancel, prefill) {
    const modal = $('#gaModal');
    const input = $('#gaIdInput');
    const okBtn = $('#gaOk');
    const cancelBtn = $('#gaCancel');
    const closeBtn = $('#closeGa');
    const errorEl = $('#gaError');
    input.value = prefill || '';
    errorEl.classList.add('hidden');
    input.classList.remove('input-error');
    modal.classList.remove('hidden');
    input.focus();

    const clearError = () => { errorEl.classList.add('hidden'); input.classList.remove('input-error'); };

    const cleanup = () => {
      modal.classList.add('hidden');
      clearError();
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      closeBtn.removeEventListener('click', handleCancel);
      input.removeEventListener('keydown', handleKey);
      input.removeEventListener('input', clearError);
    };

    const handleOk = () => {
      if (!input.value.trim()) {
        errorEl.classList.remove('hidden');
        input.classList.add('input-error');
        input.focus();
        return;
      }
      cleanup();
      onConfirm(input.value.trim());
    };
    const handleCancel = () => { cleanup(); if (onCancel) onCancel(); };
    const handleKey = (e) => { if (e.key === 'Enter') handleOk(); if (e.key === 'Escape') handleCancel(); };

    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
    input.addEventListener('keydown', handleKey);
    input.addEventListener('input', clearError);
  }

  function updateGaTag() {
    const tag = $('#gaTag');
    const idEl = $('#gaTagId');
    if (state.googleAnalyticsId) {
      tag.classList.remove('hidden');
      idEl.textContent = state.googleAnalyticsId;
    } else {
      tag.classList.add('hidden');
      tag.classList.remove('open');
      $('#gaTagDropdown').classList.add('hidden');
    }
    // Disable/enable the sidebar GA item
    const gaItem = document.querySelector('.component-item[data-type="google-analytics"]');
    if (gaItem) {
      if (state.googleAnalyticsId) {
        gaItem.classList.add('component-item-disabled');
        gaItem.setAttribute('draggable', 'false');
      } else {
        gaItem.classList.remove('component-item-disabled');
        gaItem.setAttribute('draggable', 'true');
      }
    }
    lucide.createIcons({ nameAttr: 'data-lucide', attrs: {} });
  }

  function initGaTag() {
    const tagBtn = $('#gaTagBtn');
    const dropdown = $('#gaTagDropdown');
    const tag = $('#gaTag');

    tagBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !dropdown.classList.contains('hidden');
      if (isOpen) {
        dropdown.classList.add('hidden');
        tag.classList.remove('open');
      } else {
        dropdown.classList.remove('hidden');
        tag.classList.add('open');
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#gaTag')) {
        dropdown.classList.add('hidden');
        tag.classList.remove('open');
      }
    });

    $('#gaEditBtn').addEventListener('click', () => {
      dropdown.classList.add('hidden');
      tag.classList.remove('open');
      showGaModal((id) => {
        if (id) {
          state.googleAnalyticsId = id;
          scheduleAutoSave();
          updateGaTag();
          updateExportDropdown();
          showToast('Google Analytics ID updated');
        }
      }, null, state.googleAnalyticsId);
    });

    $('#gaRemoveBtn').addEventListener('click', () => {
      dropdown.classList.add('hidden');
      tag.classList.remove('open');
      showConfirmModal('Remove Google Analytics', 'Are you sure you want to remove Google Analytics from this project?', () => {
        state.googleAnalyticsId = '';
        scheduleAutoSave();
        updateGaTag();
        updateExportDropdown();
        showToast('Google Analytics removed');
      });
    });
  }

  // ===== FAVICON MODAL =====
  function showFaviconModal() {
    const modal = $('#faviconModal');
    const dropzone = $('#faviconDropzone');
    const fileInput = $('#faviconFileInput');
    const fileBtn = $('#faviconFileBtn');
    const urlInput = $('#faviconUrlInput');
    const okBtn = $('#faviconOk');
    const cancelBtn = $('#faviconCancel');
    const closeBtn = $('#closeFavicon');
    const previewRow = $('#faviconPreviewRow');
    const previewImg = $('#faviconPreviewImg');
    const removeBtn = $('#faviconRemoveBtn');

    let pendingFavicon = state.favicon || '';
    let pendingType = state.faviconType || '';

    function updatePreview() {
      if (pendingFavicon) {
        previewRow.classList.remove('hidden');
        previewImg.src = pendingFavicon;
        urlInput.value = pendingType === 'url' ? pendingFavicon : '';
      } else {
        previewRow.classList.add('hidden');
        previewImg.src = '';
        urlInput.value = '';
      }
    }

    updatePreview();
    modal.classList.remove('hidden');

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        pendingFavicon = e.target.result;
        pendingType = 'data';
        updatePreview();
      };
      reader.readAsDataURL(file);
    }

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); dropzone.classList.add('drag-over'); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); dropzone.classList.remove('drag-over'); };
    const handleDrop = (e) => {
      e.preventDefault(); e.stopPropagation(); dropzone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    };
    const handleFileChange = () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); };
    const handleFileBtnClick = (e) => { e.stopPropagation(); fileInput.click(); };
    const handleDropzoneClick = () => { fileInput.click(); };
    const handleRemove = () => { pendingFavicon = ''; pendingType = ''; updatePreview(); };

    const cleanup = () => {
      modal.classList.add('hidden');
      dropzone.removeEventListener('dragover', handleDragOver);
      dropzone.removeEventListener('dragleave', handleDragLeave);
      dropzone.removeEventListener('drop', handleDrop);
      fileInput.removeEventListener('change', handleFileChange);
      fileBtn.removeEventListener('click', handleFileBtnClick);
      dropzone.removeEventListener('click', handleDropzoneClick);
      removeBtn.removeEventListener('click', handleRemove);
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
      closeBtn.removeEventListener('click', handleCancel);
      urlInput.removeEventListener('keydown', handleKey);
    };

    const handleOk = () => {
      const urlVal = urlInput.value.trim();
      if (urlVal && pendingType !== 'data') {
        pendingFavicon = urlVal;
        pendingType = 'url';
      }
      state.favicon = pendingFavicon;
      state.faviconType = pendingType;
      scheduleAutoSave();
      updateExportDropdown();
      showToast(state.favicon ? 'Favicon saved' : 'Favicon removed');
      cleanup();
    };
    const handleCancel = () => cleanup();
    const handleKey = (e) => { if (e.key === 'Enter') handleOk(); if (e.key === 'Escape') handleCancel(); };

    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileChange);
    fileBtn.addEventListener('click', handleFileBtnClick);
    dropzone.addEventListener('click', handleDropzoneClick);
    removeBtn.addEventListener('click', handleRemove);
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
    urlInput.addEventListener('keydown', handleKey);
  }

  // ===== EXPORT DROPDOWN STATE =====
  function updateExportDropdown() {
    const singleBtn = $('#exportSingleBtn');
    const hasExternalAssets = !!(state.googleAnalyticsId || state.favicon);
    if (hasExternalAssets) {
      singleBtn.classList.add('disabled');
      singleBtn.setAttribute('title', 'Not available when using a favicon or Google Analytics');
    } else {
      singleBtn.classList.remove('disabled');
      singleBtn.removeAttribute('title');
    }
    // Show/hide hint
    let hint = $('#exportDisabledHint');
    if (hasExternalAssets) {
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'export-dropdown-hint';
        hint.id = 'exportDisabledHint';
        singleBtn.parentNode.insertBefore(hint, singleBtn.nextSibling);
      }
      hint.textContent = 'Single file export is unavailable when using a favicon or Google Analytics. Use Multi-File (ZIP) instead.';
      hint.style.display = '';
    } else if (hint) {
      hint.style.display = 'none';
    }
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

  // ===== PROJECTS / RENAME / PAGE-TITLE MODALS =====
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
          <button class="icon-btn duplicate-proj-btn" title="Duplicate"><i data-lucide="copy"></i></button>
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

      // Duplicate
      item.querySelector('.duplicate-proj-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        duplicateProject(proj.id);
        renderProjectsModal();
        showToast(`Duplicated "${proj.name}"`);
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
