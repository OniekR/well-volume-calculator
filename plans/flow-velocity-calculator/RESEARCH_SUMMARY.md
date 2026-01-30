# Flow Velocity Calculator Feature - Research Summary

## 1. CODE CONTEXT

### Navigation & Sidebar Structure

**How sidebar navigation works:**

- Sidebar uses a section-based navigation system with three active sections: `casings`, `completion`, `settings`
- Sections are stored in `KNOWN_SECTIONS` Set and managed via localStorage (`volumeCalc_activeSection`)
- Navigation buttons have `data-section` attributes that trigger view switching
- Views are DOM elements with `data-view` attributes that get hidden/shown
- Active section state is persisted to localStorage
- The sidebar is responsive: desktop shows left sidebar, mobile shows bottom navigation bar
- **Future features section already exists** with a disabled "Flow Velocity" button

**Where to add new tab:**

- The Flow Velocity button is already present in HTML but disabled
- To enable: Remove `disabled` and `aria-disabled="true"` attributes
- Add `"flow"` to `KNOWN_SECTIONS` in sidebar.js
- Create corresponding view section in HTML with `data-view="flow"`

### Data Storage & Access

**Drill Pipe/Tubing Data:**

- **Catalog:** `DRILLPIPE_CATALOG` - array with sizes, ID, OD, lPerM
- **Similar:** `TUBING_CATALOG` - with tubing specifications
- Both catalogs include:
  - `id` and `od` (inner/outer diameter in inches)
  - `lPerM` (liters per meter - ID volume per meter)
  - `oed_lPerM` (open-ended displacement for drill pipe)
- Data gathered via `gatherDrillpipeInput()` and `gatherTubingInput()` functions

**Casing Configuration:**

- **File:** `src/js/inputs.js` - `gatherInputs()` function
- Returns `casings` array with each casing having:
  - `role` (riser, surface, intermediate, production, reservoir, etc.)
  - `id`, `od` (diameters in inches)
  - `depth`, `eod` (depth range in meters)
  - `enabled` (boolean - whether casing is enabled)
  - `driftId` (minimum internal diameter)
- Casings are stored by depth ranges and can overlap/nest

**Depth-based Casing Changes:**

- Handled in `src/js/logic.js` - segment-based calculation
- System creates depth breakpoints where casings start/end
- Uses "innermost casing wins" logic for overlapping casings
- Relevant for flow velocity: need to determine which pipe/casing is active at each depth

### State Management

**Pattern Used:**

- **Central file:** `src/js/state.js`
- **Capture state:** `captureStateObject()` - reads all DOM inputs into serializable object
- **Apply state:** `applyStateObject()` - populates DOM from state object
- **Persistence:** `saveStateToStorage()` - auto-save to localStorage with debouncing
- State includes all input values with their types (`number`, `string`, `boolean`)
- Callbacks pattern used: `onStateChange` handlers

**How calculations are triggered:**

- Event delegation in `src/js/script.js` - event listeners on document
- All `input` and `change` events trigger `calculateVolume()` and `debouncedSave()`
- Debounced save (500ms) to avoid excessive localStorage writes

### Input Handling Patterns

**Unit Conversion:**

- **File:** `src/js/inputs.js` - `parseLocalNumber()` function
- Handles locale-specific formatting: commas as decimals, spaces as thousand separators
- Example: `"1,234.5"` or `"1 234,5"` both work
- Returns `number` or `undefined` for invalid input

**Volume Calculations (relevant patterns):**

- Liters per meter (lPerM) is standard unit for ID volume
- Conversion: `volume_m3 = (lPerM / 1000) * length_meters`
- Area calculations: `area_m2 = Math.PI * Math.pow((diameter_inches / 2) * 0.0254, 2)`
- Inches to meters: `meters = inches * 0.0254`

---

## 2. ARCHITECTURE PATTERNS

### Calculation Structure

**Module organization:**

- **Core calculations:** `src/js/logic.js` - Pure functions, no DOM access
- **Rendering:** `src/js/render.js` - Takes calculation results, updates DOM
- **Input gathering:** `src/js/inputs.js` - Reads DOM, returns data objects
- Pattern: `Input → Calculation → Render`

**Calculation characteristics:**

- Export pure functions from logic modules
- Accept data objects, return data objects
- No DOM manipulation in calculation code
- Well-tested (extensive test coverage in `__tests__` directories)

### Tab/Section System

**How it works:**

- Sidebar buttons have `data-section="casings|completion|settings|flow"`
- Content areas have `data-view="casings|completion|settings|flow"`
- Click handler in sidebar.js handles switching

**View structure in HTML:**

```html
<section id="view-casings" class="app-view" data-view="casings">
  <!-- Casings inputs -->
</section>
<section id="view-flow" class="app-view" data-view="flow" hidden>
  <!-- Flow velocity inputs -->
</section>
```

### Canvas Integration

**Drawing system:**

- **File:** `src/js/draw.js` - Handles canvas rendering
- Canvas shows: well schematic, casings, drill pipe, depth markers, preset name
- Drawing is separate from calculations - receives computed data

### Results Display

**Current pattern:**

- Results rendered in HTML tables/cards
- **File:** `src/js/render.js`
- Uses `textContent`/`innerHTML` pattern
- Tables for breakdowns (per-casing volumes, drill pipe sections, etc.)

---

## 3. EXISTING FEATURES TO STUDY

### Volume Calculations

**Main computation:**

- **Function:** `computeVolumes()` - `src/js/logic.js`
- Iterates through depth segments
- Calculates volume per segment
- Handles overlapping casings (innermost wins)
- Tracks volumes by casing role
- Returns detailed breakdown object

**Relevant calculations for flow velocity:**

- Cross-sectional area calculations already present
- Pipe diameter → area formulas available
- Depth-based segmentation logic
- Annulus volume calculations (casing ID - pipe OD)

### Drill Pipe Module

**Structure:** `src/js/drillpipe.js`

- Catalog of pipe sizes with dimensions
- Functions: `gatherDrillpipeInput()`, `computeDrillpipe()`, `renderDrillpipeInputs()`
- Handles multiple pipe segments with different sizes
- Calculates cumulative depths
- Computes ID volume and annulus volume per casing section

---

## 4. TECHNICAL DEPENDENCIES

### JavaScript Patterns

**Module system:**

- ES6 modules with `import`/`export`
- No classes - uses functions and plain objects
- Functional programming style for calculations
- Dependency injection via parameters

### Calculation Utilities

**Available in constants/utils:**

- Unit conversion helpers
- Cross-sectional area calculations
- Volume from dimensions
- Standard area calculations

**For flow velocity calculations:**

- Flow rate (Q) in m³/s
- Area (A) in m²
- Velocity (v) = Q / A
- Unit conversions needed: L/min → m³/s, etc.

### No External Calculation Libraries

- Pure JavaScript math operations
- No external calculation libraries
- All formulas implemented directly
- Follows "avoid dependencies" principle

---

## 5. UI/UX PATTERNS

### Calculator Feature Structure

**Input sections:**

- Wrapped in `<div class="input-section">` or similar
- Collapsible sections with headers
- Inline inputs with labels
- Input rows for organization

### Results Display Patterns

**Current patterns:**

- Span elements updated via JavaScript
- Tables with class `results-table` for detailed breakdowns
- Cards with class `results-card` for grouped info
- Hidden by default with `hidden` attribute
- Shown when calculations have valid results

### Status Indicators

**"Coming Soon" features:**

- In sidebar: buttons with `disabled` attribute
- CSS class: `.disabled` or similar
- Greyed out appearance: `opacity: 0.6`
- Can add badge/chip for "Under Construction"

---

## 6. FILE ORGANIZATION

### Where to Place New Code

**Calculation logic:**

- Create: `src/js/flow-velocity.js`
- Export: catalog, compute, gather, render functions

**Constants:**

- Add to: `src/js/constants.js` - Flow velocity related constants
- Example: Common flow rates, conversion factors, velocity limits

**HTML structure:**

- Add to: `index.html` after existing app-view sections
- Create: `<section data-view="flow">`

**CSS styling:**

- Add to: `src/css/style.css`
- Use existing CSS variables for consistency

### Integration Points

**Main script:** `src/js/script.js`

1. Import flow velocity module
2. Add to calculation dependencies
3. Call new calculation in main flow

**Sidebar:** `src/js/sidebar.js`

1. Add `"flow"` to `KNOWN_SECTIONS`
2. Update view switching logic

**State:** `src/js/state.js`

- Automatically captures all inputs with IDs

---

## 7. KEY TAKEAWAYS

### Architecture Understanding

✅ **80% confidence achieved in understanding:**

1. **Sidebar navigation** - Section-based, data attributes, view switching
2. **Data access** - Catalog constants, gather functions, pure calculation functions
3. **Calculation structure** - Modular, pure functions, depth-based segmentation
4. **File organization** - Clear separation: logic/ui/render/state/constants
5. **Unit conversions** - Established patterns for inches↔meters, L/m↔m³
6. **State management** - Capture/apply pattern, persistence, callbacks
7. **UI patterns** - Input rows, inline inputs, result cards, tables

### Implementation Path

1. **Enable existing button** - Remove disabled state from Flow Velocity button
2. **Create module** - `src/js/flow-velocity.js` with calculations
3. **Add view section** - HTML section with `data-view="flow"`
4. **Update sidebar** - Add "flow" to KNOWN_SECTIONS
5. **Wire to main script** - Import and integrate
6. **Add tests** - Follow existing test patterns
7. **Style** - Use existing CSS variables

### Design Considerations

- **Input needed:** Flow rate (L/min), pipe/tubing selection, depth range
- **Calculations:** Convert flow rate → m³/s, calculate area from pipe ID/OD, compute velocity v=Q/A for both pipe and annulus
- **Display:** Results table with velocity per segment for pipe interior and each annulus
- **Validation:** Ensure positive flow rate, valid pipe selected
- **Multiple annuli:** Calculate velocity between pipe and each casing it passes through at different depths
