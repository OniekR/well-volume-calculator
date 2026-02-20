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
import { getCasingDefinitions, getDrillpipeCatalog } from './definitions.js';

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
  { label: '13 3/8" (12.415" ID)', id: 12.415 },
  { label: '13 3/8" (12.347" ID)', id: 12.347 },
  { label: '13 5/8"', id: 12.375 },
  { label: '11 1/2"', id: 9.66 },
  { label: '9 5/8" (8.535" ID)', id: 8.535 },
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
  return getDrillpipeCatalog().map((dp) => ({
    label: dp.name,
    od: dp.od
  }));
}

function getEditableCasingOptions() {
  const sections = [
    'conductor',
    'surface',
    'intermediate',
    'production',
    'tieback',
    'reservoir',
    'small_liner',
    'upper_completion'
  ];
  const seen = new Set();
  const options = [];
  sections.forEach((section) => {
    getCasingDefinitions(section).forEach((entry) => {
      const key = String(entry.id);
      if (!key || seen.has(key)) return;
      seen.add(key);
      options.push({
        label: entry.label || String(entry.id),
        id: entry.id
      });
    });
  });
  return options.length ? options : CASING_OPTIONS;
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

  const populateDropdowns = () => {
    if (casingSelect) {
      const current = casingSelect.value;
      const options = getEditableCasingOptions().sort((a, b) => b.id - a.id);
      casingSelect.innerHTML = '';
      options.forEach((entry) => {
        const option = document.createElement('option');
        option.value = String(entry.id);
        option.textContent = entry.label;
        casingSelect.appendChild(option);
      });
      const customOption = document.createElement('option');
      customOption.value = 'custom';
      customOption.textContent = 'Custom...';
      casingSelect.appendChild(customOption);

      const keep = Array.from(casingSelect.options).find(
        (opt) => opt.value === current
      );
      casingSelect.value = keep ? keep.value : casingSelect.options[0]?.value;
      onCasingSelectChange();
    }

    if (drillpipeSelect) {
      const current = drillpipeSelect.value;
      const options = getDrillpipeOptions().sort((a, b) => b.od - a.od);
      drillpipeSelect.innerHTML = '';
      options.forEach((entry) => {
        const option = document.createElement('option');
        option.value = String(entry.od);
        option.textContent = entry.label;
        drillpipeSelect.appendChild(option);
      });
      const customOption = document.createElement('option');
      customOption.value = 'custom';
      customOption.textContent = 'Custom...';
      drillpipeSelect.appendChild(customOption);

      const keep = Array.from(drillpipeSelect.options).find(
        (opt) => opt.value === current
      );
      drillpipeSelect.value =
        keep ? keep.value : drillpipeSelect.options[0]?.value;
      onDrillpipeSelectChange();
    }
  };

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

  document.addEventListener('keino:definitions-changed', () => {
    populateDropdowns();
    recalculate();
  });

  populateDropdowns();

  // Initial calculation
  recalculate();
}
