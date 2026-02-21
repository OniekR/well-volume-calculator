# Well Volume Calculator

Development

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`

Project structure

- `src/` - source JS, CSS, assets, data
- `index.html` - main HTML entry
- `dist/` - build output

- Flow Velocity: calculates pipe and annulus velocities across casing transitions.
  Supports L/min, GPM, m³/h, and BPM inputs.

### Feedback

- Open **Settings** and use **Send feedback by email** to report bugs, ideas, or feature requests.
- The email draft includes prompts for feedback type, details, and optional contact email.
- Attach screenshots directly in your email client when relevant.

### Pressure Test Calculator

Calculate the volume of fluid required to pressurize selected well sections:

- **Section Selection**: Choose from drill pipe capacity, tubing capacity, or annulus sections
- **Two-Stage Testing**: Calculate volumes for both low pressure (0 → 20 bar) and high pressure (20 → 345 bar) tests
- **Fluid Types**: Quick-select presets for common fluids (WBM/Brine k=21, OBM k=18, Base Oil k=14, KFLS k=35)
- **Formula**: V(liters) = (V(m³) × ΔP(bar)) / k

Deprecations

- The large **Total Volume** display and the UI-only **Hide total** button have been removed (Jan 2026). The sidebar hole volume table is the canonical total volume display. See `CHANGELOG.md` for details.
