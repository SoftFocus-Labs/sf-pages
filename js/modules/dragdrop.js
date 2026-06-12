// ============================================================
// Drag & drop — panel drag, canvas/container drop zones, indicators
// ============================================================
'use strict';

  // ===== DRAG & DROP =====
  let dragType = null;
  let dragComponentType = null;
  let dragComponentId = null;

  const canvasDropTop = $('#canvasDropTop');
  const canvasDropBottom = $('#canvasDropBottom');

  let isDragging = false;
  let bottomPadScrolled = false;

  function updateDropPads(clientY) {
    if (dragComponentType === 'google-analytics') return;
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
        ghost.textContent = dragComponentType === 'google-analytics' ? 'Google Analytics' : (COMPONENT_DEFS[dragComponentType]?.label || item.dataset.type);
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => ghost.remove(), 0);
        isDragging = true;
        if (dragComponentType === 'google-analytics') {
          $('#gaDropOverlay').classList.remove('hidden');
          lucide.createIcons({ nameAttr: 'data-lucide', attrs: {} });
        }
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        dragType = null;
        dragComponentType = null;
        clearDropIndicators();
        canvasEl.classList.remove('drag-over');
        hideDropPads();
        $('#gaDropOverlay').classList.add('hidden');
      });
    });
  }

  function setupGaDropOverlay() {
    // Overlay is purely visual (pointer-events: none).
    // Drops fall through to canvas/pad handlers which check for 'google-analytics'.
  }

  function setupCanvasDropZone() {
    canvasEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = dragType === 'new' ? 'copy' : 'move';
      if (dragComponentType === 'google-analytics') return;
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
        if (dragComponentType === 'google-analytics') {
          $('#gaDropOverlay').classList.add('hidden');
          showGaModal((id) => { if (id) { state.googleAnalyticsId = id; scheduleAutoSave(); updateGaTag(); updateExportDropdown(); showToast('Google Analytics added'); } });
          return;
        }
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
        if (dragComponentType === 'google-analytics') return;
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
          if (dragComponentType === 'google-analytics') {
            $('#gaDropOverlay').classList.add('hidden');
            showGaModal((id) => { if (id) { state.googleAnalyticsId = id; scheduleAutoSave(); updateGaTag(); updateExportDropdown(); showToast('Google Analytics added'); } });
            return;
          }
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
      if (dragComponentType === 'google-analytics') return;
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
        if (dragComponentType === 'google-analytics') {
          $('#gaDropOverlay').classList.add('hidden');
          showGaModal((id) => { if (id) { state.googleAnalyticsId = id; scheduleAutoSave(); updateGaTag(); updateExportDropdown(); showToast('Google Analytics added'); } });
          return;
        }
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
