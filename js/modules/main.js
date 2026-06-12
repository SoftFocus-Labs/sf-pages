// ============================================================
// Main — application bootstrap & global event wiring
// ============================================================
'use strict';

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
    setupGaDropOverlay();
    initGaTag();
    updateGaTag();
    updateExportDropdown();
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

    // Export dropdown
    const exportWrapper = $('#exportWrapper');
    const exportDropdown = $('#exportDropdown');
    $('#exportBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = exportDropdown.classList.contains('visible');
      exportDropdown.classList.toggle('visible', !isOpen);
      exportWrapper.classList.toggle('open', !isOpen);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#exportWrapper')) {
        exportDropdown.classList.remove('visible');
        exportWrapper.classList.remove('open');
      }
    });
    $('#exportSingleBtn').addEventListener('click', () => {
      if ($('#exportSingleBtn').classList.contains('disabled')) return;
      exportDropdown.classList.remove('visible');
      exportWrapper.classList.remove('open');
      exportSingleFile();
    });
    $('#exportZipBtn').addEventListener('click', () => {
      exportDropdown.classList.remove('visible');
      exportWrapper.classList.remove('open');
      exportZip();
    });

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

    // Favicon
    $('#faviconBtn').addEventListener('click', () => {
      pageSettingsDropdown.classList.remove('visible');
      showFaviconModal();
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

  // ===== BOOT =====
  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
