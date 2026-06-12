// ============================================================
// Inspector — the Styles panel: section/field builders & controls
// ============================================================
'use strict';

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
        // Buttons have their own "Text Color" (buttonColor) in the Button section,
        // which always wins over styles.color — so the generic text Color row is
        // omitted for buttons to avoid a control that appears to do nothing.
        if (comp.type !== 'button') {
          body.appendChild(makeRow('Color', () => makeColorInput(comp.styles.color || '#1a1a2e', (v) => { comp.styles.color = v; pushHistory(); renderCanvas(); })));
        }
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
