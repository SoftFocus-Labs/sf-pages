// ============================================================
// Canvas — render pipeline, element rendering, style application
// ============================================================
'use strict';

  function applyCanvasBg() {
    if (state.canvasBg) {
      canvasEl.style.backgroundColor = state.canvasBg;
      canvasBgInput.value = rgbToHex(state.canvasBg);
    } else {
      canvasEl.style.backgroundColor = '';
      canvasBgInput.value = '#f8f9fc';
    }
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
