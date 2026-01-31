# String Lift Calculator

**Branch:** `feature/string-lift-calculator`
**Description:** Add a String Lift calculator that computes lift force (in metric tons) from pressure acting on the annular area between casing ID and drill pipe OD

## Goal

Implement a "String Lift" calculator that calculates the upward force (in metric tons) from internal pressure acting on the annular area between casing inner diameter and drill pipe outer diameter. The formula is **F = P × A** where A is the annular area (OD² - ID²). The calculator will provide dropdown selection for casing sizes (using casing OD names but their ID values) and drill pipe sizes, with custom input options for both.

## Background Research

### Existing Infrastructure

- Navigation uses `data-section` attributes with sidebar.js managing section switching via `KNOWN_SECTIONS` Set
- "String Lift" button already exists in HTML as a disabled "Coming Soon" item (`data-section="lift"`)
- Pressure calculator (`pressure.js`) provides a pattern with `buildSelectableSections()` for creating section dropdowns
- State is gathered via `gatherWellConfig()` from state.js, `gatherDrillPipeInput()` from drillpipe.js

### Available Data Sources

- **Casing IDs**: Available in `OD` constant (keyed as ID → OD mappings) and gathered via `gatherWellConfig()`
- **Drill pipe ODs**: Available in `DRILLPIPE_CATALOG` with `od` property (2.875", 4", 5", 5.875")
- **Tubing ODs**: Available in `TUBING_CATALOG` with `od` property (4.5", 5.5")

### UI Patterns to Follow

- Input rows use `.input-row-trio` or `.input-row-inline` classes
- Preset buttons use `.quick-button` class with `.selected` state
- Results display uses empty state + populated state pattern
- Views are `<section class="app-view" data-view="[name]">` with `hidden` attribute

---

## Implementation Steps

### Step 1: Enable Navigation & Create Basic View Structure

**Files:**

- [index.html](index.html)
- [src/js/sidebar.js](src/js/sidebar.js)

**What:**

1. Move the "String Lift" button from "Coming Soon" section to main navigation (between Pressure and Settings)
2. Remove the `disabled`, `aria-disabled`, and `data-coming-soon` attributes
3. Add `'lift'` to the `KNOWN_SECTIONS` Set in sidebar.js
4. Create the basic `view-lift` section in HTML with placeholder content

**Testing:**

- Click "String Lift" in navigation → view should switch
- URL hash should update to `#lift`
- Section change event should fire
- Sidebar highlight should move to String Lift button

---

### Step 2: Create String Lift Module with Core Calculation

**Files:**

- `src/js/string-lift.js` (new file)

**What:**
Create the core calculation module with:

1. `computeAnnularArea({ casingID, drillpipeOD })` - Core formula: `A = π/4 × (casingID² - drillpipeOD²)` converting inches to m²
2. `computeLiftForce({ annularAreaM2, pressureBar })` - Calculate force: `F = P × A` where pressure is converted to Pa, result in metric tons
3. `getCasingOptions()` - Return all hardcoded casing sizes from constants (display OD name, use ID value)
4. `getDrillpipeOptions()` - Return all drill pipe sizes from DRILLPIPE_CATALOG
5. Export functions for testing

**Formulas:**

- Annular area: `A = π/4 × (ID_casing² - OD_drillpipe²)` in m²
- Lift force: `F = P × A` where P in Pa (bar × 100,000), A in m², F in Newtons → convert to metric tons (÷ 9806.65)

**Testing:**

- Unit tests for `computeAnnularArea()` with known values (e.g., 18 5/8" casing ID 17.755" × 5 7/8" DP = 0.142 m²)
- Unit tests for `computeLiftForce()` (e.g., 345 bar × 0.142 m² ≈ 500 tons)
- Verify casing options return correct ID values for each OD name

---

### Step 3: Build Complete UI with Input Controls

**Files:**

- [index.html](index.html)
- [src/css/style.css](src/css/style.css)

**What:**
Build the full String Lift UI matching the reference image layout:

1. **Header**: "Lift due to pressure" title with description "Calculate the upward force (tons) from internal pressure acting on pipe/plug/BOP"

2. **Casing Size Section**:

   - Label: "Casing size (OD)" with dropdown showing all casing OD names (18 5/8", 13 3/8", 9 5/8", 7", etc.)
   - Adjacent input field labeled "(Casing ID)" showing the corresponding ID value (editable for custom input)
   - Unit label "in"

3. **Drill Pipe Size Section**:

   - Label: "Drill pipe size (ID)" with dropdown (5 7/8", 5", 4", 2 7/8")
   - Adjacent input field showing OD value (editable for custom input)
   - Unit label "in"

4. **Pressure Input**:

   - Label: "Pressure"
   - Number input with unit selector dropdown (bar/psi)

5. **Info Note**:

   - "Area used for force" explanation
   - "Annular area (OD² - ID²) — pressure acts on pipe wall annulus"
   - "Note: This tool always calculates annular area"

6. **Results Display**:

   - Large red result card showing "Lift" label and value in metric tons (e.g., "500,4 tons")
   - Calculation breakdown below showing:
     - ID value in inches and meters
     - OD value in inches and meters
     - Annular area in m²
     - Pressure in Pa
     - Lift in tons (with kgf and N equivalents)
     - Formula: F = p × A

7. **Visual Diagram** (optional): Simple well schematic showing pressure acting upward

Add necessary CSS styles matching the card-based layout from reference image.

**Testing:**

- Casing dropdown shows all available sizes with OD names
- Selecting casing updates the ID input field automatically
- Drill pipe dropdown shows all available sizes
- Custom values can be entered in ID/OD fields
- Pressure accepts bar and psi with unit toggle

---

### Step 4: Wire Up Event Handlers & Rendering

**Files:**

- `src/js/string-lift.js`
- [src/js/script.js](src/js/script.js)
- [src/js/dom.js](src/js/dom.js)

**What:**

1. Add DOM element references in dom.js for new lift inputs:

   - `liftCasingSelect`, `liftCasingIdInput`
   - `liftDrillpipeSelect`, `liftDrillpipeOdInput`
   - `liftPressureInput`, `liftPressureUnitSelect`
   - `liftResultCard`, `liftResultValue`, `liftCalculationDetails`

2. Implement in string-lift.js:

   - `gatherStringLiftInput()` - Read casing ID, drillpipe OD, pressure (with unit conversion if psi)
   - `setupStringLiftUI()` - Populate dropdowns, wire change handlers
   - `renderStringLiftResults(results)` - Update result card and calculation breakdown
   - `onCasingSelect(value)` - Update ID input when dropdown changes
   - `onDrillpipeSelect(value)` - Update OD input when dropdown changes
   - Auto-recalculate on any input change

3. Integrate into script.js:
   - Import string-lift module
   - Call `setupStringLiftUI()` in main init

**Testing:**

- Select casing from dropdown → ID field auto-populates with correct value
- Select drill pipe from dropdown → OD field auto-populates
- Edit ID/OD fields manually → calculation updates (dropdown shows "custom")
- Change pressure → result recalculates immediately
- Toggle bar/psi → conversion applied correctly
- Result shows lift in metric tons with full calculation breakdown

---

### Step 5: Polish UI & Add Validation

**Files:**

- `src/js/string-lift.js`
- [src/css/style.css](src/css/style.css)

**What:**

1. Add input validation:

   - Casing ID must be > Drill pipe OD (show error if inverted)
   - Pressure must be positive
   - Display validation errors in UI (red border, error message)

2. Add empty/error states:

   - Show placeholder/empty result when inputs incomplete
   - Show clear error message when casing ID ≤ drillpipe OD

3. Calculation breakdown formatting:

   - Show ID in both inches and meters: "ID: 5.875 in (custom) (0,149 m)"
   - Show OD in both inches and meters: "OD: 17.755 in (actual 17,755 in / 0,451 m)"
   - Show annular area: "Annular area: 0,142 m²"
   - Show pressure in Pa: "Pressure: 34 500 000 Pa"
   - Show lift with multiple units: "Lift: 500,4 tons (500 421,4 kgf / 4 907 457,8 N)"
   - Show formula: "Calculation: F = p × A"

4. Polish styling:

   - Red result card matching reference image
   - Proper spacing and alignment
   - Responsive layout for mobile
   - European number formatting (comma as decimal separator)

5. Footer note: "Outputs in metric tons. Diameters should be entered in inches; pressure supports bar and psi."

**Testing:**

- Enter drillpipe OD > casing ID → see validation error
- Leave pressure empty → no result shown (graceful empty state)
- Calculation breakdown shows all intermediate values
- Mobile view displays correctly
- Number formatting uses commas for decimals (European style)

---

## Casing Size Reference Data

Based on existing constants, the casing dropdown should include these options (display OD name → use ID value):

| Display Name | ID Value (inches) | Source                       |
| ------------ | ----------------- | ---------------------------- |
| 30"          | 28 or 27          | conductor                    |
| 20"          | 17.5 or 18.73     | riser/surface                |
| 18 5/8"      | 17.8              | conductor/surface            |
| 13 3/8"      | 12.415 or 12.375  | intermediate                 |
| 11 1/2"      | 9.66              | tieback                      |
| 9 5/8"       | 8.535 or 8.921    | production/tieback           |
| 7"           | 6.276 or 6.184    | production/reservoir         |
| 5 1/2"       | 4.892 or 4.778    | reservoir/upper_completion   |
| 5"           | 4.276             | small_liner                  |
| 4 1/2"       | 3.958             | small_liner/upper_completion |

## Drill Pipe Size Reference Data

| Display Name | OD Value (inches) |
| ------------ | ----------------- |
| 5 7/8"       | 5.875             |
| 5"           | 5.0               |
| 4"           | 4.0               |
| 2 7/8"       | 2.875             |

---

## Clarifications (Resolved)

1. **Lift Calculation Formula**: Only annular area calculation needed, then F = P × A for lift force in metric tons. No volume calculations.

2. **Default Casing Sizes**: All hardcoded casing sizes available from dropdown menu (see reference table above).

3. **Length/Depth**: No length input required for main calculation. Optional manual depth for section selection if needed.

4. **Results Display**: Lift force in metric tons as primary output, with detailed calculation breakdown showing intermediate values (area, pressure conversion, formula).

5. **Reference Image**: Provided - shows dropdown selectors for casing/drill pipe with adjacent editable ID/OD fields, pressure input with unit selector, and red result card with calculation details.
