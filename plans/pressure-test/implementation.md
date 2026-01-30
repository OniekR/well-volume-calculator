# Pressure Test Feature Implementation

## Goal

Implement a pressure test calculator that allows users to select well sections and calculate the volume of fluid required to pressurize from 0 to a low test pressure (default 20 bar) and from low to high test pressure (default 345 bar).

## Prerequisites

Make sure you are currently on the `feature/pressure-test` branch before beginning implementation.
If not, move to the correct branch. If the branch does not exist, create it from main.

---

## Step-by-Step Instructions

### Step 1: Add Pressure Constants and Core Calculation Logic

- [x] Add fluid compressibility constants to `src/js/constants.js`. Insert the following at the end of the file, before any closing statements:

```javascript
/**
 * Fluid compressibility constants (k values) for pressure test calculations.
 * Formula: V_liters = (V_m³ × ΔP_bar) / k
 */
export const FLUID_COMPRESSIBILITY = {
  wbm_brine: 21,
  obm: 18,
  base_oil: 14,
  kfls: 35
};

export const FLUID_COMPRESSIBILITY_LABELS = {
  wbm_brine: 'WBM / Brine',
  obm: 'OBM',
  base_oil: 'Base Oil',
  kfls: 'KFLS'
};

export const PRESSURE_DEFAULTS = {
  lowPressure: 20,
  highPressure: 345,
  maxPressure: 1035
};
```

- [x] Create new file `src/js/pressure.js` with the following complete content:

```javascript
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
```

- [x] Create new test file `src/js/__tests__/pressure.test.js` with the following complete content:

```javascript
import { describe, it, expect } from 'vitest';
import {
  calculatePressureVolume,
  buildSelectableSections,
  computePressureTest,
  FLUID_COMPRESSIBILITY,
  PRESSURE_DEFAULTS
} from '../pressure.js';

describe('calculatePressureVolume', () => {
  it('calculates correctly with OBM (k=18)', () => {
    const result = calculatePressureVolume(150, 110, 18);
    expect(result).toBeCloseTo(916.67, 1);
  });

  it('calculates correctly for low pressure test with OBM', () => {
    const result = calculatePressureVolume(150, 20, 18);
    expect(result).toBeCloseTo(166.67, 1);
  });

  it('calculates correctly with WBM/brine (k=21)', () => {
    const result = calculatePressureVolume(100, 100, 21);
    expect(result).toBeCloseTo(476.19, 1);
  });

  it('calculates correctly with Base oil (k=14)', () => {
    const result = calculatePressureVolume(100, 100, 14);
    expect(result).toBeCloseTo(714.29, 1);
  });

  it('calculates correctly with KFLS (k=35)', () => {
    const result = calculatePressureVolume(100, 100, 35);
    expect(result).toBeCloseTo(285.71, 1);
  });

  it('returns 0 for zero volume', () => {
    const result = calculatePressureVolume(0, 100, 18);
    expect(result).toBe(0);
  });

  it('returns 0 for zero pressure delta', () => {
    const result = calculatePressureVolume(150, 0, 18);
    expect(result).toBe(0);
  });

  it('returns undefined for negative volume', () => {
    expect(calculatePressureVolume(-10, 100, 18)).toBeUndefined();
  });

  it('returns undefined for negative pressure', () => {
    expect(calculatePressureVolume(100, -50, 18)).toBeUndefined();
  });

  it('returns undefined for zero k value', () => {
    expect(calculatePressureVolume(100, 100, 0)).toBeUndefined();
  });

  it('returns undefined for negative k value', () => {
    expect(calculatePressureVolume(100, 100, -18)).toBeUndefined();
  });

  it('returns undefined for non-numeric inputs', () => {
    expect(calculatePressureVolume('abc', 100, 18)).toBeUndefined();
    expect(calculatePressureVolume(100, 'abc', 18)).toBeUndefined();
    expect(calculatePressureVolume(100, 100, 'abc')).toBeUndefined();
  });

  it('returns undefined for NaN inputs', () => {
    expect(calculatePressureVolume(NaN, 100, 18)).toBeUndefined();
    expect(calculatePressureVolume(100, NaN, 18)).toBeUndefined();
    expect(calculatePressureVolume(100, 100, NaN)).toBeUndefined();
  });

  it('returns undefined for Infinity inputs', () => {
    expect(calculatePressureVolume(Infinity, 100, 18)).toBeUndefined();
    expect(calculatePressureVolume(100, Infinity, 18)).toBeUndefined();
  });
});

describe('buildSelectableSections', () => {
  it('returns empty array when no configuration', () => {
    const sections = buildSelectableSections({});
    expect(sections).toEqual([]);
  });

  it('includes drill pipe capacity when available', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
      tubingInput: { count: 0, tubings: [] },
      volumes: { drillPipeCapacity: 25.5 }
    });

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      id: 'drillpipe_capacity',
      label: 'Drill Pipe Capacity',
      volumeM3: 25.5,
      type: 'pipe'
    });
  });

  it('includes tubing capacity when in tubing mode', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'tubing', count: 0, pipes: [] },
      tubingInput: { count: 1, tubings: [{}] },
      volumes: { tubingCapacity: 18.2 }
    });

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      id: 'tubing_capacity',
      label: 'Tubing Capacity',
      volumeM3: 18.2,
      type: 'pipe'
    });
  });

  it('includes innermost annulus with correct label', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
      tubingInput: { count: 0, tubings: [] },
      casingsInput: [
        { role: 'production', id: 7, depth: 3000, use: true, od: 9.625 }
      ],
      volumes: { drillPipeCapacity: 25.5, annulusInnermost: 45.3 }
    });

    const annulus = sections.find((s) => s.id === 'annulus_innermost');
    expect(annulus).toBeDefined();
    expect(annulus.label).toBe('DP/7" Annulus');
    expect(annulus.volumeM3).toBe(45.3);
  });

  it('uses Tubing label when in tubing mode', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'tubing', count: 0, pipes: [] },
      tubingInput: { count: 1, tubings: [{}] },
      casingsInput: [
        { role: 'production', id: 7, depth: 3000, use: true, od: 9.625 }
      ],
      volumes: { tubingCapacity: 18.2, annulusInnermost: 38.7 }
    });

    const annulus = sections.find((s) => s.id === 'annulus_innermost');
    expect(annulus.label).toBe('Tubing/7" Annulus');
  });

  it('formats fractional casing sizes correctly', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
      tubingInput: { count: 0, tubings: [] },
      casingsInput: [
        { role: 'production', id: 9.625, depth: 3000, use: true, od: 12 }
      ],
      volumes: { drillPipeCapacity: 25.5, annulusInnermost: 52.1 }
    });

    const annulus = sections.find((s) => s.id === 'annulus_innermost');
    expect(annulus.label).toBe('DP/9 5/8" Annulus');
  });

  it('excludes inactive casings', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
      tubingInput: { count: 0, tubings: [] },
      casingsInput: [
        { role: 'production', id: 7, depth: 3000, use: false, od: 9.625 },
        { role: 'intermediate', id: 9.625, depth: 2000, use: true, od: 12 }
      ],
      volumes: { drillPipeCapacity: 25.5, annulusInnermost: 48.0 }
    });

    const annulus = sections.find((s) => s.id === 'annulus_innermost');
    expect(annulus.label).toBe('DP/9 5/8" Annulus');
  });
});

describe('computePressureTest', () => {
  const baseInput = {
    active: true,
    lowPressure: 20,
    highPressure: 345,
    kValue: 18,
    selectedSectionIds: ['drillpipe_capacity']
  };

  const baseWellConfig = {
    drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
    tubingInput: { count: 0, tubings: [] },
    casingsInput: [],
    volumes: { drillPipeCapacity: 150 }
  };

  it('returns inactive when input is inactive', () => {
    const result = computePressureTest({ active: false }, baseWellConfig);
    expect(result.active).toBe(false);
    expect(result.valid).toBe(false);
  });

  it('returns invalid when k value is missing', () => {
    const result = computePressureTest(
      { ...baseInput, kValue: null },
      baseWellConfig
    );
    expect(result.active).toBe(true);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('invalid_k');
  });

  it('returns invalid when low pressure is negative', () => {
    const result = computePressureTest(
      { ...baseInput, lowPressure: -10 },
      baseWellConfig
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('invalid_low_pressure');
  });

  it('returns invalid when high pressure exceeds max', () => {
    const result = computePressureTest(
      { ...baseInput, highPressure: 1100 },
      baseWellConfig
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('pressure_exceeds_max');
  });

  it('returns invalid when high pressure is not greater than low', () => {
    const result = computePressureTest(
      { ...baseInput, lowPressure: 100, highPressure: 50 },
      baseWellConfig
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('high_must_exceed_low');
  });

  it('returns invalid when no sections are selected', () => {
    const result = computePressureTest(
      { ...baseInput, selectedSectionIds: [] },
      baseWellConfig
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('no_volume_selected');
  });

  it('calculates correct volumes for typical scenario', () => {
    const result = computePressureTest(baseInput, baseWellConfig);

    expect(result.active).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.totalVolumeM3).toBe(150);
    expect(result.lowTestLiters).toBeCloseTo(166.67, 1);
    expect(result.highTestLiters).toBeCloseTo(2708.33, 1);
  });

  it('sums multiple selected sections', () => {
    const input = {
      ...baseInput,
      selectedSectionIds: ['drillpipe_capacity', 'annulus_innermost']
    };
    const wellConfig = {
      ...baseWellConfig,
      casingsInput: [
        { role: 'production', id: 7, depth: 3000, use: true, od: 9.625 }
      ],
      volumes: { drillPipeCapacity: 50, annulusInnermost: 100 }
    };

    const result = computePressureTest(input, wellConfig);

    expect(result.totalVolumeM3).toBe(150);
  });

  it('includes available sections in result', () => {
    const result = computePressureTest(baseInput, baseWellConfig);

    expect(result.availableSections).toBeDefined();
    expect(result.availableSections.length).toBeGreaterThan(0);
  });
});

describe('FLUID_COMPRESSIBILITY constants', () => {
  it('has correct k values', () => {
    expect(FLUID_COMPRESSIBILITY.wbm_brine).toBe(21);
    expect(FLUID_COMPRESSIBILITY.obm).toBe(18);
    expect(FLUID_COMPRESSIBILITY.base_oil).toBe(14);
    expect(FLUID_COMPRESSIBILITY.kfls).toBe(35);
  });
});

describe('PRESSURE_DEFAULTS constants', () => {
  it('has correct default values', () => {
    expect(PRESSURE_DEFAULTS.lowPressure).toBe(20);
    expect(PRESSURE_DEFAULTS.highPressure).toBe(345);
    expect(PRESSURE_DEFAULTS.maxPressure).toBe(1035);
  });
});
```

#### Step 1 Verification Checklist

- [x] Run `npm test -- pressure.test.js` — all tests should pass
- [x] Verify calculation: 150 m³ × 20 bar / 18 ≈ 166.67 L (low pressure with OBM)
- [x] Verify calculation: 150 m³ × 325 bar / 18 ≈ 2708.33 L (high pressure delta with OBM)
- [x] Run `npm test` — full test suite passes with no regressions

#### Step 1 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

### Step 2: Create Pressure Test HTML UI

- [x] Open `index.html` and locate the Flow Velocity view section (search for `id="view-flow"`). Insert the following pressure test section **after** the closing `</section>` of the flow velocity view and **before** the settings view (`id="view-settings"`):

```html
<!-- ═══════════════════════════════════════════════════════════════════
         PRESSURE TEST VIEW
         ═══════════════════════════════════════════════════════════════════ -->
<section
  id="view-pressure"
  class="app-view"
  data-view="pressure"
  aria-label="Pressure Test Calculator"
  hidden
>
  <div class="pressure-header">
    <h2>Pressure Test</h2>
    <p class="small-note">
      Calculate volume required to pressurize selected well sections.
    </p>
  </div>

  <div class="pressure-card">
    <!-- Volume Section Selection -->
    <div class="pressure-section-selector">
      <label class="pressure-label">Select Well Sections</label>
      <div id="pressure-section-buttons" class="pressure-section-buttons">
        <p class="small-note">Loading sections...</p>
      </div>
      <div class="pressure-total-row">
        <span>Total selected volume:</span>
        <strong id="pressure-total-volume">0.00 m³</strong>
      </div>
    </div>

    <!-- Pressure Inputs -->
    <div class="input-row three-cols pressure-input-row">
      <div class="input-inline">
        <label for="pressure_low">Low test pressure</label>
        <div class="input-with-unit">
          <input
            type="number"
            id="pressure_low"
            name="pressure_low"
            step="1"
            min="0"
            max="1035"
            value="20"
            placeholder="20"
          />
          <span class="input-unit">bar</span>
        </div>
      </div>
      <div class="input-inline">
        <label for="pressure_high">High test pressure</label>
        <div class="input-with-unit">
          <input
            type="number"
            id="pressure_high"
            name="pressure_high"
            step="1"
            min="0"
            max="1035"
            value="345"
            placeholder="345"
          />
          <span class="input-unit">bar</span>
        </div>
      </div>
      <div class="input-inline">
        <label for="pressure_k_value">Compressibility (k)</label>
        <input
          type="number"
          id="pressure_k_value"
          name="pressure_k_value"
          step="1"
          min="1"
          value="18"
          placeholder="18"
        />
      </div>
    </div>

    <!-- Fluid Type Quick Buttons -->
    <div class="pressure-quick-row">
      <label>Fluid type presets:</label>
      <div class="pressure-quick-buttons">
        <button
          type="button"
          class="pressure-quick-btn"
          data-pressure-k="wbm_brine"
        >
          WBM/Brine (21)
        </button>
        <button type="button" class="pressure-quick-btn" data-pressure-k="obm">
          OBM (18)
        </button>
        <button
          type="button"
          class="pressure-quick-btn"
          data-pressure-k="base_oil"
        >
          Base Oil (14)
        </button>
        <button type="button" class="pressure-quick-btn" data-pressure-k="kfls">
          KFLS (35)
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div
      id="pressure-error"
      class="small-note warning hidden"
      role="alert"
    ></div>
  </div>

  <!-- Empty State -->
  <div id="pressure-results-empty" class="pressure-empty-state">
    <p class="small-note">
      Select well sections and enter pressure values to calculate required fluid
      volumes.
    </p>
  </div>

  <!-- Results -->
  <div id="pressure-results" class="pressure-results hidden" aria-live="polite">
    <div class="pressure-results-grid">
      <div class="pressure-result-card">
        <h3>Low Pressure Test</h3>
        <p class="pressure-range">
          0 → <span id="pressure-low-target">20</span> bar
        </p>
        <p class="pressure-volume" id="pressure-low-result">— L</p>
      </div>
      <div class="pressure-result-card">
        <h3>High Pressure Test</h3>
        <p class="pressure-range">
          <span id="pressure-high-from">20</span> →
          <span id="pressure-high-target">345</span> bar
        </p>
        <p class="pressure-volume" id="pressure-high-result">— L</p>
      </div>
    </div>
    <div class="pressure-formula-note small-note">
      Formula: V<sub>liters</sub> = (V<sub>m³</sub> × ΔP<sub>bar</sub>) / k
    </div>
  </div>
</section>
```

- [x] Locate the sidebar navigation in `index.html` (search for `data-section="flow"`). Find the **disabled** pressure button and **enable** it by removing the `disabled` and `aria-disabled="true"` attributes. The button should look like this after editing:

```html
<li class="sidebar-nav-item" role="listitem">
  <button
    class="sidebar-nav-button"
    data-section="pressure"
    aria-label="Navigate to Pressure Test section"
    role="button"
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
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
      />
    </svg>
    <span class="sidebar-nav-text">Pressure</span>
  </button>
</li>
```

#### Step 2 Verification Checklist

- [x] Open `index.html` in browser
- [x] Verify "Pressure" button appears in sidebar (between Flow Velocity and Settings)
- [x] Click "Pressure" button — pressure test view should display
- [x] Verify all UI elements render: section selector area, pressure inputs (20, 345 defaults), k value input (18 default), fluid preset buttons, empty state message
- [x] No console errors in browser dev tools

#### Step 2 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

### Step 3: Style Pressure Test UI

- [x] Open `src/css/style.css` and add the following styles at the end of the file, before any closing comments or media queries for the pressure section:

```css
/* ═══════════════════════════════════════════════════════════════════════════
   PRESSURE TEST STYLES
   ═══════════════════════════════════════════════════════════════════════════ */

.pressure-header {
  margin-bottom: 12px;
}

.pressure-header h2 {
  margin: 0 0 4px 0;
}

.pressure-card {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Section Selector */
.pressure-section-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pressure-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-color);
}

.pressure-section-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pressure-section-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 10px 14px;
  border: 2px solid var(--input-border);
  border-radius: var(--border-radius);
  background: var(--input-bg);
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 160px;
}

.pressure-section-btn:hover {
  border-color: var(--muted);
  background: var(--bg-tertiary);
}

.pressure-section-btn.selected {
  border-color: var(--equinor-red);
  background: rgba(227, 27, 35, 0.08);
}

[data-theme='dark'] .pressure-section-btn.selected {
  background: rgba(255, 123, 128, 0.12);
}

.pressure-section-btn .section-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
}

.pressure-section-btn .section-volume {
  font-size: 0.85rem;
  color: var(--muted);
}

.pressure-section-btn.selected .section-name,
.pressure-section-btn.selected .section-volume {
  color: var(--equinor-red);
}

[data-theme='dark'] .pressure-section-btn.selected .section-name,
[data-theme='dark'] .pressure-section-btn.selected .section-volume {
  color: var(--equinor-red);
}

.pressure-total-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
  font-size: 0.95rem;
}

.pressure-total-row strong {
  color: var(--equinor-red);
  font-size: 1.05rem;
}

/* Pressure Input Row */
.pressure-input-row {
  align-items: flex-start;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit input {
  flex: 1;
  min-width: 80px;
}

.input-unit {
  font-size: 0.9rem;
  color: var(--muted);
  font-weight: 500;
}

/* Quick Buttons Row */
.pressure-quick-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pressure-quick-row label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--muted);
}

.pressure-quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pressure-quick-btn {
  border: 1px solid var(--input-border);
  background: var(--surface-bg);
  border-radius: 999px;
  padding: 6px 14px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease,
    border-color 0.12s ease;
}

.pressure-quick-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--muted);
  transform: translateY(-1px);
}

.pressure-quick-btn:active {
  transform: translateY(0);
}

/* Empty State */
.pressure-empty-state {
  margin-top: 16px;
  padding: 14px;
  border-radius: var(--border-radius);
  border: 1px dashed var(--border-color);
  background: var(--surface-bg);
}

/* Results */
.pressure-results {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.pressure-results.hidden {
  display: none;
}

.pressure-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.pressure-result-card {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
  text-align: center;
}

.pressure-result-card h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: var(--text-color);
}

.pressure-range {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.pressure-volume {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--equinor-red);
}

.pressure-formula-note {
  text-align: center;
  padding: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--border-radius);
}

/* Responsive */
@media (max-width: 768px) {
  .pressure-section-btn {
    min-width: 140px;
    flex: 1 1 calc(50% - 8px);
  }

  .pressure-quick-btn {
    flex: 1 1 calc(50% - 8px);
    text-align: center;
  }
}

@media (max-width: 480px) {
  .pressure-section-btn {
    flex: 1 1 100%;
  }

  .input-row.three-cols.pressure-input-row {
    grid-template-columns: 1fr;
  }
}
```

#### Step 3 Verification Checklist

- [x] Open in browser — verify pressure card has proper background, border, shadow
- [x] Section buttons display in a flex wrap layout
- [x] Selected section buttons have red border and tinted background
- [x] Quick preset buttons have pill shape with hover effect
- [x] Result cards display centered with large red volume numbers
- [x] Toggle dark mode — verify all elements adapt correctly
- [x] Test responsive layout at narrow widths (mobile view)

#### Step 3 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

### Step 4: Wire Up Event Handlers and Integration

- [x] Open `src/js/sidebar.js` and add `'pressure'` to the `KNOWN_SECTIONS` Set. Locate the line:

```javascript
const KNOWN_SECTIONS = new Set(['casings', 'completion', 'flow', 'settings']);
```

Change it to:

```javascript
const KNOWN_SECTIONS = new Set([
  'casings',
  'completion',
  'flow',
  'pressure',
  'settings'
]);
```

- [x] Open `src/js/script.js` and add the pressure module import. Locate the import section at the top and add:

```javascript
import {
  computePressureTest,
  gatherPressureInput,
  setupPressureUI,
  renderPressureResults
} from './pressure.js';
```

- [x] In `src/js/script.js`, locate the `VolumeCalc` IIFE and add a variable to track pressure results. Find:

```javascript
let lastFlowResults = undefined;
```

Add after it:

```javascript
let lastPressureResults = undefined;
```

- [x] In `src/js/script.js`, inside the `calculateVolume()` function, add the pressure test calculation. Locate where `lastFlowResults` is computed (after the flow velocity computation) and add the following after the `renderFlowVelocityResults(lastFlowResults);` call:

```javascript
// Pressure test calculation
const pressureInput = gatherPressureInput();
lastPressureResults = computePressureTest(pressureInput, {
  casingsInput,
  drillpipeInput: dpInput,
  tubingInput,
  volumes: {
    drillPipeCapacity: volumes?.drillPipeCapacity,
    tubingCapacity: volumes?.tubingCapacity,
    annulusInnermost: volumes?.annulusTotal
  }
});
renderPressureResults(lastPressureResults);
```

- [x] In `src/js/script.js`, inside the `initUI()` call within `init()`, add the pressure UI setup. Locate the call to `setupFlowVelocityUI` and add after it:

```javascript
setupPressureUI({
  calculateVolume,
  scheduleSave: persistence.scheduleSave
});
```

#### Step 4 Verification Checklist

- [x] Run `npm test` — all tests pass
- [x] Open in browser, navigate to Pressure tab
- [x] Configure some casings in the Casings tab, then return to Pressure tab
- [x] Section buttons should appear dynamically based on configured well
- [x] Click section buttons — they toggle selected state
- [x] Total volume updates when sections are selected/deselected
- [x] Change pressure inputs — results update in real-time
- [x] Click fluid preset buttons — k value updates and results recalculate
- [x] Verify low test shows "0 → 20 bar" result
- [x] Verify high test shows "20 → 345 bar" result
- [x] Refresh page — verify selections persist (state restoration)

#### Step 4 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

### Step 5: Documentation and Final Polish

- [x] Open `README.md` and add documentation for the pressure test feature. Add a new section under the features list:

```markdown
### Pressure Test Calculator

Calculate the volume of fluid required to pressurize selected well sections:

- **Section Selection**: Choose from drill pipe capacity, tubing capacity, or annulus sections
- **Two-Stage Testing**: Calculate volumes for both low pressure (0 → 20 bar) and high pressure (20 → 345 bar) tests
- **Fluid Types**: Quick-select presets for common fluids (WBM/Brine k=21, OBM k=18, Base Oil k=14, KFLS k=35)
- **Formula**: V(liters) = (V(m³) × ΔP(bar)) / k
```

- [x] Open `CHANGELOG.md` and add an entry for the pressure test feature at the top of the changelog:

```markdown
## [Unreleased]

### Added

- Pressure test calculator for determining fluid volumes required to pressurize well sections
  - Selectable well sections (drill pipe, tubing, annulus volumes)
  - Two-stage pressure testing (low: 0→20 bar, high: 20→345 bar)
  - Fluid type presets with compressibility constants (k values)
  - Real-time calculation updates
```

#### Step 5 Verification Checklist

- [x] Run `npm test` — full test suite passes
- [ ] Run `npm run lint` — no linting errors
- [ ] Review README.md — pressure test feature is documented
- [ ] Review CHANGELOG.md — entry is added
- [ ] Manual end-to-end test:
  1. Configure a well with casings and drill pipe
  2. Navigate to Pressure tab
  3. Select multiple sections
  4. Verify total volume sums correctly
  5. Change pressure values and k constant
  6. Verify both low and high test results calculate correctly
  7. Test with different fluid presets
  8. Refresh page — verify state persists
- [ ] Test keyboard navigation through pressure UI
- [ ] Verify no console errors throughout testing

#### Step 5 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

## Summary

This implementation adds a complete pressure test calculator feature following the existing codebase patterns:

1. **Constants** (`constants.js`): Fluid compressibility k values and pressure defaults
2. **Core Module** (`pressure.js`): Pure calculation functions, input gathering, UI setup, and rendering
3. **Tests** (`pressure.test.js`): Comprehensive unit tests for all calculations and edge cases
4. **HTML** (`index.html`): Pressure test view with section selector, inputs, and results display
5. **CSS** (`style.css`): Styling matching existing calculator sections with dark mode support
6. **Integration** (`script.js`, `sidebar.js`): Wired into main calculation flow and navigation
7. **Documentation** (`README.md`, `CHANGELOG.md`): Feature documentation and changelog entry
