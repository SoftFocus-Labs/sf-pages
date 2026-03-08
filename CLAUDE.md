# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Masterpager is a client-side drag-and-drop landing page builder. No build system, no dependencies, no backend — just open `index.html` in a browser.

## Architecture

Three files make up the entire app:

- **`index.html`** — Shell HTML with header, editor panels, canvas, and modal templates
- **`js/app.js`** (~2000 lines) — All application logic in a single IIFE
- **`css/styles.css`** (~1700 rules) — Dark theme UI with CSS custom properties

### State Management

Global `state` object holds: `components` (tree), `selectedId`, `activeTab` (visual/code), `codeTab` (html/css/js), `history`/`historyIndex` (undo/redo, max 50), `activeProjectId`.

Every mutation goes through `pushHistory()` which snapshots state and triggers `scheduleAutoSave()` (500ms debounce to localStorage).

### Component System

`COMPONENT_DEFS` defines 15 component types. Each component is an object with `{ id, type, styles, props, children }`. Container types (section, row, column) hold children; leaf types (heading, text, image, button, icon, svg, embed, divider, spacer) do not.

The `svg` (Vector) component stores inline SVG markup in `props.svgCode`. It supports file upload via `FileReader.readAsText()` and direct paste — the first file-upload feature in the app.

Columns work via a parent columns-N component that auto-creates N child column components. The column wrappers need `is-column` class for flex layout to work — this was a previous bug.

### Rendering Pipeline

`renderCanvas()` → `renderComponentEl(comp)` recursively builds DOM. Each component gets a `.comp-wrapper` div (selection, drag handles) containing the actual rendered element. `applyStylesToElement()` maps component styles to DOM.

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
