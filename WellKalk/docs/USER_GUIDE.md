# User Guide — Well Calculator App

## Getting started
- Run `npm run dev` and open `http://localhost:5173`.
- Use the left sidebar (desktop) or bottom navigation (mobile) to access pages.

## Well Builder
- **Create sections:** Use the "Section Type", depth, and casing profile fields to add sections. Click "Add Section" to append it to the active well.
- **Editing & deleting:** Use the trash button on a section card to remove it.
- **Visualization:** The right panel renders an SVG schematic of sections for quick inspection.
- **Export:** Use "Export to Excel" to download a spreadsheet of sections.

## Calculators
Each calculator has a "Use Well Data" button (when an active well exists) that populates inputs using the top section of the active well.
- **Well Volume:** Enter a length (m) and diameter (in) or use well data to compute volume.
- **Cement:** Enter cement volume and stroke volume; calculates strokes to bump.
- **Pressure Test:** Enter test volume, delta pressure, and select k-factor to view required liters.
- **Fluid Flow:** Convert pump rate (L/min) and geometry into annular velocity (m/s).
- **String Lift:** Estimate lift force from casing & drill pipe geometry and pressure.

## Theme & Persistence
- Toggle light/dark mode using the button in the header. Theme choice is saved to `localStorage` and follows system preference by default.
- Wells are persisted using `localStorage` (key: `wells`) and the active well id (key: `activeWellId`).

## Troubleshooting
- If build or dev server fails, run `npm install` to ensure dependencies are up to date.
- For issues with Excel export, confirm browser download permissions.

