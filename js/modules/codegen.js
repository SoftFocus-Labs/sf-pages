// ============================================================
// Codegen — HTML/CSS/JS generation, syntax highlight, export & ZIP
// ============================================================
'use strict';

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
      // Type-specific rules (layout/typography/structure). Universal visual
      // properties (margin, background, border) are emitted generically below
      // so every inspector field round-trips to the export — see applyStylesToElement.
      switch (comp.type) {
        case 'section': rules += buildCssRules(s, ['padding', 'display', 'flexDirection', 'justifyContent', 'alignItems', 'gap', 'textAlign']); if (s.borderLeft) rules += `  border-left: ${s.borderLeft};\n`; if (s.borderTop) rules += `  border-top: ${s.borderTop};\n`; break;
        case 'row': rules += buildCssRules(s, ['padding', 'display', 'flexDirection', 'justifyContent', 'alignItems', 'gap']); break;
        case 'columns-2': case 'columns-3': case 'columns-4': rules += '  display: flex;\n'; rules += buildCssRules(s, ['gap', 'padding']); break;
        case 'column': rules += '  flex: 1;\n  min-width: 0;\n'; rules += buildCssRules(s, ['padding', 'display', 'flexDirection', 'justifyContent', 'alignItems', 'gap']); if (s.borderLeft) rules += `  border-left: ${s.borderLeft};\n`; if (s.borderTop) rules += `  border-top: ${s.borderTop};\n`; break;
        case 'heading': case 'text': rules += buildCssRules(s, ['padding', 'fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'color', 'textAlign', 'lineHeight', 'letterSpacing']); break;
        case 'image': rules += buildCssRules(s, ['padding', 'textAlign']); break;
        case 'button': rules += buildCssRules(s, ['padding', 'textAlign', 'lineHeight', 'letterSpacing']); break;
        case 'icon': rules += buildCssRules(s, ['padding', 'textAlign']); break;
        case 'svg': rules += buildCssRules(s, ['padding', 'textAlign']); break;
        case 'calendly': rules += buildCssRules(s, ['padding']); break;
        case 'divider': rules += buildCssRules(s, ['padding']); break;
        case 'spacer': rules += buildCssRules(s, ['height']); break;
      }
      // Universal visual properties — applied to every component type.
      if (s.margin) rules += `  margin: ${s.margin};\n`;
      if (s.backgroundColor) rules += `  background-color: ${s.backgroundColor};\n`;
      if (s.backgroundImage) rules += `  background-image: ${s.backgroundImage};\n`;
      if (s.backgroundSize) rules += `  background-size: ${s.backgroundSize};\n`;
      if (s.backgroundPosition) rules += `  background-position: ${s.backgroundPosition};\n`;
      // Box border (Border panel) — divider draws its line via `hr`, button via `.pb-btn`.
      if (s.borderWidth && s.borderWidth !== '0px' && comp.type !== 'divider' && comp.type !== 'button') {
        rules += `  border: ${s.borderWidth} solid ${s.borderColor || '#e0e0f0'};\n`;
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
    const gaSnippet = state.googleAnalyticsId ? `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${escHtml(state.googleAnalyticsId)}"><\/script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${escHtml(state.googleAnalyticsId)}');
    <\/script>` : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.pageTitle || 'My Landing Page'}</title>${gaSnippet}${state.favicon ? `\n    <link rel="icon" href="${escHtml(state.favicon)}">` : ''}
    <link href="${fontsUrl}" rel="stylesheet">
    ${hasIcons ? '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"><\/script>' : ''}
    <style>
${generateCSS()}
    </style>
</head>
<body>
${generateHTML()}
    ${hasIcons ? '<script>lucide.createIcons();<\/script>' : ''}${state.googleAnalyticsId ? `
    <script>
      // GA4 Event Tracking
      document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (link) {
          gtag('event', 'link_click', {
            link_text: link.textContent.trim().substring(0, 100),
            link_url: link.getAttribute('href') || ''
          });
        }
        var button = e.target.closest('button, .pb-btn');
        if (button && !link) {
          gtag('event', 'button_click', {
            button_text: button.textContent.trim().substring(0, 100)
          });
        }
      });
      document.querySelectorAll('form').forEach(function(form) {
        form.addEventListener('submit', function() {
          gtag('event', 'form_submit', {
            form_id: form.id || '',
            form_action: form.getAttribute('action') || ''
          });
        });
      });
      (function() {
        var milestones = [25, 50, 75, 100];
        var reached = {};
        window.addEventListener('scroll', function() {
          var scrollTop = window.scrollY || document.documentElement.scrollTop;
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight <= 0) return;
          var percent = Math.round((scrollTop / docHeight) * 100);
          milestones.forEach(function(m) {
            if (percent >= m && !reached[m]) {
              reached[m] = true;
              gtag('event', 'scroll_depth', { depth: m + '%' });
            }
          });
        });
      })();
    <\/script>` : ''}
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
  function getProjectSafeName() {
    const projects = loadAllProjects();
    const project = projects.find(p => p.id === state.activeProjectId);
    const projectName = (project && project.name) ? project.name : 'landing-page';
    return projectName.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '-').toLowerCase() || 'landing-page';
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportSingleFile() {
    const html = generateFullPage();
    downloadBlob(new Blob([html], { type: 'text/html' }), getProjectSafeName() + '.html');
  }

  // ===== MULTI-FILE EXPORT =====
  function generateMultiFileCSS() {
    return generateCSS();
  }

  function generateMultiFileJS() {
    const hasIcons = (function check(tree) { for (const c of tree) { if (c.type === 'icon') return true; if (c.children && check(c.children)) return true; } return false; })(state.components);
    let js = '';
    if (hasIcons) {
      js += '// Initialize Lucide icons\nlucide.createIcons();\n';
    }
    if (state.googleAnalyticsId) {
      js += `
// Google Analytics Setup
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${escHtml(state.googleAnalyticsId)}');

// GA4 Event Tracking
document.addEventListener('click', function(e) {
  var link = e.target.closest('a');
  if (link) {
    gtag('event', 'link_click', {
      link_text: link.textContent.trim().substring(0, 100),
      link_url: link.getAttribute('href') || ''
    });
  }
  var button = e.target.closest('button, .pb-btn');
  if (button && !link) {
    gtag('event', 'button_click', {
      button_text: button.textContent.trim().substring(0, 100)
    });
  }
});
document.querySelectorAll('form').forEach(function(form) {
  form.addEventListener('submit', function() {
    gtag('event', 'form_submit', {
      form_id: form.id || '',
      form_action: form.getAttribute('action') || ''
    });
  });
});
(function() {
  var milestones = [25, 50, 75, 100];
  var reached = {};
  window.addEventListener('scroll', function() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var percent = Math.round((scrollTop / docHeight) * 100);
    milestones.forEach(function(m) {
      if (percent >= m && !reached[m]) {
        reached[m] = true;
        gtag('event', 'scroll_depth', { depth: m + '%' });
      }
    });
  });
})();
`;
    }
    return js || '// No JavaScript needed for this page\n';
  }

  function generateMultiFileHTML() {
    const hasIcons = (function check(tree) { for (const c of tree) { if (c.type === 'icon') return true; if (c.children && check(c.children)) return true; } return false; })(state.components);
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
    const gaAsync = state.googleAnalyticsId ? `\n    <script async src="https://www.googletagmanager.com/gtag/js?id=${escHtml(state.googleAnalyticsId)}"><\/script>` : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.pageTitle || 'My Landing Page'}</title>${gaAsync}${state.favicon ? `\n    <link rel="icon" href="${state.faviconType === 'data' ? 'favicon' + getFaviconExt(state.favicon) : escHtml(state.favicon)}">` : ''}
    <link href="${fontsUrl}" rel="stylesheet">
    ${hasIcons ? '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"><\/script>' : ''}
    <link rel="stylesheet" href="styles.css">
</head>
<body>
${generateHTML()}
    <script src="script.js"><\/script>
</body>
</html>`;
  }

  // ===== MINIMAL ZIP BUILDER =====
  function buildZip(files) {
    // files: [{name, content}] or [{name, binary}]
    const encoder = new TextEncoder();
    const entries = files.map(f => ({ name: encoder.encode(f.name), data: f.binary || encoder.encode(f.content) }));

    // DOS time/date from current local time
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    for (const entry of entries) {
      // CRC-32
      const crc = crc32(entry.data);
      const size = entry.data.length;
      const nameLen = entry.name.length;

      // Local file header (30 + nameLen + data)
      const local = new Uint8Array(30 + nameLen + size);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);   // signature
      lv.setUint16(4, 20, true);            // version needed
      lv.setUint16(6, 0, true);             // flags
      lv.setUint16(8, 0, true);             // compression: store
      lv.setUint16(10, dosTime, true);       // mod time
      lv.setUint16(12, dosDate, true);       // mod date
      lv.setUint32(14, crc, true);          // crc-32
      lv.setUint32(18, size, true);         // compressed size
      lv.setUint32(22, size, true);         // uncompressed size
      lv.setUint16(26, nameLen, true);      // filename length
      lv.setUint16(28, 0, true);            // extra field length
      local.set(entry.name, 30);
      local.set(entry.data, 30 + nameLen);
      localHeaders.push(local);

      // Central directory header (46 + nameLen)
      const central = new Uint8Array(46 + nameLen);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);   // signature
      cv.setUint16(4, 20, true);            // version made by
      cv.setUint16(6, 20, true);            // version needed
      cv.setUint16(8, 0, true);             // flags
      cv.setUint16(10, 0, true);            // compression
      cv.setUint16(12, dosTime, true);       // mod time
      cv.setUint16(14, dosDate, true);       // mod date
      cv.setUint32(16, crc, true);          // crc-32
      cv.setUint32(20, size, true);         // compressed
      cv.setUint32(24, size, true);         // uncompressed
      cv.setUint16(28, nameLen, true);      // filename length
      cv.setUint16(30, 0, true);            // extra length
      cv.setUint16(32, 0, true);            // comment length
      cv.setUint16(34, 0, true);            // disk number
      cv.setUint16(36, 0, true);            // internal attrs
      cv.setUint32(38, 0, true);            // external attrs
      cv.setUint32(42, offset, true);       // local header offset
      central.set(entry.name, 46);
      centralHeaders.push(central);

      offset += local.length;
    }

    const centralDirOffset = offset;
    const centralDirSize = centralHeaders.reduce((s, c) => s + c.length, 0);

    // End of central directory (22 bytes)
    const eocd = new Uint8Array(22);
    const ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, centralDirSize, true);
    ev.setUint32(16, centralDirOffset, true);
    ev.setUint16(20, 0, true);

    const totalSize = offset + centralDirSize + 22;
    const result = new Uint8Array(totalSize);
    let pos = 0;
    for (const lh of localHeaders) { result.set(lh, pos); pos += lh.length; }
    for (const ch of centralHeaders) { result.set(ch, pos); pos += ch.length; }
    result.set(eocd, pos);

    return new Blob([result], { type: 'application/zip' });
  }

  function crc32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function getFaviconExt(dataUrl) {
    if (!dataUrl) return '.png';
    if (dataUrl.includes('image/svg')) return '.svg';
    if (dataUrl.includes('image/x-icon') || dataUrl.includes('image/vnd.microsoft.icon')) return '.ico';
    if (dataUrl.includes('image/gif')) return '.gif';
    if (dataUrl.includes('image/webp')) return '.webp';
    if (dataUrl.includes('image/jpeg')) return '.jpg';
    return '.png';
  }

  function dataUrlToUint8Array(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function exportZip() {
    const safeName = getProjectSafeName();
    const htmlContent = generateMultiFileHTML();
    const cssContent = generateMultiFileCSS();
    const jsContent = generateMultiFileJS();

    const files = [
      { name: safeName + '/index.html', content: htmlContent },
      { name: safeName + '/styles.css', content: cssContent },
      { name: safeName + '/script.js', content: jsContent },
    ];

    // Include favicon as a binary file if it's a data URL
    if (state.favicon && state.faviconType === 'data') {
      const ext = getFaviconExt(state.favicon);
      files.push({ name: safeName + '/favicon' + ext, binary: dataUrlToUint8Array(state.favicon) });
    }

    const zip = buildZip(files);
    downloadBlob(zip, safeName + '.zip');
  }
