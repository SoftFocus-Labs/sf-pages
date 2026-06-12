# Changelog

## 2026-06-11

### Changed
- Split the monolithic `js/app.js` (~3,900-line single IIFE) into 12 concern-based files under `js/modules/`, loaded as ordered classic `<script>` tags sharing global scope (ES modules avoided so the app still runs from `file://`)
- Documented the new module layout, load-order rules, and the inspector ↔ canvas ↔ export "consistency contract" in `CLAUDE.md`

### Fixed
- Column layout fields (Display, Direction, Justify, Align, Gap) set in the inspector are now included in the exported CSS (previously applied on the canvas but dropped on export)
- Background color, background image/size/position now export for **all** component types (previously only sections/rows/columns and text)
- Margin now exports for all component types (previously only section, heading, text, divider)
- The Border panel's Width/Color now produce a real border in the exported CSS for all box components (previously rendered on the canvas only)
- Button line-height and letter-spacing now export (previously canvas-only)
- Removed the dead Typography "Color" row for buttons (a button's Text Color always overrode it)
- Removed a duplicate `autoUnit()` definition and a duplicate `min-height` emission for columns

## 2026-03-15

### Added
- Google Analytics integration widget in the Integrations sidebar section
- Full-canvas highlight overlay when dragging the Google Analytics widget, with "Add Google Analytics integration" text
- Modal for entering a Google Analytics Measurement ID on drop
- Persistent blue "Google Analytics" tag above the canvas top-left corner when a tracking ID is set
- Dropdown on the GA tag to edit or remove the tracking ID
- Google Analytics gtag.js snippet included in exported pages when a tracking ID is configured
- Automatic GA4 event tracking in exported pages: link clicks, button clicks, form submissions, and scroll depth milestones (25%, 50%, 75%, 100%)
- Validation error state on the GA modal when submitting without a tracking ID (red input border and error message)
- Google Analytics ID persisted per project via localStorage
- Export dropdown with two options: Single HTML File and Multi-File (ZIP)
- Multi-file ZIP export produces a folder containing index.html, styles.css, and script.js
- Google Analytics config and event tracking included in multi-file script.js export
- Inline ZIP builder (no external dependencies) for generating the multi-file archive
- Favicon upload option in the Page Settings dropdown
- Favicon modal with drag & drop, file picker, and URL paste support
- Favicon preview with remove button in the upload modal
- Favicon persisted per project in localStorage (as data URL for uploads, external URL for links)
- Favicon included in single-file export (inline href) and multi-file ZIP export (separate image file)
- Single HTML File export option greyed out and disabled when Google Analytics or a favicon is set, with an explanatory hint message
- Duplicate button on each project in the Manage Projects modal, creating a full copy of all components, settings, Google Analytics ID, and favicon

### Changed
- "Your Projects" modal renamed to "Manage Projects"
- Export button now opens a dropdown menu instead of directly downloading
- Positioning indicators (drop lines, canvas outline, drop pads, container highlights) are suppressed when dragging the Google Analytics widget since placement is irrelevant
- GA drop overlay scoped to the canvas area instead of the full screen

### Fixed
- Error input border on the GA modal now persists correctly when clicking "Add" with an empty field (focus/hover states no longer override the error style)
- Error message text now renders red correctly (increased CSS specificity to override `.modal-body p` color)
- Exported ZIP files now use the user's local date and time instead of showing November 30, 1979
