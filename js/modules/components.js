// ============================================================
// Components — factory, selection, and tree operations
// ============================================================
'use strict';

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
