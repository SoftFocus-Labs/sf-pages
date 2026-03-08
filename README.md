# Pages by SoftFocus Labs

A drag-and-drop landing page builder that runs entirely in the browser. No frameworks, no build tools, no backend — just open `index.html` and start building.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## Features

**Visual Editor**
- Drag-and-drop components onto a live canvas
- Inline text editing for headings and paragraphs
- Styles panel for editing typography, colors, spacing, borders, and layout
- Breadcrumb navigation for nested component selection
- Undo / Redo support

**Components**
- **Layout**: Section, Row, 2/3/4 Column grids
- **Content**: Heading, Text, Image, Button, Icon, Embed, Divider, Spacer
- **Icons**: Full Lucide icon library with searchable picker

**Code Editor**
- Live-generated HTML, CSS, and JavaScript tabs
- Paste existing HTML/CSS and import it into the visual editor
- Copy code to clipboard

**Project Management**
- Create, rename, and delete multiple projects
- Auto-saves to localStorage on every change
- Switch between projects from the header

**Preview & Export**
- Responsive preview at Desktop, Tablet, and Mobile widths
- Export clean, standalone HTML/CSS/JS files

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari)

That's it. No install, no build step.

## Project Structure

```
page-builder/
  index.html        Main application shell and modal templates
  css/styles.css    Complete UI styling with CSS custom properties
  js/app.js         All application logic (state, rendering, drag-drop, export)
```

## How It Works

Drag components from the left panel onto the canvas. Click any element to select it and edit its styles in the right panel. Nest components inside layout containers to build complex page structures. Switch to the Code Editor tab to see the generated output or paste in your own HTML to import.

## Browser Support

Requires a modern browser with support for ES6, CSS custom properties, and the HTML5 Drag and Drop API. Projects are persisted in `localStorage`.

## License

MIT
