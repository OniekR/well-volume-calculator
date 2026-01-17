# Changelog

## Unreleased

- Removed inline "Top set to ..." connect-note elements to simplify UI and reduce visual clutter.
- Added small editable `size-id` inputs below each Size dropdown; these show and can override the numeric ID used for volume calculations.
- Table improvements: only show casings with their "use" checkbox checked; added totals row and 1-decimal formatting for volumes.
- Overlap logic: changed to depth-segment allocation so the casing with the **smallest numeric size ID** wins overlapping segments.
- UI: tie-back option `10 3/4"` updated to display `10 3/4" 60.7#` and use ID `9.66` inches for volume calculations.
- Tie-back: when the Tie-back 'Use' checkbox is checked the Bottom (m) input is unlocked and seeded with the Wellhead depth + 75 (user-editable); unchecking re-locks the input.
- Dummy hanger: when checked, Tie-back Top (m) is set to the Wellhead depth and Tie-back Bottom (m) is seeded to Wellhead depth + 75 and unlocked (user-editable); when unchecked the Top remains Wellhead and Bottom mirrors Production Top and is locked.
- Dark mode: add a theme toggle in the header, CSS variables for dark theme, and persisted preference in `localStorage`.
- Dark mode: improve input contrast and make container surfaces slightly lighter for readability in dark theme.
- UI: update Wellhead buttons to match the Liner non-active styling for improved readability in dark and light themes.
- UI: apply the same non-active styling to the Reservoir 'Liner' button for better contrast and consistency.
- Production Casing/Liner: added accessible toggle buttons, `aria-pressed` states, Liner default behavior, and Tie-back interactions that force Liner behavior.
- Added smoke tests (tools/qa/smoke_test.js) using jsdom; tests pass locally.
- UI: add "Dummy hanger" checkbox to Tie-back Casing header (placeholder, functionality to be implemented).

- Feature: Add "Open Hole" casing input with selectable diameter and TD; the Open Hole top auto-links to the deepest enabled casing shoe and is rendered with a darker brown, jagged fill on the schematic to indicate excavated/drilled formation.
- Fix: Ensure the renderer recognizes casings with `role: "open_hole"` so Open Hole draws correctly (jagged edges and color).
- Fix: Presets — `P-9` updated to explicitly enable/disable Small Liner and Open Hole where appropriate. Loading built-in presets now prefers the built-in payload for built-in entries and UI sections are now synchronized (collapsed/expanded) to reflect loaded checkbox states.
- Test: Added smoke tests to assert Open Hole auto-linking and preset/panel behavior to prevent regressions.

## Chores & improvements

- Refactored JavaScript into an encapsulated module (`script.js`) with:
  - cached DOM queries
  - debounced localStorage saves
  - requestAnimationFrame-backed canvas drawing
  - devicePixelRatio-aware canvas sizing
  - improved accessibility attributes (aria-hidden, role/switch, aria-controls)
- HTML accessibility improvements:
  - added `form` and `main` structure
  - associated labels with inputs (`for` attributes)
  - removed inline `display:none` styles and replaced with `.hidden` class
  - added `aria-label` to the canvas
- CSS updates:
  - added `.hidden` and `.visually-hidden` utilities
  - improved focus-visible styles for interactive controls
- Tooling:
  - added `.eslintrc.json`, `.prettierrc` and `package.json` scripts for linting/formatting

## Next steps

- Add automated tests (unit + visual) as needed
- Manual QA across supported browsers and devices
