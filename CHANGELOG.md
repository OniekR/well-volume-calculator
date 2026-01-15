# Changelog

## Unreleased
- Removed inline "Top set to ..." connect-note elements to simplify UI and reduce visual clutter.
- Added small editable `size-id` inputs below each Size dropdown; these show and can override the numeric ID used for volume calculations.
- Table improvements: only show casings with their "use" checkbox checked; added totals row and 1-decimal formatting for volumes.
- Overlap logic: changed to depth-segment allocation so the *deepest* casing wins overlapping segments.
- Production Casing/Liner: added accessible toggle buttons, `aria-pressed` states, Liner default behavior, and Tie-back interactions that force Liner behavior.
- Added smoke tests (tools/qa/smoke_test.js) using jsdom; tests pass locally.

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
