import { el, qs } from './dom.js';
import {
  FLUID_COMPRESSIBILITY,
  FLUID_COMPRESSIBILITY_LABELS,
  PRESSURE_DEFAULTS
} from './constants.js';

/**
 * Exported constants for UI and state.
 */
export {
  FLUID_COMPRESSIBILITY,
  FLUID_COMPRESSIBILITY_LABELS,
  PRESSURE_DEFAULTS
};

/**
 * Normalize raw input to a finite number or undefined.
 */
const normalizeNumber = (raw) => {
  if (raw == null) return undefined;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  const value = String(raw).trim().replace(/\s+/g, '').replace(',', '.');
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Calculate pressure test volume in liters.
 * Formula: V_liters = (V_m³ × ΔP_bar) / k
 *
 * @param {number} volumeM3 - Total volume in cubic meters
 * @param {number} pressureDelta - Pressure differential in bar
 * @param {number} kValue - Fluid compressibility constant
 * @returns {number|undefined} Volume in liters, or undefined if invalid
 */
export function calculatePressureVolume(volumeM3, pressureDelta, kValue) {
  if (
    typeof volumeM3 !== 'number' ||
    typeof pressureDelta !== 'number' ||
    typeof kValue !== 'number' ||
    !Number.isFinite(volumeM3) ||
    !Number.isFinite(pressureDelta) ||
    !Number.isFinite(kValue) ||
    volumeM3 < 0 ||
    pressureDelta < 0 ||
    kValue <= 0
  ) {
    return undefined;
  }
  return (volumeM3 * pressureDelta) / kValue;
}

/**
 * Build list of selectable volume sections based on current well configuration.
 *
 * @param {Object} options
 * @param {Array} options.casingsInput - Array of casing objects with role, id, depth, use, od
 * @param {Object} options.drillpipeInput - Drill pipe configuration
 * @param {Object} options.tubingInput - Tubing configuration
 * @param {Object} options.volumes - Computed volumes from main calculation
 * @returns {Array} Array of selectable section objects
 */
export function buildSelectableSections({
  casingsInput = [],
  drillpipeInput = {},
  tubingInput = {},
  volumes = {}
} = {}) {
  const sections = [];

  const pipeMode = drillpipeInput.mode || 'drillpipe';
  const hasDrillPipe = pipeMode === 'drillpipe' && drillpipeInput.count > 0;
  const hasTubing = pipeMode === 'tubing' && tubingInput.count > 0;

  if (hasDrillPipe && volumes.drillPipeCapacity != null) {
    sections.push({
      id: 'drillpipe_capacity',
      label: 'Drill Pipe Capacity',
      volumeM3: volumes.drillPipeCapacity,
      type: 'pipe'
    });
  }

  if (hasTubing && volumes.tubingCapacity != null) {
    sections.push({
      id: 'tubing_capacity',
      label: 'Tubing Capacity',
      volumeM3: volumes.tubingCapacity,
      type: 'pipe'
    });
  }

  const activeCasings = casingsInput
    .filter((c) => c.use && c.depth > 0)
    .sort((a, b) => (b.od || 0) - (a.od || 0));

  const innerPipeLabel = hasTubing ? 'Tubing' : 'DP';

  if (activeCasings.length > 0) {
    const innermost = activeCasings[activeCasings.length - 1];
    const innermostLabel = formatCasingLabel(innermost);

    if (volumes.annulusInnermost != null) {
      sections.push({
        id: 'annulus_innermost',
        label: `${innerPipeLabel}/${innermostLabel} Annulus`,
        volumeM3: volumes.annulusInnermost,
        type: 'annulus'
      });
    }
  }

  for (let i = 0; i < activeCasings.length - 1; i++) {
    const outer = activeCasings[i];
    const inner = activeCasings[i + 1];
    const volumeKey = `annulus_${outer.role}_${inner.role}`;

    if (volumes[volumeKey] != null) {
      sections.push({
        id: volumeKey,
        label: `${formatCasingLabel(inner)}/${formatCasingLabel(
          outer
        )} Annulus`,
        volumeM3: volumes[volumeKey],
        type: 'annulus'
      });
    }
  }

  return sections;
}

/**
 * Format casing label for display (e.g., "7"" or "9 5/8"").
 */
function formatCasingLabel(casing) {
  if (!casing) return '?';
  const id = casing.id;
  if (id == null) return casing.role || '?';

  if (Number.isInteger(id)) return `${id}"`;

  const wholePart = Math.floor(id);
  const fraction = id - wholePart;

  if (Math.abs(fraction - 0.625) < 0.01) return `${wholePart} 5/8"`;
  if (Math.abs(fraction - 0.5) < 0.01) return `${wholePart} 1/2"`;
  if (Math.abs(fraction - 0.875) < 0.01) return `${wholePart} 7/8"`;
  if (Math.abs(fraction - 0.25) < 0.01) return `${wholePart} 1/4"`;
  if (Math.abs(fraction - 0.75) < 0.01) return `${wholePart} 3/4"`;

  return `${id}"`;
}

/**
 * Main pressure test computation.
 *
 * @param {Object} pressureInput - Input from gatherPressureInput()
 * @param {Object} wellConfig - Well configuration with volumes
 * @returns {Object} Computation result
 */
export function computePressureTest(pressureInput, wellConfig = {}) {
  if (!pressureInput || pressureInput.active === false) {
    return { active: false, valid: false };
  }

  const { lowPressure, highPressure, kValue, selectedSectionIds } =
    pressureInput;
  const { casingsInput, drillpipeInput, tubingInput, volumes } = wellConfig;

  if (kValue == null || kValue <= 0) {
    return { active: true, valid: false, reason: 'invalid_k' };
  }

  if (lowPressure == null || lowPressure < 0) {
    return { active: true, valid: false, reason: 'invalid_low_pressure' };
  }

  if (highPressure == null || highPressure < 0) {
    return { active: true, valid: false, reason: 'invalid_high_pressure' };
  }

  if (
    lowPressure > PRESSURE_DEFAULTS.maxPressure ||
    highPressure > PRESSURE_DEFAULTS.maxPressure
  ) {
    return { active: true, valid: false, reason: 'pressure_exceeds_max' };
  }

  if (highPressure <= lowPressure) {
    return { active: true, valid: false, reason: 'high_must_exceed_low' };
  }

  const availableSections = buildSelectableSections({
    casingsInput,
    drillpipeInput,
    tubingInput,
    volumes
  });

  const selectedSections = availableSections.filter((s) =>
    selectedSectionIds.includes(s.id)
  );

  const totalVolumeM3 = selectedSections.reduce(
    (sum, s) => sum + (s.volumeM3 || 0),
    0
  );

  if (totalVolumeM3 <= 0) {
    return {
      active: true,
      valid: false,
      reason: 'no_volume_selected',
      availableSections,
      selectedSections: []
    };
  }

  const lowTestDelta = lowPressure;
  const highTestDelta = highPressure - lowPressure;

  const lowTestLiters = calculatePressureVolume(
    totalVolumeM3,
    lowTestDelta,
    kValue
  );
  const highTestLiters = calculatePressureVolume(
    totalVolumeM3,
    highTestDelta,
    kValue
  );

  return {
    active: true,
    valid: true,
    lowPressure,
    highPressure,
    kValue,
    totalVolumeM3,
    lowTestLiters,
    highTestLiters,
    availableSections,
    selectedSections
  };
}

/**
 * Gather pressure test input from DOM.
 */
export function gatherPressureInput() {
  const activeEl = el('pressure_active');
  if (activeEl && !activeEl.checked) {
    return { active: false };
  }

  const lowPressureEl = el('pressure_low');
  const highPressureEl = el('pressure_high');
  const kValueEl = el('pressure_k_value');

  const lowPressure =
    normalizeNumber(lowPressureEl?.value) ?? PRESSURE_DEFAULTS.lowPressure;
  const highPressure =
    normalizeNumber(highPressureEl?.value) ?? PRESSURE_DEFAULTS.highPressure;
  const kValue = normalizeNumber(kValueEl?.value) ?? FLUID_COMPRESSIBILITY.obm;

  const selectedSectionIds = [];
  qs('[data-pressure-section].selected').forEach((btn) => {
    const sectionId = btn.getAttribute('data-pressure-section');
    if (sectionId) selectedSectionIds.push(sectionId);
  });

  return {
    active: true,
    lowPressure,
    highPressure,
    kValue,
    selectedSectionIds
  };
}

/**
 * Wire up pressure test UI event handlers.
 */
export function setupPressureUI(deps = {}) {
  const { calculateVolume = () => {}, scheduleSave = () => {} } = deps;

  const lowPressureEl = el('pressure_low');
  const highPressureEl = el('pressure_high');
  const kValueEl = el('pressure_k_value');

  [lowPressureEl, highPressureEl, kValueEl].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        calculateVolume();
        scheduleSave();
      });
    }
  });

  qs('[data-pressure-k]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const kKey = btn.getAttribute('data-pressure-k');
      const kVal = FLUID_COMPRESSIBILITY[kKey];
      if (kVal != null && kValueEl) {
        kValueEl.value = kVal;
        calculateVolume();
        scheduleSave();
      }
    });
  });

  document.addEventListener('keino:pressure:sections-updated', (e) => {
    const availableSections = e.detail?.availableSections || [];
    renderSectionButtons(availableSections, { calculateVolume, scheduleSave });
  });
}

/**
 * Render selectable section buttons dynamically.
 */
function renderSectionButtons(sections, deps = {}) {
  const { calculateVolume = () => {}, scheduleSave = () => {} } = deps;
  const container = el('pressure-section-buttons');
  if (!container) return;

  const currentSelected = new Set();
  qs('[data-pressure-section].selected').forEach((btn) => {
    currentSelected.add(btn.getAttribute('data-pressure-section'));
  });

  container.innerHTML = '';

  if (sections.length === 0) {
    container.innerHTML =
      '<p class="small-note">No well sections available. Configure casings and pipe first.</p>';
    return;
  }

  sections.forEach((section) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pressure-section-btn';
    btn.setAttribute('data-pressure-section', section.id);
    btn.setAttribute(
      'aria-pressed',
      currentSelected.has(section.id) ? 'true' : 'false'
    );

    if (currentSelected.has(section.id)) {
      btn.classList.add('selected');
    }

    const volumeDisplay =
      section.volumeM3 != null ? section.volumeM3.toFixed(2) : '—';
    btn.innerHTML = `<span class="section-name">${section.label}</span><span class="section-volume">${volumeDisplay} m³</span>`;

    btn.addEventListener('click', () => {
      const isSelected = btn.classList.toggle('selected');
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      updateTotalVolume();
      calculateVolume();
      scheduleSave();
    });

    container.appendChild(btn);
  });

  updateTotalVolume();
}

/**
 * Update total selected volume display.
 */
function updateTotalVolume() {
  const totalEl = el('pressure-total-volume');
  if (!totalEl) return;

  let total = 0;
  qs('[data-pressure-section].selected').forEach((btn) => {
    const volumeSpan = btn.querySelector('.section-volume');
    if (volumeSpan) {
      const text = volumeSpan.textContent.replace(' m³', '').trim();
      const val = parseFloat(text);
      if (Number.isFinite(val)) total += val;
    }
  });

  totalEl.textContent = `${total.toFixed(2)} m³`;
}

/**
 * Render pressure test results to DOM.
 */
export function renderPressureResults(result) {
  const resultsEl = el('pressure-results');
  const emptyEl = el('pressure-results-empty');
  const errorEl = el('pressure-error');
  const lowResultEl = el('pressure-low-result');
  const highResultEl = el('pressure-high-result');
  const totalVolumeEl = el('pressure-total-volume');

  if (!resultsEl || !emptyEl) return;

  if (!result || !result.active) {
    resultsEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    return;
  }

  if (result.availableSections) {
    document.dispatchEvent(
      new CustomEvent('keino:pressure:sections-updated', {
        detail: { availableSections: result.availableSections }
      })
    );
  }

  if (!result.valid) {
    resultsEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');

    if (errorEl) {
      const messages = {
        invalid_k:
          'Please enter a valid fluid compressibility constant (k > 0).',
        invalid_low_pressure: 'Low pressure must be a non-negative number.',
        invalid_high_pressure: 'High pressure must be a non-negative number.',
        pressure_exceeds_max: `Pressure values must not exceed ${PRESSURE_DEFAULTS.maxPressure} bar.`,
        high_must_exceed_low:
          'High pressure must be greater than low pressure.',
        no_volume_selected: 'Select at least one well section to calculate.'
      };
      errorEl.textContent = messages[result.reason] || 'Invalid input.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (errorEl) errorEl.classList.add('hidden');
  emptyEl.classList.add('hidden');
  resultsEl.classList.remove('hidden');

  if (totalVolumeEl) {
    totalVolumeEl.textContent = `${result.totalVolumeM3.toFixed(2)} m³`;
  }

  if (lowResultEl) {
    lowResultEl.textContent =
      result.lowTestLiters != null
        ? `${result.lowTestLiters.toFixed(1)} L`
        : '—';
  }

  if (highResultEl) {
    highResultEl.textContent =
      result.highTestLiters != null
        ? `${result.highTestLiters.toFixed(1)} L`
        : '—';
  }
}
