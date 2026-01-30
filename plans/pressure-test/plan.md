# Pressure Test Feature

**Branch:** `feature/pressure-test`
**Description:** Add pressure test calculator to determine volume required to pressurize selected well sections

## Goal

Implement a pressure test calculator that allows users to select well sections (drill pipe capacity, tubing, annulus spaces) and calculate the volume of fluid required to pressurize from 0 to a low test pressure (default 20 bar) and from low to high test pressure (default 345 bar). This provides well operators with precise fluid volume requirements for performing pressure integrity tests on different well sections.

## Implementation Steps

### Step 1: Add Pressure Constants and Core Calculation Logic

**Files:**

- [src/js/constants.js](src/js/constants.js)
- [src/js/pressure.js](src/js/pressure.js) (new file)
- [src/js/**tests**/pressure.test.js](src/js/__tests__/pressure.test.js) (new file)

**What:**
Add fluid compressibility constants (k values) to constants.js for WBM/brine (21), OBM (18), Base oil (14), and KFLS (35). Create the core pressure.js module with pure calculation functions:

- `computePressureTest()` - Main calculation: (volume_m³ × ΔP_bar) / k = liters
- `selectableVolumeSections()` - Build list of available well sections user can select from
- Unit tests for calculation accuracy and edge cases

**Testing:**
Run `npm test -- pressure.test.js`. Verify calculations match expected values:

- Example: 150 m³ × (130-20) bar / 18 = 917 liters (high pressure test with OBM)
- Example: 150 m³ × 20 bar / 18 = 167 liters (low pressure test with OBM)

### Step 2: Create Pressure Test HTML UI

**Files:**

- [index.html](index.html)

**What:**
Insert the pressure test view section between flow velocity and settings views. The view includes:

- Volume selection area with buttons for each selectable well section (drill pipe capacity, tubing capacity, annulus options)
- Each section button displays: "Section Name - X.XX m³" (e.g., "Drill Pipe Capacity - 25.4 m³")
- Multi-select capability with visual indication of selected sections (toggle on/off)
- Total volume display showing sum of all selected sections
- Two pressure input fields (low test: default 20 bar, high test: default 345 bar)
- Input validation: No negative values, maximum 1035 bar for both fields
- Fluid type selector with quick-select k buttons (WBM/brine: 21, OBM: 18, Base oil: 14, KFLS: 35)
- Results area showing two calculated volumes (0→low pressure, low→high pressure) in liters

**Testing:**
Open index.html in browser, verify all HTML elements render correctly and match the design from the reference image. Check that no console errors appear.

### Step 3: Style Pressure Test UI

**Files:**

- [src/css/style.css](src/css/style.css)

**What:**
Add CSS for pressure test components following existing patterns:

- `.pressure-card` - Main container styling
- `.pressure-section-selector` - Grid layout for selectable volume sections
- `.pressure-section-btn` - Button styling with selected state
- `.pressure-input-grid` - Layout for pressure inputs
- `.pressure-quick-buttons` - k constant quick-select buttons
- `.pressure-results` - Results display area with two volume outputs
- Ensure dark mode support using CSS variables
- Match visual style with flow velocity and other calculator sections

**Testing:**
View in browser with light and dark themes. Verify responsive layout, hover states, selected states, and that it matches the aesthetic of other calculator sections.

### Step 4: Implement Volume Section Selection Logic

**Files:**

- [src/js/pressure.js](src/js/pressure.js)

**What:**
Add functions to handle volume section selection:

- `gatherPressureInput()` - Collect all selected sections (array), pressure values, and k constant
- `calculateSectionVolume()` - Compute volume for each section type (pipe capacity, annulus between specific casings)
- `getTotalSelectedVolume()` - Sum all selected section volumes for use in pressure calculations
- Multi-select toggle behavior: clicking a section button toggles it on/off, allow multiple sections active simultaneously
- Handle dynamic section availability (e.g., show tubing option only if tubing is configured, show relevant annulus options based on active casings)

**Testing:**
Unit test the selection logic with various well configurations. Manually test in browser: select different sections, verify total volume updates correctly. Test with well config that has only drill pipe vs. one with tubing.

### Step 5: Wire Up Event Handlers and Integration

**Files:**

- [src/js/pressure.js](src/js/pressure.js)
- [src/js/script.js](src/js/script.js)
- [src/js/sidebar.js](src/js/sidebar.js)

**What:**
Complete the pressure module integration:

- `setupPressureUI()` - Wire event listeners to all inputs and buttons
- `renderPressureResults()` - Update DOM with calculated volumes
- Add pressure module imports to script.js
- Enable pressure tab in sidebar.js (add to KNOWN_SECTIONS, remove disabled attribute from button)
- Integrate with state persistence (save/load selected sections and pressure values)
- Call pressure calculations within main calculateVolume() function

**Testing:**
Full end-to-end test: Navigate to pressure tab, select sections, enter pressure values, verify calculations update in real-time. Test state persistence by refreshing page and confirming selections are restored. Verify undo/redo functionality works. Test with various well configurations.

### Step 6: Documentation and Final Polish

**Files:**

- [README.md](README.md)
- [CHANGELOG.md](CHANGELOG.md)

**What:**
Update documentation:

- Add pressure test feature description to README.md
- Document the calculation formula and k constants
- Add entry to CHANGELOG.md
- Review all code for self-explanatory naming
- Add any necessary JSDoc comments to public API functions
- Final accessibility review (keyboard navigation, ARIA labels, screen reader testing)

**Testing:**
Complete regression test of all calculator features. Verify pressure test works correctly alongside other features. Test keyboard navigation throughout the app. Run full test suite: `npm test`. Check code coverage for pressure.js module.

## Notes

### Calculation Formula

The formula for pressure test volume is:

```
V_liters = (V_m³ × ΔP_bar) / k
```

Where:

- V_m³ = Total volume of selected well sections in cubic meters
- ΔP_bar = Pressure differential in bar
- k = Fluid compressibility constant

### Two Calculations Required

1. **Low pressure test**: Volume needed to pressurize from 0 to low_pressure_bar
2. **High pressure test**: Volume needed to pressurize from low_pressure_bar to high_pressure_bar

### Volume Section Selection Logic

The calculator should dynamically show available sections based on current well configuration:

- Drill pipe capacity (always available if drill pipe configured)
- Tubing capacity (only if tubing is used instead of drill pipe)
- Annulus options: Generated based on active casings using format "DP/7" Annulus" (outer/inner notation)
- Each section button displays: "Section Name - X.XX m³" (e.g., "Drill Pipe Capacity - 25.4 m³")
- Multiple sections can be selected simultaneously; total volume is sum of all selected sections

### Fluid Type Constants (k values)

- WBM/brine: 21
- OBM: 18
- Base oil: 14
- KFLS: 35

### Input Validation

- Pressure inputs: Must be >= 0, maximum 1035 bar
- Low pressure default: 20 bar
- High pressure default: 345 bar
- Display validation errors if values are out of range

### UI Placement

- Navigation: Insert "Pressure" button between "Flow Velocity" and "Settings" in sidebar
- View: Insert pressure test section HTML between flow velocity and settings view sections
