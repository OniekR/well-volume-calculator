# Changelog

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
