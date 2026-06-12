// ============================================================
// Utilities — tree helpers, escaping, DOM refs, unit/color helpers
// ============================================================
'use strict';

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

  // ===== COLOR HELPER =====
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

  // ===== UNIT HELPER =====
  function autoUnit(v) {
    v = v.trim();
    if (!v || v === 'auto' || v === 'none') return v;
    if (v.includes('rem')) return v;
    if (/^-?\d+(\.\d+)?$/.test(v)) return v + 'px';
    return v;
  }
