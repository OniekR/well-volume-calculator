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
  if (value === '') return undefined;
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
  volumes = {},
  toDepth
} = {}) {
  const sections = [];
  const normalizedToDepth = normalizeNumber(toDepth);

  const pipeMode = drillpipeInput.mode || 'drillpipe';
  const hasDrillPipe = pipeMode === 'drillpipe' && drillpipeInput.count > 0;
  const hasTubing = pipeMode === 'tubing' && tubingInput.count > 0;
  const hasString = hasDrillPipe || hasTubing;

  const activeCasings = casingsInput
    .filter((c) => c.use && c.depth > 0)
    .sort((a, b) => (b.od || 0) - (a.od || 0));

  const fallbackWellDepth = activeCasings.reduce(
    (maxDepth, casing) => Math.max(maxDepth, Number(casing.depth) || 0),
    0
  );
  const wellTotalDepth =
    normalizeNumber(volumes.wellTotalDepth) ??
    (fallbackWellDepth > 0 ? fallbackWellDepth : undefined);
  const fullWellVolume = normalizeNumber(volumes.fullWellVolume);

  if (!hasString && fullWellVolume != null) {
    sections.push({
      id: 'full_well_volume',
      label: 'Entire Well Volume',
      volumeM3: getToDepthAdjustedVolume(
        fullWellVolume,
        toDepth,
        wellTotalDepth,
        casingsInput,
        volumes.perCasingVolumes
      ),
      type: 'well'
    });
    return sections;
  }

  if (hasDrillPipe && volumes.drillPipeCapacity != null) {
    const adjustedVolume = getDepthAdjustedVolume(
      volumes.drillPipeCapacity,
      normalizedToDepth,
      normalizeNumber(volumes.drillPipeLength) ??
        normalizeNumber(volumes.drillPipeTotalDepth)
    );
    sections.push({
      id: 'drillpipe_capacity',
      label: 'Drill Pipe Capacity',
      volumeM3: adjustedVolume,
      type: 'pipe'
    });
  }

  if (hasTubing && volumes.tubingCapacity != null) {
    const adjustedVolume = getDepthAdjustedVolume(
      volumes.tubingCapacity,
      normalizedToDepth,
      normalizeNumber(volumes.tubingLength) ??
        normalizeNumber(volumes.tubingTotalDepth)
    );
    sections.push({
      id: 'tubing_capacity',
      label: 'Tubing Capacity',
      volumeM3: adjustedVolume,
      type: 'pipe'
    });
  }

  const innerPipeLabel = hasTubing ? 'Tubing' : 'DP';

  if (activeCasings.length > 0) {
    const innermost = activeCasings[activeCasings.length - 1];
    const innermostLabel = formatCasingLabel(innermost);

    if (volumes.annulusInnermost != null) {
      const annulusLength = hasTubing
        ? normalizeNumber(volumes.tubingAnnulusLength) ??
          normalizeNumber(volumes.tubingLength)
        : normalizeNumber(volumes.drillPipeAnnulusLength) ??
          normalizeNumber(volumes.drillPipeLength) ??
          normalizeNumber(volumes.drillPipeTotalDepth);
      const adjustedVolume = getDepthAdjustedVolume(
        volumes.annulusInnermost,
        normalizedToDepth,
        annulusLength
      );
      sections.push({
        id: 'annulus_innermost',
        label: `${innerPipeLabel}/${innermostLabel} Annulus`,
        volumeM3: adjustedVolume,
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

  const explicitBelowString = normalizeNumber(volumes.belowStringVolume);
  const pipeSectionVolume = sections
    .filter((section) => section.type === 'pipe')
    .reduce((sum, section) => sum + (section.volumeM3 || 0), 0);
  const annulusSectionVolume = sections
    .filter((section) => section.type === 'annulus')
    .reduce((sum, section) => sum + (section.volumeM3 || 0), 0);

  let belowStringVolume = explicitBelowString;
  if (
    belowStringVolume == null &&
    fullWellVolume != null &&
    Number.isFinite(fullWellVolume)
  ) {
    belowStringVolume = Math.max(
      0,
      fullWellVolume - pipeSectionVolume - annulusSectionVolume
    );
  }

  if (belowStringVolume != null && belowStringVolume >= 1) {
    const stringEndDepth = hasTubing
      ? normalizeNumber(volumes.tubingTotalDepth)
      : normalizeNumber(volumes.drillPipeTotalDepth);

    const adjustedBelowStringVolume = getBelowStringVolumeAboveDepth(
      belowStringVolume,
      normalizedToDepth,
      stringEndDepth,
      wellTotalDepth,
      casingsInput,
      volumes.perCasingVolumes
    );

    if (adjustedBelowStringVolume >= 1) {
      sections.push({
        id: 'below_string_volume',
        label: 'Below string',
        volumeM3: adjustedBelowStringVolume,
        type: 'below_string'
      });
    }
    return sections;
  }

  return sections;
}

function getToDepthAdjustedVolume(
  fullWellVolume,
  toDepth,
  wellTotalDepth,
  casingsInput,
  perCasingVolumes
) {
  if (!Number.isFinite(fullWellVolume) || fullWellVolume < 0) {
    return 0;
  }

  const parsedToDepth = normalizeNumber(toDepth);
  if (parsedToDepth == null || parsedToDepth < 0) {
    return fullWellVolume;
  }

  if (!Number.isFinite(wellTotalDepth) || wellTotalDepth <= 0) {
    return fullWellVolume;
  }

  const clampedDepth = Math.min(Math.max(parsedToDepth, 0), wellTotalDepth);

  const exactVolume = calculateVolumeToDepthFromCasingIntervals(
    clampedDepth,
    casingsInput,
    perCasingVolumes
  );
  if (exactVolume != null) {
    return exactVolume;
  }

  const depthRatio = clampedDepth / wellTotalDepth;
  return fullWellVolume * depthRatio;
}

function getDepthAdjustedVolume(volumeM3, toDepth, length) {
  if (!Number.isFinite(volumeM3) || volumeM3 < 0) return 0;
  const normalizedDepth = normalizeNumber(toDepth);
  if (normalizedDepth == null || normalizedDepth < 0) return volumeM3;
  if (!Number.isFinite(length) || length <= 0) return volumeM3;

  const clampedDepth = Math.max(0, Math.min(normalizedDepth, length));
  return (volumeM3 * clampedDepth) / length;
}

function getBelowStringVolumeAboveDepth(
  belowStringVolume,
  toDepth,
  stringEndDepth,
  wellTotalDepth,
  casingsInput,
  perCasingVolumes
) {
  if (!Number.isFinite(belowStringVolume) || belowStringVolume < 0) return 0;
  const normalizedDepth = normalizeNumber(toDepth);
  if (normalizedDepth == null || normalizedDepth < 0) return belowStringVolume;

  if (!Number.isFinite(stringEndDepth)) return 0;

  const clampedDepth = Math.min(
    Math.max(normalizedDepth, 0),
    Number.isFinite(wellTotalDepth) ? wellTotalDepth : normalizedDepth
  );

  if (clampedDepth <= stringEndDepth) return 0;

  const exactVolume = calculateVolumeBetweenDepths(
    stringEndDepth,
    clampedDepth,
    casingsInput,
    perCasingVolumes
  );
  if (exactVolume != null) {
    return exactVolume;
  }

  if (!Number.isFinite(wellTotalDepth) || wellTotalDepth <= stringEndDepth) {
    return belowStringVolume;
  }

  const remainingDepth = wellTotalDepth - stringEndDepth;
  const selectedDepth = clampedDepth - stringEndDepth;
  return (belowStringVolume * selectedDepth) / remainingDepth;
}

function calculateVolumeBetweenDepths(
  startDepth,
  endDepth,
  casingsInput = [],
  perCasingVolumes = []
) {
  if (!Array.isArray(casingsInput) || !Array.isArray(perCasingVolumes)) {
    return undefined;
  }

  const volumeByRole = new Map();
  perCasingVolumes.forEach((entry) => {
    if (!entry?.role) return;
    const perMeter = normalizeNumber(entry.perMeter_m3);
    if (perMeter == null || perMeter < 0) return;
    volumeByRole.set(entry.role, perMeter);
  });

  if (volumeByRole.size === 0) {
    return undefined;
  }

  let total = 0;
  let hasContribution = false;

  casingsInput.forEach((casing) => {
    if (!casing?.use) return;
    if (casing.role === 'upper_completion') return;

    const perMeter = volumeByRole.get(casing.role);
    if (!Number.isFinite(perMeter) || perMeter <= 0) return;

    const top = Math.max(0, normalizeNumber(casing.top) ?? 0);
    const bottom = normalizeNumber(casing.depth);
    if (!Number.isFinite(bottom) || bottom <= top) return;

    const overlapTop = Math.max(top, startDepth);
    const overlapBottom = Math.min(bottom, endDepth);
    const overlapLength = overlapBottom - overlapTop;
    if (overlapLength <= 0) return;

    total += perMeter * overlapLength;
    hasContribution = true;
  });

  if (!hasContribution) return undefined;
  return total;
}

function calculateVolumeToDepthFromCasingIntervals(
  toDepth,
  casingsInput = [],
  perCasingVolumes = []
) {
  if (!Array.isArray(casingsInput) || !Array.isArray(perCasingVolumes)) {
    return undefined;
  }

  const volumeByRole = new Map();
  perCasingVolumes.forEach((entry) => {
    if (!entry?.role) return;
    const perMeter = normalizeNumber(entry.perMeter_m3);
    if (perMeter == null || perMeter < 0) return;
    volumeByRole.set(entry.role, perMeter);
  });

  if (volumeByRole.size === 0) {
    return undefined;
  }

  let total = 0;
  let hasContribution = false;

  casingsInput.forEach((casing) => {
    if (!casing?.use) return;
    if (casing.role === 'upper_completion') return;

    const perMeter = volumeByRole.get(casing.role);
    if (!Number.isFinite(perMeter) || perMeter <= 0) return;

    const top = Math.max(0, normalizeNumber(casing.top) ?? 0);
    const bottom = normalizeNumber(casing.depth);
    if (!Number.isFinite(bottom) || bottom <= top) return;

    const overlapTop = Math.max(0, top);
    const overlapBottom = Math.min(bottom, toDepth);
    const overlapLength = overlapBottom - overlapTop;
    if (overlapLength <= 0) return;

    total += perMeter * overlapLength;
    hasContribution = true;
  });

  if (!hasContribution) return undefined;
  return total;
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

  const {
    lowPressure,
    highPressure,
    kValue,
    selectedSectionIds,
    toDepth,
    surfaceVolumeM3
  } = pressureInput;
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
    volumes,
    toDepth
  });

  const selectedSections = availableSections.filter((s) =>
    (selectedSectionIds || []).includes(s.id)
  );

  const selectedVolumeM3 = selectedSections.reduce(
    (sum, s) => sum + (s.volumeM3 || 0),
    0
  );
  const extraSurfaceVolumeM3 = Math.max(
    0,
    normalizeNumber(surfaceVolumeM3) ?? 0
  );
  const totalVolumeM3 = selectedVolumeM3 + extraSurfaceVolumeM3;

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
    surfaceVolumeM3: extraSurfaceVolumeM3,
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
  const toDepthEl = el('pressure_to_depth');
  const surfaceVolumeEl = el('pressure_surface_volume');

  const lowPressure =
    normalizeNumber(lowPressureEl?.value) ?? PRESSURE_DEFAULTS.lowPressure;
  const highPressure =
    normalizeNumber(highPressureEl?.value) ?? PRESSURE_DEFAULTS.highPressure;
  const kValue = normalizeNumber(kValueEl?.value) ?? FLUID_COMPRESSIBILITY.obm;
  const toDepth = normalizeNumber(toDepthEl?.value);
  const surfaceVolumeM3 = Math.max(
    0,
    normalizeNumber(surfaceVolumeEl?.value) ?? 0
  );

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
    toDepth,
    surfaceVolumeM3,
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
  const toDepthEl = el('pressure_to_depth');
  const surfaceVolumeEl = el('pressure_surface_volume');

  [lowPressureEl, highPressureEl, kValueEl, surfaceVolumeEl].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        updateTotalVolume();
        calculateVolume();
        scheduleSave();
      });
    }
  });

  if (toDepthEl) {
    toDepthEl.addEventListener('input', () => {
      if (normalizeNumber(toDepthEl.value) === 0) {
        toDepthEl.value = '';
      }
      updateTotalVolume();
      calculateVolume();
      scheduleSave();
    });
  }

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

  total += getSurfaceVolumeM3FromInput();

  totalEl.textContent = `${total.toFixed(2)} m³`;
}

function getSurfaceVolumeM3FromInput() {
  const surfaceVolumeEl = el('pressure_surface_volume');
  return Math.max(0, normalizeNumber(surfaceVolumeEl?.value) ?? 0);
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
  const lowTargetEl = el('pressure-low-target');
  const highFromEl = el('pressure-high-from');
  const highTargetEl = el('pressure-high-target');
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

  if (lowTargetEl && Number.isFinite(result.lowPressure)) {
    lowTargetEl.textContent = formatPressureLabelValue(result.lowPressure);
  }
  if (highFromEl && Number.isFinite(result.lowPressure)) {
    highFromEl.textContent = formatPressureLabelValue(result.lowPressure);
  }
  if (highTargetEl && Number.isFinite(result.highPressure)) {
    highTargetEl.textContent = formatPressureLabelValue(result.highPressure);
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
        no_volume_selected:
          'Select at least one well section or enter a surface volume to calculate.'
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

function formatPressureLabelValue(value) {
  if (!Number.isFinite(value)) return '—';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
