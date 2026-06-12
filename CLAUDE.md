# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Masterpager is a client-side drag-and-drop landing page builder. No build system, no dependencies, no backend — just open `index.html` in a browser.

## Architecture

- **`index.html`** — Shell HTML with header, editor panels, canvas, and modal templates
- **`js/modules/*.js`** — All application logic, split into concern-based files (see below)
- **`css/styles.css`** (~1700 rules) — Dark theme UI with CSS custom properties

### JavaScript module layout

The app was originally a single ~3,900-line IIFE (`js/app.js`). It is now split into
concern-based files under `js/modules/`, loaded as **ordered classic `<script>` tags**
(not ES modules) at the end of `index.html`.

**Why classic scripts, not ES modules:** the app must run by opening `index.html`
directly from `file://` (no build, no server). ES modules are blocked by CORS over
`file://`, so they are intentionally avoided. Instead, every module is a plain script
sharing the **global scope** — top-level `const`/`let`/`function` declarations in one
file are visible to every file loaded after it. Each file starts with `'use strict';`
to preserve the original behavior.

**Load order matters** (each file may use declarations from files above it):

1. `constants.js` — `STORAGE_KEY`/`ACTIVE_KEY`, the `state` object, `COMPONENT_DEFS`, `FONT_OPTIONS`, `LUCIDE_ICONS`
2. `utils.js` — tree helpers (`findComponent`, `findParent`, `removeComponent`, `getAncestors`), `escHtml`, `formatDate`, `uid`/`projId`, `deepClone`, the `$`/`$$` DOM helpers + cached DOM refs, `rgbToHex`, `autoUnit`
3. `storage.js` — project CRUD (localStorage), autosave debounce, undo/redo history
4. `components.js` — `createComponent` factory, selection, and tree ops (delete/duplicate/move)
5. `ui.js` — `showToast`, the custom `createCustomSelect` dropdown + `closeDropdown`
6. `modals.js` — all modal dialogs (confirm, code-beta, Calendly, GA, favicon, projects, rename, page-title), the GA tag, export-dropdown enable/disable state, and the icon picker
7. `canvas.js` — `renderCanvas` → `renderComponentEl`, `applyStylesToElement`, canvas bg, breadcrumb
8. `dragdrop.js` — panel drag, canvas/container drop zones, drop indicators
9. `inspector.js` — the Styles panel (`renderStylesPanel`) and its field/control builders
10. `import.js` — HTML/CSS import (`importHTMLToComponents`, `parseSimpleCSS`, `elementToComponent`)
11. `codegen.js` — `generateHTML`/`generateCSS`/`generateJS`/`generateFullPage`, syntax highlight, code editor, preview, single-file + ZIP export
12. `main.js` — `init()` (wires up all DOM event listeners) and the boot block

When adding a function, place it in the file matching its concern and ensure any file
that calls it loads **after** the file that defines it. Functions that only call each
other at runtime (inside `init` or event handlers) are order-independent; only top-level
*executing* code (DOM-ref lookups, `addEventListener` at file scope) is order-sensitive.

To preview locally, `.claude/launch.json` runs a tiny Node static server
(`.claude/static-server.js`) — the app itself needs no server.

### State Management

Global `state` object holds: `components` (tree), `selectedId`, `activeTab` (visual/code), `codeTab` (html/css/js), `history`/`historyIndex` (undo/redo, max 50), `activeProjectId`.

Every mutation goes through `pushHistory()` which snapshots state and triggers `scheduleAutoSave()` (500ms debounce to localStorage).

### Component System

`COMPONENT_DEFS` defines 16 component types. Each component is an object with `{ id, type, styles, props, children }`. Container types (section, row, columns-2/3/4, column) hold children; leaf types (heading, text, image, button, icon, svg, embed, divider, spacer, calendly) do not.

The `svg` (Vector) component stores inline SVG markup in `props.svgCode`. It supports file upload via `FileReader.readAsText()` and direct paste — the first file-upload feature in the app.

Columns work via a parent columns-N component that auto-creates N child column components. The column wrappers need `is-column` class for flex layout to work — this was a previous bug.

### Rendering Pipeline

`renderCanvas()` → `renderComponentEl(comp)` recursively builds DOM. Each component gets a `.comp-wrapper` div (selection, drag handles) containing the actual rendered element. `applyStylesToElement()` maps component styles to DOM.

### Inspector ↔ component data binding (consistency contract)

The Styles panel (`inspector.js`) reads/writes `comp.styles.*` and `comp.props.*`.
Three places must agree on every field, or an inspector control becomes a "dead" or
"export-only" link:

1. **`inspector.js`** — the control writes the value onto `comp.styles`/`comp.props`.
2. **`canvas.js` `applyStylesToElement()`** — applies it to the live canvas preview.
3. **`codegen.js` `generateCSS()`** — emits it into the exported stylesheet.

`applyStylesToElement()` applies the *universal* visual properties (margin, background
color/image/size/position, and a box `border` from `borderWidth`/`borderColor`) to
**every** component. `generateCSS()` mirrors this: those universal props are emitted in
a shared tail block in `collect()` for all types, while the per-type `switch` only
handles layout/typography/structural rules. **When adding a style field, follow this
split** — type-specific rules go in the `switch`, anything the inspector exposes for all
components goes in the universal tail — so canvas and export never diverge.

Type-specific exceptions handled deliberately:
- `divider` draws its line via a `#id hr` rule (its `borderWidth`/`borderColor` mean the
  rule, not a box border); `button` styles its `.pb-btn` anchor. Both are excluded from
  the generic box-border emission.
- `button` has its own **Text Color** (`styles.buttonColor`) which always wins over
  `styles.color`, so the generic Typography "Color" row is hidden for buttons.

### Code Generation & Import

- **Export**: `generateHTML()`, `generateCSS()`, `generateJS()` walk the component tree to produce standalone page code
- **Import**: `importHTMLToComponents(htmlString)` uses DOMParser + `parseSimpleCSS()` + `elementToComponent()` to reverse-engineer HTML back into the component tree

### Persistence

localStorage keys: `masterpager_projects` (array of project objects), `masterpager_active` (current project ID). Projects store the full component tree.

## External Libraries (CDN)

- **Lucide Icons**: `https://unpkg.com/lucide@latest/dist/umd/lucide.js` — used for UI icons and as the user-facing icon component library. Call `lucide.createIcons()` after DOM updates.
- **Google Fonts**: Inter (UI font), plus Playfair Display, Roboto, Open Sans, Lato, Montserrat, Poppins, Raleway, Source Code Pro as user-selectable typefaces.

## UI Conventions

- All dropdowns use custom `.mp-select` components (not native `<select>`), built via `createCustomSelect()`
- All confirms use `showConfirmModal()` (not native `confirm()`)
- Inputs use `.mp-input` class with focus glow
- Toast notifications via `showToast(message, type)`
- Component icons are color-coded via `data-icon-color` attributes (blue, cyan, indigo, purple, green, pink, orange, yellow, teal, slate)
- CSS variables are prefixed with `--` and defined in `:root` (e.g., `--bg-primary: #0d0d1a`, `--accent: #6366f1`)
