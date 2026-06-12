// ============================================================
// Import — reverse-engineer pasted HTML/CSS into the component tree
// ============================================================
'use strict';

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
