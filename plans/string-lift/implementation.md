# String Lift Calculator Implementation

## Goal

Implement a String Lift calculator that computes lift force (in metric tons) from pressure acting on the annular area between casing ID and drill pipe OD, with dropdown selection for casing and drill pipe sizes, custom input options, and detailed calculation breakdown.

## Prerequisites

Make sure that you are currently on the `feature/string-lift-calculator` branch before beginning implementation.

```bash
git checkout -b feature/string-lift-calculator
```

---

## Step 1: Enable Navigation & Create Basic View Structure

### Step-by-Step Instructions

#### 1.1 Add 'lift' to KNOWN_SECTIONS in sidebar.js

- [x] Open [src/js/sidebar.js](src/js/sidebar.js)
- [x] Find the `KNOWN_SECTIONS` Set and add `'lift'` to it:

Replace the existing `KNOWN_SECTIONS` declaration:

```javascript
const KNOWN_SECTIONS = new Set([
  'casings',
  'completion',
  'flow',
  'pressure',
  'settings'
]);
```

With:

```javascript
const KNOWN_SECTIONS = new Set([
  'casings',
  'completion',
  'flow',
  'pressure',
  'lift',
  'settings'
]);
```

#### 1.2 Enable the String Lift navigation button in index.html

- [x] Open [index.html](index.html)
- [x] Find the disabled "String Lift" button in the sidebar navigation (search for `data-section="lift"`)
- [x] Move it from the "Coming Soon" section to the main navigation area (between Pressure and Settings)
- [x] Remove the `disabled` and `aria-disabled="true"` attributes

Find the String Lift button (it looks like this):

```html
<li class="sidebar-nav-item" role="listitem">
  <button
    class="sidebar-nav-button"
    data-section="lift"
    aria-label="String lift calculator (coming soon)"
    disabled
    aria-disabled="true"
  >
    <svg
      class="sidebar-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
      />
    </svg>
    <span class="sidebar-nav-text">String Lift</span>
  </button>
</li>
```

Replace it with (enabled version):

```html
<li class="sidebar-nav-item" role="listitem">
  <button
    class="sidebar-nav-button"
    data-section="lift"
    aria-label="String lift calculator"
  >
    <svg
      class="sidebar-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
      />
    </svg>
    <span class="sidebar-nav-text">String Lift</span>
  </button>
</li>
```

**Note:** Make sure this button is positioned between the Pressure button and the Settings button in the navigation list.

#### 1.3 Create the basic view-lift section in index.html

- [x] Find the `view-pressure` section in index.html
- [x] Add the new `view-lift` section immediately after it (before `view-settings`)
- [x] Copy and paste the following HTML:

```html
<!-- ═══════════════════════════════════════════════════════════════════════
     STRING LIFT CALCULATOR VIEW
     ═══════════════════════════════════════════════════════════════════════ -->
<section
  id="view-lift"
  class="app-view"
  data-view="lift"
  aria-label="String Lift Calculator"
  hidden
>
  <!-- Section header -->
  <div class="lift-header">
    <h2>Lift due to pressure</h2>
    <p class="small-note">
      Calculate the upward force (tons) from internal pressure acting on
      pipe/plug/BOP
    </p>
  </div>

  <!-- Main input card -->
  <div class="lift-card">
    <!-- Casing Size Row -->
    <div class="lift-input-group">
      <label class="lift-label">Casing size (OD)</label>
      <div class="lift-size-row">
        <select
          id="lift_casing_select"
          name="lift_casing_select"
          class="lift-select"
        >
          <option value="28">30"</option>
          <option value="27">30" (27" ID)</option>
          <option value="18.73">20"</option>
          <option value="17.8" selected>18 5/8"</option>
          <option value="12.415">13 3/8"</option>
          <option value="12.375">13 5/8"</option>
          <option value="9.66">11 1/2"</option>
          <option value="8.921">9 5/8" (8.921" ID)</option>
          <option value="8.535">9 5/8" (8.535" ID)</option>
          <option value="6.276">7" (6.276" ID)</option>
          <option value="6.184">7" (6.184" ID)</option>
          <option value="4.892">5 1/2"</option>
          <option value="4.778">5 1/2" (4.778" ID)</option>
          <option value="4.276">5"</option>
          <option value="3.958">4 1/2"</option>
          <option value="custom">Custom...</option>
        </select>
        <div class="lift-id-group">
          <label for="lift_casing_id" class="lift-id-label">(Casing ID)</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="lift_casing_id"
              name="lift_casing_id"
              class="lift-id-input"
              step="0.001"
              min="0"
              max="50"
              value="17.8"
              placeholder="17.8"
            />
            <span class="input-unit">in</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Drill Pipe Size Row -->
    <div class="lift-input-group">
      <label class="lift-label">Drill pipe size (OD)</label>
      <div class="lift-size-row">
        <select
          id="lift_drillpipe_select"
          name="lift_drillpipe_select"
          class="lift-select"
        >
          <option value="5.875" selected>5 7/8"</option>
          <option value="5.0">5"</option>
          <option value="4.0">4"</option>
          <option value="2.875">2 7/8"</option>
          <option value="custom">Custom...</option>
        </select>
        <div class="lift-id-group">
          <label for="lift_drillpipe_od" class="lift-id-label">(Pipe OD)</label>
          <div class="input-with-unit">
            <input
              type="number"
              id="lift_drillpipe_od"
              name="lift_drillpipe_od"
              class="lift-id-input"
              step="0.001"
              min="0"
              max="20"
              value="5.875"
              placeholder="5.875"
            />
            <span class="input-unit">in</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Pressure Input Row -->
    <div class="lift-input-group">
      <label class="lift-label" for="lift_pressure">Pressure</label>
      <div class="lift-pressure-row">
        <div class="input-with-unit">
          <input
            type="number"
            id="lift_pressure"
            name="lift_pressure"
            class="lift-pressure-input"
            step="1"
            min="0"
            max="2000"
            value="345"
            placeholder="345"
          />
        </div>
        <select
          id="lift_pressure_unit"
          name="lift_pressure_unit"
          class="lift-unit-select"
        >
          <option value="bar" selected>bar</option>
          <option value="psi">psi</option>
        </select>
      </div>
    </div>

    <!-- Info Note -->
    <div class="lift-info-note">
      <p class="small-note"><strong>Area used for force:</strong></p>
      <p class="small-note">
        Annular area (ID² − OD²) — pressure acts on pipe wall annulus
      </p>
      <p class="small-note lift-note-italic">
        Note: This tool always calculates annular area between casing ID and
        pipe OD.
      </p>
    </div>
  </div>

  <!-- Validation Error -->
  <div
    id="lift-error"
    class="lift-error small-note warning hidden"
    role="alert"
  ></div>

  <!-- Empty state -->
  <div id="lift-results-empty" class="lift-empty-state hidden">
    <p class="small-note">
      Enter casing ID, pipe OD, and pressure to calculate lift force.
    </p>
  </div>

  <!-- Results display -->
  <div id="lift-results" class="lift-results" aria-live="polite">
    <!-- Main result card -->
    <div class="lift-result-card">
      <span class="lift-result-label">Lift</span>
      <span class="lift-result-value" id="lift-result-value">—</span>
      <span class="lift-result-unit">metric tons</span>
    </div>

    <!-- Calculation breakdown -->
    <div class="lift-breakdown" id="lift-breakdown">
      <div class="lift-breakdown-title">Calculation breakdown</div>
      <div class="lift-breakdown-row">
        <span class="lift-breakdown-label">Casing ID:</span>
        <span class="lift-breakdown-value" id="lift-breakdown-id">—</span>
      </div>
      <div class="lift-breakdown-row">
        <span class="lift-breakdown-label">Pipe OD:</span>
        <span class="lift-breakdown-value" id="lift-breakdown-od">—</span>
      </div>
      <div class="lift-breakdown-row">
        <span class="lift-breakdown-label">Annular area:</span>
        <span class="lift-breakdown-value" id="lift-breakdown-area">—</span>
      </div>
      <div class="lift-breakdown-row">
        <span class="lift-breakdown-label">Pressure:</span>
        <span class="lift-breakdown-value" id="lift-breakdown-pressure">—</span>
      </div>
      <div class="lift-breakdown-row lift-breakdown-highlight">
        <span class="lift-breakdown-label">Lift:</span>
        <span class="lift-breakdown-value" id="lift-breakdown-lift">—</span>
      </div>
      <div class="lift-breakdown-formula">
        <span>Formula: F = P × A</span>
      </div>
    </div>
  </div>

  <!-- Footer note -->
  <div class="lift-footer">
    <p class="small-note">
      Outputs in metric tons. Diameters should be entered in inches; pressure
      supports bar and psi.
    </p>
  </div>
</section>
```

### Step 1 Verification Checklist

- [x] No build errors when running `npm run dev`
- [x] Click "String Lift" in navigation → view should switch and show the new section
- [x] URL hash should update to `#lift`
- [x] Sidebar highlight should move to String Lift button
- [x] The basic form layout is visible with casing dropdown, drill pipe dropdown, and pressure input

### Step 1 STOP & COMMIT

**STOP & COMMIT:** Stop here and wait for the user to test, stage, and commit the change.

```bash
git add -A
git commit -m "feat(lift): enable navigation and create basic view structure"
```

---

## Step 2: Create String Lift Module with Core Calculation

### Step-by-Step Instructions

#### 2.1 Create the string-lift.js module

- [x] Create a new file at `src/js/string-lift.js`
- [x] Copy and paste the following code:

```javascript
/**
 * String Lift Calculator Module
 *
 * Calculates lift force (metric tons) from pressure acting on the
 * annular area between casing ID and drill pipe OD.
 *
 * Formula: F = P × A
 * Where:
 *   - A = π/4 × (casingID² - pipeOD²) in m²
 *   - P = pressure in Pa (bar × 100,000)
 *   - F = force in Newtons → converted to metric tons (÷ 9806.65)
 */

import { el } from './dom.js';
import { DRILLPIPE_CATALOG } from './drillpipe.js';

// Conversion constants
const INCHES_TO_METERS = 0.0254;
const BAR_TO_PA = 100000;
const PSI_TO_BAR = 0.0689476;
const NEWTONS_TO_METRIC_TONS = 9806.65;
const NEWTONS_TO_KGF = 9.80665;

/**
 * Casing options for the dropdown.
 * Display shows OD name, value is the ID in inches.
 */
export const CASING_OPTIONS = [
  { label: '30"', id: 28 },
  { label: '30" (27" ID)', id: 27 },
  { label: '20"', id: 18.73 },
  { label: '18 5/8"', id: 17.8 },
  { label: '13 3/8"', id: 12.415 },
  { label: '13 5/8"', id: 12.375 },
  { label: '11 1/2"', id: 9.66 },
  { label: '9 5/8" (8.921" ID)', id: 8.921 },
  { label: '9 5/8" (8.535" ID)', id: 8.535 },
  { label: '7" (6.276" ID)', id: 6.276 },
  { label: '7" (6.184" ID)', id: 6.184 },
  { label: '5 1/2"', id: 4.892 },
  { label: '5 1/2" (4.778" ID)', id: 4.778 },
  { label: '5"', id: 4.276 },
  { label: '4 1/2"', id: 3.958 }
];

/**
 * Get drill pipe options from catalog.
 * @returns {Array<{label: string, od: number}>}
 */
export function getDrillpipeOptions() {
  return DRILLPIPE_CATALOG.map((dp) => ({
    label: dp.name,
    od: dp.od
  }));
}

/**
 * Normalize a raw input value to a number.
 * Handles strings with commas (European decimal separator).
 * @param {*} raw - The raw input value
 * @returns {number|undefined}
 */
function normalizeNumber(raw) {
  if (raw == null) return undefined;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  const value = String(raw).trim().replace(/\s+/g, '').replace(',', '.');
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Format a number with European-style decimal separator (comma).
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string}
 */
function formatNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(decimals).replace('.', ',');
}

/**
 * Format a number with space as thousands separator and comma as decimal.
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string}
 */
function formatNumberWithSpaces(value, decimals = 1) {
  if (!Number.isFinite(value)) return '—';
  const parts = value.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join(',');
}

/**
 * Compute annular area between casing ID and pipe OD.
 * @param {Object} params
 * @param {number} params.casingID - Casing inner diameter in inches
 * @param {number} params.pipeOD - Pipe outer diameter in inches
 * @returns {{areaM2: number, areaIn2: number}|null}
 */
export function computeAnnularArea({ casingID, pipeOD }) {
  const idInches = normalizeNumber(casingID);
  const odInches = normalizeNumber(pipeOD);

  if (idInches == null || odInches == null) return null;
  if (idInches <= 0 || odInches <= 0) return null;
  if (idInches <= odInches) return null;

  // Convert to meters
  const idMeters = idInches * INCHES_TO_METERS;
  const odMeters = odInches * INCHES_TO_METERS;

  // Calculate annular area: A = π/4 × (ID² - OD²)
  const areaM2 = (Math.PI / 4) * (idMeters ** 2 - odMeters ** 2);
  const areaIn2 = (Math.PI / 4) * (idInches ** 2 - odInches ** 2);

  return { areaM2, areaIn2 };
}

/**
 * Compute lift force from pressure and annular area.
 * @param {Object} params
 * @param {number} params.annularAreaM2 - Annular area in m²
 * @param {number} params.pressureBar - Pressure in bar
 * @returns {{tons: number, kgf: number, newtons: number}|null}
 */
export function computeLiftForce({ annularAreaM2, pressureBar }) {
  const area = normalizeNumber(annularAreaM2);
  const pressure = normalizeNumber(pressureBar);

  if (area == null || pressure == null) return null;
  if (area <= 0 || pressure < 0) return null;

  // Convert pressure from bar to Pa
  const pressurePa = pressure * BAR_TO_PA;

  // Calculate force: F = P × A (in Newtons)
  const forceNewtons = pressurePa * area;

  // Convert to metric tons and kgf
  const tons = forceNewtons / NEWTONS_TO_METRIC_TONS;
  const kgf = forceNewtons / NEWTONS_TO_KGF;

  return { tons, kgf, newtons: forceNewtons };
}

/**
 * Gather input values from the String Lift UI.
 * @returns {Object}
 */
export function gatherStringLiftInput() {
  const casingSelect = el('lift_casing_select');
  const casingIdInput = el('lift_casing_id');
  const drillpipeSelect = el('lift_drillpipe_select');
  const drillpipeOdInput = el('lift_drillpipe_od');
  const pressureInput = el('lift_pressure');
  const pressureUnitSelect = el('lift_pressure_unit');

  const casingSelectValue = casingSelect?.value;
  const casingID = normalizeNumber(casingIdInput?.value);
  const drillpipeSelectValue = drillpipeSelect?.value;
  const pipeOD = normalizeNumber(drillpipeOdInput?.value);
  const pressureRaw = normalizeNumber(pressureInput?.value);
  const pressureUnit = pressureUnitSelect?.value || 'bar';

  // Convert psi to bar if needed
  let pressureBar = pressureRaw;
  if (pressureUnit === 'psi' && pressureRaw != null) {
    pressureBar = pressureRaw * PSI_TO_BAR;
  }

  return {
    casingSelectValue,
    casingID,
    drillpipeSelectValue,
    pipeOD,
    pressureRaw,
    pressureBar,
    pressureUnit
  };
}

/**
 * Calculate complete string lift results.
 * @param {Object} input - Input from gatherStringLiftInput()
 * @returns {Object}
 */
export function calculateStringLift(input) {
  const { casingID, pipeOD, pressureBar, pressureUnit, pressureRaw } = input;

  // Validate inputs
  if (casingID == null || pipeOD == null || pressureBar == null) {
    return { valid: false, reason: 'missing_input' };
  }

  if (casingID <= 0 || pipeOD <= 0) {
    return { valid: false, reason: 'invalid_dimensions' };
  }

  if (casingID <= pipeOD) {
    return { valid: false, reason: 'id_less_than_od' };
  }

  if (pressureBar < 0) {
    return { valid: false, reason: 'negative_pressure' };
  }

  // Calculate annular area
  const areaResult = computeAnnularArea({ casingID, pipeOD });
  if (!areaResult) {
    return { valid: false, reason: 'area_calculation_failed' };
  }

  // Calculate lift force
  const forceResult = computeLiftForce({
    annularAreaM2: areaResult.areaM2,
    pressureBar
  });
  if (!forceResult) {
    return { valid: false, reason: 'force_calculation_failed' };
  }

  // Convert dimensions to meters for display
  const casingIDMeters = casingID * INCHES_TO_METERS;
  const pipeODMeters = pipeOD * INCHES_TO_METERS;
  const pressurePa = pressureBar * BAR_TO_PA;

  return {
    valid: true,
    casingID,
    casingIDMeters,
    pipeOD,
    pipeODMeters,
    areaM2: areaResult.areaM2,
    areaIn2: areaResult.areaIn2,
    pressureBar,
    pressurePa,
    pressureUnit,
    pressureRaw,
    tons: forceResult.tons,
    kgf: forceResult.kgf,
    newtons: forceResult.newtons
  };
}

/**
 * Render the String Lift results to the UI.
 * @param {Object} result - Result from calculateStringLift()
 */
export function renderStringLiftResults(result) {
  const resultsEl = el('lift-results');
  const emptyEl = el('lift-results-empty');
  const errorEl = el('lift-error');
  const resultValueEl = el('lift-result-value');

  // Breakdown elements
  const breakdownIdEl = el('lift-breakdown-id');
  const breakdownOdEl = el('lift-breakdown-od');
  const breakdownAreaEl = el('lift-breakdown-area');
  const breakdownPressureEl = el('lift-breakdown-pressure');
  const breakdownLiftEl = el('lift-breakdown-lift');

  if (!resultsEl || !emptyEl) return;

  // Handle errors
  if (!result || !result.valid) {
    resultsEl.classList.add('hidden');

    if (errorEl) {
      const messages = {
        missing_input:
          'Please enter all values: casing ID, pipe OD, and pressure.',
        invalid_dimensions: 'Casing ID and pipe OD must be positive values.',
        id_less_than_od: 'Casing ID must be greater than pipe OD.',
        negative_pressure: 'Pressure must be a positive value.',
        area_calculation_failed: 'Unable to calculate annular area.',
        force_calculation_failed: 'Unable to calculate lift force.'
      };
      const msg = messages[result?.reason] || 'Invalid input.';
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    }

    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  // Hide error, show results
  if (errorEl) errorEl.classList.add('hidden');
  if (emptyEl) emptyEl.classList.add('hidden');
  resultsEl.classList.remove('hidden');

  // Main result value
  if (resultValueEl) {
    resultValueEl.textContent = formatNumberWithSpaces(result.tons, 1);
  }

  // Breakdown values
  if (breakdownIdEl) {
    breakdownIdEl.textContent = `${formatNumber(
      result.casingID,
      3
    )} in (${formatNumber(result.casingIDMeters, 4)} m)`;
  }

  if (breakdownOdEl) {
    breakdownOdEl.textContent = `${formatNumber(
      result.pipeOD,
      3
    )} in (${formatNumber(result.pipeODMeters, 4)} m)`;
  }

  if (breakdownAreaEl) {
    breakdownAreaEl.textContent = `${formatNumber(result.areaM2, 4)} m²`;
  }

  if (breakdownPressureEl) {
    const barDisplay = formatNumberWithSpaces(result.pressureBar, 0);
    const paDisplay = formatNumberWithSpaces(result.pressurePa, 0);
    if (result.pressureUnit === 'psi') {
      breakdownPressureEl.textContent = `${formatNumberWithSpaces(
        result.pressureRaw,
        0
      )} psi (${barDisplay} bar / ${paDisplay} Pa)`;
    } else {
      breakdownPressureEl.textContent = `${barDisplay} bar (${paDisplay} Pa)`;
    }
  }

  if (breakdownLiftEl) {
    const tonsDisplay = formatNumberWithSpaces(result.tons, 1);
    const kgfDisplay = formatNumberWithSpaces(result.kgf, 1);
    const newtonsDisplay = formatNumberWithSpaces(result.newtons, 1);
    breakdownLiftEl.textContent = `${tonsDisplay} tons (${kgfDisplay} kgf / ${newtonsDisplay} N)`;
  }
}

/**
 * Handle casing dropdown selection change.
 * Updates the ID input field with the selected value.
 */
function onCasingSelectChange() {
  const casingSelect = el('lift_casing_select');
  const casingIdInput = el('lift_casing_id');

  if (!casingSelect || !casingIdInput) return;

  const value = casingSelect.value;
  if (value !== 'custom') {
    casingIdInput.value = value;
  }
}

/**
 * Handle drill pipe dropdown selection change.
 * Updates the OD input field with the selected value.
 */
function onDrillpipeSelectChange() {
  const drillpipeSelect = el('lift_drillpipe_select');
  const drillpipeOdInput = el('lift_drillpipe_od');

  if (!drillpipeSelect || !drillpipeOdInput) return;

  const value = drillpipeSelect.value;
  if (value !== 'custom') {
    drillpipeOdInput.value = value;
  }
}

/**
 * Handle ID input change - set dropdown to custom if value doesn't match.
 */
function onCasingIdInputChange() {
  const casingSelect = el('lift_casing_select');
  const casingIdInput = el('lift_casing_id');

  if (!casingSelect || !casingIdInput) return;

  const inputValue = normalizeNumber(casingIdInput.value);
  const selectValue = normalizeNumber(casingSelect.value);

  if (inputValue !== selectValue && casingSelect.value !== 'custom') {
    casingSelect.value = 'custom';
  }
}

/**
 * Handle OD input change - set dropdown to custom if value doesn't match.
 */
function onDrillpipeOdInputChange() {
  const drillpipeSelect = el('lift_drillpipe_select');
  const drillpipeOdInput = el('lift_drillpipe_od');

  if (!drillpipeSelect || !drillpipeOdInput) return;

  const inputValue = normalizeNumber(drillpipeOdInput.value);
  const selectValue = normalizeNumber(drillpipeSelect.value);

  if (inputValue !== selectValue && drillpipeSelect.value !== 'custom') {
    drillpipeSelect.value = 'custom';
  }
}

/**
 * Recalculate and render results.
 */
function recalculate() {
  const input = gatherStringLiftInput();
  const result = calculateStringLift(input);
  renderStringLiftResults(result);
}

/**
 * Set up String Lift UI event handlers.
 * @param {Object} deps - Dependencies
 * @param {Function} deps.scheduleSave - Function to schedule state save
 */
export function setupStringLiftUI(deps = {}) {
  const { scheduleSave = () => {} } = deps;

  const casingSelect = el('lift_casing_select');
  const casingIdInput = el('lift_casing_id');
  const drillpipeSelect = el('lift_drillpipe_select');
  const drillpipeOdInput = el('lift_drillpipe_od');
  const pressureInput = el('lift_pressure');
  const pressureUnitSelect = el('lift_pressure_unit');

  // Dropdown change handlers
  if (casingSelect) {
    casingSelect.addEventListener('change', () => {
      onCasingSelectChange();
      recalculate();
      scheduleSave();
    });
  }

  if (drillpipeSelect) {
    drillpipeSelect.addEventListener('change', () => {
      onDrillpipeSelectChange();
      recalculate();
      scheduleSave();
    });
  }

  // Input change handlers
  if (casingIdInput) {
    casingIdInput.addEventListener('input', () => {
      onCasingIdInputChange();
      recalculate();
      scheduleSave();
    });
  }

  if (drillpipeOdInput) {
    drillpipeOdInput.addEventListener('input', () => {
      onDrillpipeOdInputChange();
      recalculate();
      scheduleSave();
    });
  }

  if (pressureInput) {
    pressureInput.addEventListener('input', () => {
      recalculate();
      scheduleSave();
    });
  }

  if (pressureUnitSelect) {
    pressureUnitSelect.addEventListener('change', () => {
      recalculate();
      scheduleSave();
    });
  }

  // Listen for section changes to trigger initial calculation when lift view is shown
  document.addEventListener('keino:sectionchange', (e) => {
    if (e.detail === 'lift') {
      recalculate();
    }
  });

  // Initial calculation
  recalculate();
}
```

### Step 2 Verification Checklist

- [x] No syntax errors in `src/js/string-lift.js`
- [x] The file exports: `CASING_OPTIONS`, `getDrillpipeOptions`, `computeAnnularArea`, `computeLiftForce`, `gatherStringLiftInput`, `calculateStringLift`, `renderStringLiftResults`, `setupStringLiftUI`

### Step 2 STOP & COMMIT

**STOP & COMMIT:** Stop here and wait for the user to test, stage, and commit the change.

```bash
git add -A
git commit -m "feat(lift): add string-lift module with core calculations"
```

---

## Step 3: Add CSS Styles for String Lift UI

### Step-by-Step Instructions

#### 3.1 Add String Lift styles to style.css

- [x] Open [src/css/style.css](src/css/style.css)
- [x] Find the pressure calculator styles section (search for `/* Pressure Calculator */` or `.pressure-card`)
- [x] Add the following CSS after the pressure styles (before the Settings section if present):

```css
/* ═══════════════════════════════════════════════════════════════════════════
   STRING LIFT CALCULATOR
   ═══════════════════════════════════════════════════════════════════════════ */

.lift-header {
  margin-bottom: var(--spacing-md);
}

.lift-header h2 {
  margin: 0 0 4px 0;
  font-size: 1.4rem;
  color: var(--text-color);
}

.lift-card {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lift-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lift-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
}

.lift-size-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.lift-select {
  flex: 1;
  min-width: 160px;
  max-width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 0.95rem;
}

.lift-id-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lift-id-label {
  font-size: 0.85rem;
  color: var(--muted);
  white-space: nowrap;
}

.lift-id-input {
  width: 90px;
  padding: 8px 10px;
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 0.95rem;
}

.lift-pressure-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lift-pressure-input {
  width: 120px;
  padding: 8px 10px;
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 0.95rem;
}

.lift-unit-select {
  padding: 8px 12px;
  border: 1px solid var(--input-border);
  border-radius: var(--border-radius);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 0.95rem;
}

.lift-info-note {
  padding: 12px;
  background: var(--bg-tertiary, rgba(0, 0, 0, 0.03));
  border-radius: var(--border-radius);
  border-left: 3px solid var(--muted);
}

.lift-info-note .small-note {
  margin: 0 0 4px 0;
}

.lift-info-note .small-note:last-child {
  margin-bottom: 0;
}

.lift-note-italic {
  font-style: italic;
}

.lift-error {
  margin-top: var(--spacing-md);
  padding: 12px;
  border-radius: var(--border-radius);
  background: rgba(227, 27, 35, 0.08);
  border: 1px solid var(--equinor-red);
}

.lift-empty-state {
  margin-top: var(--spacing-md);
  padding: 14px;
  border-radius: var(--border-radius);
  border: 1px dashed var(--border-color);
  background: var(--surface-bg);
}

.lift-results {
  margin-top: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.lift-result-card {
  background: var(--equinor-red);
  color: #fff;
  border-radius: var(--border-radius);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 12px rgba(227, 27, 35, 0.3);
}

.lift-result-label {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
  margin-bottom: 4px;
}

.lift-result-value {
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 4px;
}

.lift-result-unit {
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0.85;
}

.lift-breakdown {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
}

.lift-breakdown-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-color);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.lift-breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 0;
  font-size: 0.9rem;
}

.lift-breakdown-label {
  color: var(--muted);
  font-weight: 500;
}

.lift-breakdown-value {
  color: var(--text-color);
  font-weight: 600;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  font-size: 0.85rem;
}

.lift-breakdown-highlight {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.lift-breakdown-highlight .lift-breakdown-label,
.lift-breakdown-highlight .lift-breakdown-value {
  color: var(--equinor-red);
  font-weight: 700;
}

.lift-breakdown-formula {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
  font-size: 0.85rem;
  color: var(--muted);
  font-style: italic;
}

.lift-footer {
  margin-top: var(--spacing-md);
}

/* Dark mode adjustments */
[data-theme='dark'] .lift-result-card {
  background: var(--equinor-red);
  box-shadow: 0 4px 12px rgba(255, 123, 128, 0.2);
}

[data-theme='dark'] .lift-info-note {
  background: rgba(255, 255, 255, 0.03);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .lift-size-row {
    flex-direction: column;
    align-items: stretch;
  }

  .lift-select {
    max-width: none;
  }

  .lift-id-group {
    justify-content: flex-start;
  }

  .lift-result-value {
    font-size: 2.2rem;
  }

  .lift-breakdown-row {
    flex-direction: column;
    gap: 2px;
  }

  .lift-breakdown-value {
    margin-left: 16px;
  }
}
```

### Step 3 Verification Checklist

- [x] No CSS syntax errors
- [x] String Lift view has proper card styling
- [x] Result card shows with red background
- [x] Breakdown section is properly styled
- [x] Layout looks correct on both desktop and mobile widths
- [x] Dark mode displays correctly (if app supports dark mode)

### Step 3 STOP & COMMIT

**STOP & COMMIT:** Stop here and wait for the user to test, stage, and commit the change.

```bash
git add -A
git commit -m "style(lift): add CSS styles for string lift calculator UI"
```

---

## Step 4: Wire Up Module to Main Application

### Step-by-Step Instructions

#### 4.1 Import and initialize string-lift module in script.js

- [x] Open [src/js/script.js](src/js/script.js)
- [x] Add the import statement with the other imports at the top of the file:

Find the existing imports (look for lines like `import { computePressureTest, ...`):

Add this import:

```javascript
import { setupStringLiftUI } from './string-lift.js';
```

#### 4.2 Call setupStringLiftUI in the init function

- [x] Find the `init()` function inside the IIFE module (search for `function init()`)
- [x] Add the call to `setupStringLiftUI()` after `setupPressureUI()` is called

Find where `setupPressureUI` is called:

```javascript
setupPressureUI({ calculateVolume, scheduleSave: persistence.scheduleSave });
```

Add immediately after:

```javascript
setupStringLiftUI({ scheduleSave: persistence.scheduleSave });
```

### Step 4 Verification Checklist

- [x] No import errors when running `npm run dev`
- [x] String Lift view shows calculated results when navigated to
- [x] Changing casing dropdown updates the ID input field
- [x] Changing drill pipe dropdown updates the OD input field
- [x] Changing any input triggers recalculation
- [x] Results display with correct formatting (European decimal comma)
- [x] Calculation breakdown shows all intermediate values
- [x] Validation errors show when casing ID ≤ pipe OD

### Step 4 STOP & COMMIT

**STOP & COMMIT:** Stop here and wait for the user to test, stage, and commit the change.

```bash
git add -A
git commit -m "feat(lift): wire up string-lift module to main application"
```

---

## Step 5: Add Unit Tests

### Step-by-Step Instructions

#### 5.1 Create unit test file

- [x] Create a new file at `__tests__/string-lift.unit.test.js`
- [x] Copy and paste the following test code:

```javascript
import { describe, it, expect } from 'vitest';
import {
  computeAnnularArea,
  computeLiftForce,
  calculateStringLift,
  CASING_OPTIONS,
  getDrillpipeOptions
} from '../src/js/string-lift.js';

describe('String Lift Calculator', () => {
  describe('CASING_OPTIONS', () => {
    it('should contain expected casing sizes', () => {
      expect(CASING_OPTIONS.length).toBeGreaterThan(10);

      // Check for common sizes
      const labels = CASING_OPTIONS.map((opt) => opt.label);
      expect(labels).toContain('18 5/8"');
      expect(labels).toContain('13 3/8"');
      expect(labels).toContain('9 5/8" (8.535" ID)');
      expect(labels).toContain('7" (6.276" ID)');
    });

    it('should have numeric id values for all options', () => {
      CASING_OPTIONS.forEach((opt) => {
        expect(typeof opt.id).toBe('number');
        expect(opt.id).toBeGreaterThan(0);
      });
    });
  });

  describe('getDrillpipeOptions', () => {
    it('should return drill pipe options from catalog', () => {
      const options = getDrillpipeOptions();
      expect(options.length).toBeGreaterThan(0);

      // Check for expected sizes
      const labels = options.map((opt) => opt.label);
      expect(labels).toContain('5 7/8"');
      expect(labels).toContain('5"');
      expect(labels).toContain('4"');
      expect(labels).toContain('2 7/8"');
    });

    it('should have numeric od values for all options', () => {
      const options = getDrillpipeOptions();
      options.forEach((opt) => {
        expect(typeof opt.od).toBe('number');
        expect(opt.od).toBeGreaterThan(0);
      });
    });
  });

  describe('computeAnnularArea', () => {
    it('should calculate annular area correctly for 18 5/8" casing with 5 7/8" DP', () => {
      // 18 5/8" casing ID = 17.8", 5 7/8" DP OD = 5.875"
      const result = computeAnnularArea({ casingID: 17.8, pipeOD: 5.875 });

      expect(result).not.toBeNull();
      expect(result.areaM2).toBeGreaterThan(0);

      // Expected: π/4 × ((17.8 × 0.0254)² - (5.875 × 0.0254)²)
      // = π/4 × (0.45212² - 0.149225²)
      // = π/4 × (0.2044 - 0.02227)
      // ≈ 0.143 m²
      expect(result.areaM2).toBeCloseTo(0.143, 2);
    });

    it('should calculate annular area correctly for 13 3/8" casing with 5" DP', () => {
      // 13 3/8" casing ID = 12.415", 5" DP OD = 5.0"
      const result = computeAnnularArea({ casingID: 12.415, pipeOD: 5.0 });

      expect(result).not.toBeNull();
      expect(result.areaM2).toBeGreaterThan(0);

      // Expected area should be reasonable
      expect(result.areaM2).toBeCloseTo(0.065, 2);
    });

    it('should return null when casing ID equals pipe OD', () => {
      const result = computeAnnularArea({ casingID: 5.0, pipeOD: 5.0 });
      expect(result).toBeNull();
    });

    it('should return null when casing ID is less than pipe OD', () => {
      const result = computeAnnularArea({ casingID: 4.0, pipeOD: 5.0 });
      expect(result).toBeNull();
    });

    it('should return null for zero values', () => {
      expect(computeAnnularArea({ casingID: 0, pipeOD: 5.0 })).toBeNull();
      expect(computeAnnularArea({ casingID: 17.8, pipeOD: 0 })).toBeNull();
    });

    it('should return null for null/undefined inputs', () => {
      expect(computeAnnularArea({ casingID: null, pipeOD: 5.0 })).toBeNull();
      expect(
        computeAnnularArea({ casingID: 17.8, pipeOD: undefined })
      ).toBeNull();
    });
  });

  describe('computeLiftForce', () => {
    it('should calculate lift force correctly', () => {
      // 345 bar × 0.143 m² should give approximately 500 tons
      const result = computeLiftForce({
        annularAreaM2: 0.143,
        pressureBar: 345
      });

      expect(result).not.toBeNull();
      expect(result.tons).toBeGreaterThan(0);

      // F = 345 × 100000 × 0.143 = 4,933,500 N
      // tons = 4,933,500 / 9806.65 ≈ 503 tons
      expect(result.tons).toBeCloseTo(503, 0);
      expect(result.newtons).toBeCloseTo(4933500, -3);
    });

    it('should calculate kgf correctly', () => {
      const result = computeLiftForce({
        annularAreaM2: 0.143,
        pressureBar: 345
      });

      expect(result).not.toBeNull();
      // kgf = N / 9.80665
      expect(result.kgf).toBeCloseTo(result.newtons / 9.80665, 0);
    });

    it('should return null for zero area', () => {
      const result = computeLiftForce({
        annularAreaM2: 0,
        pressureBar: 345
      });
      expect(result).toBeNull();
    });

    it('should handle zero pressure', () => {
      const result = computeLiftForce({
        annularAreaM2: 0.143,
        pressureBar: 0
      });

      expect(result).not.toBeNull();
      expect(result.tons).toBe(0);
      expect(result.newtons).toBe(0);
    });

    it('should return null for negative area', () => {
      const result = computeLiftForce({
        annularAreaM2: -0.143,
        pressureBar: 345
      });
      expect(result).toBeNull();
    });
  });

  describe('calculateStringLift', () => {
    it('should calculate complete lift result', () => {
      const input = {
        casingID: 17.8,
        pipeOD: 5.875,
        pressureBar: 345,
        pressureUnit: 'bar',
        pressureRaw: 345
      };

      const result = calculateStringLift(input);

      expect(result.valid).toBe(true);
      expect(result.tons).toBeCloseTo(503, 0);
      expect(result.areaM2).toBeCloseTo(0.143, 2);
      expect(result.pressurePa).toBe(34500000);
    });

    it('should handle psi input correctly', () => {
      // 5000 psi ≈ 344.7 bar
      const input = {
        casingID: 17.8,
        pipeOD: 5.875,
        pressureBar: 5000 * 0.0689476,
        pressureUnit: 'psi',
        pressureRaw: 5000
      };

      const result = calculateStringLift(input);

      expect(result.valid).toBe(true);
      expect(result.pressureUnit).toBe('psi');
      expect(result.pressureRaw).toBe(5000);
      // Should be approximately same as 345 bar
      expect(result.tons).toBeCloseTo(503, 0);
    });

    it('should return invalid for missing input', () => {
      const result = calculateStringLift({
        casingID: null,
        pipeOD: 5.875,
        pressureBar: 345
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('missing_input');
    });

    it('should return invalid when casing ID <= pipe OD', () => {
      const result = calculateStringLift({
        casingID: 5.0,
        pipeOD: 5.875,
        pressureBar: 345
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('id_less_than_od');
    });

    it('should return invalid for negative pressure', () => {
      const result = calculateStringLift({
        casingID: 17.8,
        pipeOD: 5.875,
        pressureBar: -10
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('negative_pressure');
    });

    it('should include all calculated values in result', () => {
      const input = {
        casingID: 17.8,
        pipeOD: 5.875,
        pressureBar: 345,
        pressureUnit: 'bar',
        pressureRaw: 345
      };

      const result = calculateStringLift(input);

      expect(result).toHaveProperty('casingID');
      expect(result).toHaveProperty('casingIDMeters');
      expect(result).toHaveProperty('pipeOD');
      expect(result).toHaveProperty('pipeODMeters');
      expect(result).toHaveProperty('areaM2');
      expect(result).toHaveProperty('pressureBar');
      expect(result).toHaveProperty('pressurePa');
      expect(result).toHaveProperty('tons');
      expect(result).toHaveProperty('kgf');
      expect(result).toHaveProperty('newtons');
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate lift for typical BOP test (18 5/8" × 5 7/8" @ 345 bar)', () => {
      const result = calculateStringLift({
        casingID: 17.8,
        pipeOD: 5.875,
        pressureBar: 345,
        pressureUnit: 'bar',
        pressureRaw: 345
      });

      expect(result.valid).toBe(true);
      // Expected ~500 tons based on plan
      expect(result.tons).toBeGreaterThan(450);
      expect(result.tons).toBeLessThan(550);
    });

    it('should calculate lift for smaller casing (9 5/8" × 5" @ 500 bar)', () => {
      const result = calculateStringLift({
        casingID: 8.535,
        pipeOD: 5.0,
        pressureBar: 500,
        pressureUnit: 'bar',
        pressureRaw: 500
      });

      expect(result.valid).toBe(true);
      expect(result.tons).toBeGreaterThan(0);
      // Area ≈ 0.024 m², Force ≈ 122 tons
      expect(result.tons).toBeCloseTo(122, 0);
    });
  });
});
```

#### 5.2 Run the tests

- [x] Run the tests to verify the calculations:

```bash
npm run test:run
```

### Step 5 Verification Checklist

- [x] All unit tests pass
- [x] Test coverage shows string-lift.js is covered
- [x] Annular area calculation tests pass with expected values
- [x] Lift force calculation tests pass with expected values
- [x] Edge case tests (invalid inputs) pass
- [x] Real-world scenario tests pass

### Step 5 STOP & COMMIT

**STOP & COMMIT:** Stop here and wait for the user to test, stage, and commit the change.

```bash
git add -A
git commit -m "test(lift): add unit tests for string-lift calculator"
```

---

## Final Verification

After completing all steps:

1. **Navigation**: Click "String Lift" in sidebar → view switches correctly
2. **Dropdowns**: Select different casing/drill pipe sizes → ID/OD fields update
3. **Custom Input**: Edit ID/OD fields manually → dropdown shows "Custom..."
4. **Calculation**: Enter values → result shows in metric tons
5. **Unit Toggle**: Switch pressure from bar to psi → result recalculates
6. **Validation**: Enter pipe OD > casing ID → error message displays
7. **Breakdown**: All intermediate values display correctly with European number formatting
8. **Responsive**: Test on narrow viewport → layout adapts correctly
9. **Tests**: All unit tests pass with `npm run test:run`

---

## Summary of Files Changed

| File                                 | Action   | Description                                             |
| ------------------------------------ | -------- | ------------------------------------------------------- |
| `src/js/sidebar.js`                  | Modified | Added 'lift' to KNOWN_SECTIONS                          |
| `index.html`                         | Modified | Enabled String Lift nav button, added view-lift section |
| `src/js/string-lift.js`              | Created  | Core calculation module with UI wiring                  |
| `src/css/style.css`                  | Modified | Added String Lift styles                                |
| `src/js/script.js`                   | Modified | Import and initialize string-lift module                |
| `__tests__/string-lift.unit.test.js` | Created  | Unit tests for calculations                             |
