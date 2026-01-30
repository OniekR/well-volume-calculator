# Changelog

All notable changes to this project are documented in this file.

## [Unreleased] - 2026-01-17

### Added

- Pressure test calculator for determining fluid volumes required to pressurize well sections

  - Selectable well sections (drill pipe, tubing, annulus volumes)
  - Two-stage pressure testing (low: 0→20 bar, high: 20→345 bar)
  - Fluid type presets with compressibility constants (k values)
  - Real-time calculation updates

- Plug feature: add `plug` panel with depth input and a `Plug` toggle. App now computes and displays volumes above and below the plug and draws a plug line on the schematic.
- UI/UX: moved the plug toggle, added `plug-panel` and `plug-toggle`, improved styling for the Total Volume area and plug panel.
- Styling: nudged casing headings to better align with inline checkboxes and hide inline header controls (e.g., `Tie-back`, `Dummy hanger`) when sections are collapsed.
- Small liner: added `Small liner` casing with two sizes (5\" 18# / 4 1/2\" 12.6#), top and shoe inputs, and a `Liner` default button that uses the Reservoir shoe - 50 m.
- Canvas: assigned `small_liner` a higher z-index so it always renders above `Reservoir` on the schematic.
- Presets: updated built-in presets — default `Plug` is now **unchecked**; `Small liner` defaults set (size 5\" 18#, top 3691, shoe 4992).

### Changed

- Refactor: extracted presets management into `src/js/presets.js` and removed duplicate implementations from `src/js/script.js`.
- CI: added an HTTP Puppeteer smoke test for the P-9 preset and a CI job to run it (`.github/workflows/ci.yml`).

### Removed

- Remove large Total Volume display and the UI-only **Hide total** toggle. Hole volume table in the sidebar remains the canonical total volume display. A deprecation note has been added to the `README.md`.

### Fixed

- Upper completion / "Drill pipe string" checkbox: unchecking now disables all upper completion controls (tubing and drill pipe inputs and mode/count controls), treats DP/tubing as absent in calculations (lengths treated as 0), hides the drill pipe/tubing breakdown and removes DP/tubing from the canvas schematic. Re-checking preserves prior inputs and re-enables calculations.
- Initialization: page load respects saved `use_upper_completion` state and disables inputs when unchecked.

### Notes

- Recommended: review `well-presets.json` for other presets that may benefit from including `small_liner` defaults.
- Recommended: run a quick smoke test for all preset load/save flows to ensure the new controls persist and render as expected.
