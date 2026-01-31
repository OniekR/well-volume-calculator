/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculatePressureVolume,
  buildSelectableSections,
  computePressureTest,
  gatherPressureInput,
  setupPressureUI,
  renderPressureResults,
  FLUID_COMPRESSIBILITY,
  FLUID_COMPRESSIBILITY_LABELS,
  PRESSURE_DEFAULTS
} from '../pressure.js';

describe('pressure.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Constants', () => {
    it('exports FLUID_COMPRESSIBILITY with expected values', () => {
      expect(FLUID_COMPRESSIBILITY.wbm_brine).toBe(21);
      expect(FLUID_COMPRESSIBILITY.obm).toBe(18);
      expect(FLUID_COMPRESSIBILITY.base_oil).toBe(14);
      expect(FLUID_COMPRESSIBILITY.kfls).toBe(35);
    });

    it('exports FLUID_COMPRESSIBILITY_LABELS for all fluids', () => {
      Object.keys(FLUID_COMPRESSIBILITY).forEach((key) => {
        expect(FLUID_COMPRESSIBILITY_LABELS[key]).toBeDefined();
        expect(typeof FLUID_COMPRESSIBILITY_LABELS[key]).toBe('string');
      });
    });

    it('exports PRESSURE_DEFAULTS with expected values', () => {
      expect(PRESSURE_DEFAULTS.lowPressure).toBe(20);
      expect(PRESSURE_DEFAULTS.highPressure).toBe(345);
      expect(PRESSURE_DEFAULTS.maxPressure).toBe(1035);
    });
  });

  describe('calculatePressureVolume()', () => {
    it('calculates pressure volume correctly', () => {
      const volumeM3 = 100;
      const pressureDelta = 100;
      const kValue = 21;
      const result = calculatePressureVolume(volumeM3, pressureDelta, kValue);
      expect(result).toBeCloseTo((100 * 100) / 21, 2);
    });

    it('returns 0 for zero volume', () => {
      const result = calculatePressureVolume(0, 100, 21);
      expect(result).toBe(0);
    });

    it('returns 0 for zero pressure delta', () => {
      const result = calculatePressureVolume(100, 0, 21);
      expect(result).toBe(0);
    });

    it('handles different k values correctly', () => {
      const volume = 50;
      const pressure = 200;
      const result1 = calculatePressureVolume(volume, pressure, 21);
      const result2 = calculatePressureVolume(volume, pressure, 14);
      expect(result2).toBeGreaterThan(result1);
    });
  });

  describe('buildSelectableSections()', () => {
    const mockCasings = [
      { role: 'surface', name: 'Surface Casing', use: true, depth: 500, od: 13.375, id: 12.415 },
      {
        role: 'intermediate',
        name: 'Intermediate',
        use: true,
        depth: 2000,
        od: 9.625,
        id: 8.835
      }
    ];

    const mockVolumes = {
      drillPipeCapacity: 12,
      annulusInnermost: 25,
      annulus_surface_intermediate: 40
    };

    it('builds sections from casings input', () => {
      const result = buildSelectableSections({
        casingsInput: mockCasings,
        volumes: mockVolumes
      });
      expect(result).toContainEqual(
        expect.objectContaining({
          id: 'annulus_innermost'
        })
      );
    });

    it('includes drillpipe sections when provided', () => {
      const result = buildSelectableSections({
        casingsInput: mockCasings,
        drillpipeInput: { mode: 'drillpipe', count: 1 },
        volumes: mockVolumes
      });
      const dpSection = result.find((s) => s.role === 'drillpipe');
      expect(dpSection).toBeUndefined();
      expect(result.find((s) => s.id === 'drillpipe_capacity')).toBeDefined();
    });

    it('includes tubing sections when provided', () => {
      const result = buildSelectableSections({
        casingsInput: mockCasings,
        drillpipeInput: { mode: 'tubing', count: 0 },
        tubingInput: { count: 1 },
        volumes: { ...mockVolumes, tubingCapacity: 6 }
      });
      expect(result.find((s) => s.id === 'tubing_capacity')).toBeDefined();
    });

    it('returns empty array for empty input', () => {
      const result = buildSelectableSections({
        casingsInput: [],
        volumes: { casings: [], drillpipe: null, tubing: null }
      });
      expect(result).toEqual([]);
    });
  });

  describe('gatherPressureInput()', () => {
    function setupPressureDOM({
      active = true,
      lowPressure = '20',
      highPressure = '345',
      kValue = '21'
    } = {}) {
      document.body.innerHTML = `
        <input type="checkbox" id="pressure_active" ${
          active ? 'checked' : ''
        } />
        <input type="number" id="pressure_low" value="${lowPressure}" />
        <input type="number" id="pressure_high" value="${highPressure}" />
        <select id="pressure_k_value">
          <option value="21" ${
            kValue === '21' ? 'selected' : ''
          }>WBM/Brine</option>
          <option value="18" ${kValue === '18' ? 'selected' : ''}>OBM</option>
          <option value="14" ${
            kValue === '14' ? 'selected' : ''
          }>Base Oil</option>
          <option value="35" ${kValue === '35' ? 'selected' : ''}>KFLS</option>
        </select>
        <div id="pressure-section-buttons"></div>
      `;
    }

    it('gathers input values correctly', () => {
      setupPressureDOM();
      const result = gatherPressureInput();
      expect(result.active).toBe(true);
      expect(result.lowPressure).toBe(20);
      expect(result.highPressure).toBe(345);
      expect(result.kValue).toBe(21);
    });

    it('returns inactive when checkbox unchecked', () => {
      setupPressureDOM({ active: false });
      const result = gatherPressureInput();
      expect(result.active).toBe(false);
    });

    it('parses numeric values correctly', () => {
      setupPressureDOM({
        lowPressure: '50',
        highPressure: '500',
        kValue: '18'
      });
      const result = gatherPressureInput();
      expect(result.lowPressure).toBe(50);
      expect(result.highPressure).toBe(500);
      expect(result.kValue).toBe(18);
    });
  });

  describe('computePressureTest()', () => {
    const mockPressureInput = {
      active: true,
      lowPressure: 20,
      highPressure: 345,
      kValue: 21,
      selectedSectionIds: ['annulus_innermost']
    };

    const mockWellConfig = {
      casingsInput: [
        {
          role: 'production',
          use: true,
          depth: 3000,
          od: 7,
          id: 6.184
        }
      ],
      drillpipeInput: { mode: 'drillpipe', count: 0 },
      tubingInput: { count: 0 },
      volumes: { annulusInnermost: 100 }
    };

    it('computes pressure test result', () => {
      const result = computePressureTest(mockPressureInput, mockWellConfig);
      expect(result).toHaveProperty('lowTestLiters');
      expect(result).toHaveProperty('highTestLiters');
      expect(result).toHaveProperty('totalVolumeM3');
    });

    it('returns null when inactive', () => {
      const result = computePressureTest(
        { ...mockPressureInput, active: false },
        mockWellConfig
      );
      expect(result).toEqual({ active: false, valid: false });
    });

    it('calculates volumes based on pressure delta', () => {
      const result = computePressureTest(mockPressureInput, mockWellConfig);
      expect(result.highTestLiters).toBeGreaterThan(result.lowTestLiters);
    });
  });

  describe('renderPressureResults()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="pressure-results" class="hidden">
          <span id="pressure-low-result">0</span>
          <span id="pressure-high-result">0</span>
          <span id="pressure-total-volume">0</span>
        </div>
        <div id="pressure-results-empty"></div>
        <div id="pressure-error" class="hidden"></div>
      `;
    });

    it('shows results container and hides empty state', () => {
      renderPressureResults({
        active: true,
        valid: true,
        totalVolumeM3: 60,
        lowTestLiters: 10,
        highTestLiters: 50
      });
      const results = document.getElementById('pressure-results');
      const empty = document.getElementById('pressure-results-empty');
      expect(results.classList.contains('hidden')).toBe(false);
      expect(empty.classList.contains('hidden')).toBe(true);
    });

    it('updates volume displays', () => {
      renderPressureResults({
        active: true,
        valid: true,
        totalVolumeM3: 90.75,
        lowTestLiters: 15.5,
        highTestLiters: 75.25
      });
      expect(
        document.getElementById('pressure-low-result').textContent
      ).toContain('15');
      expect(
        document.getElementById('pressure-high-result').textContent
      ).toContain('75');
    });

    it('hides results when result is null', () => {
      renderPressureResults(null);
      const results = document.getElementById('pressure-results');
      const empty = document.getElementById('pressure-results-empty');
      expect(results.classList.contains('hidden')).toBe(true);
      expect(empty.classList.contains('hidden')).toBe(false);
    });
  });

  describe('setupPressureUI()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="pressure_active" />
        <input type="number" id="pressure_low" value="20" />
        <input type="number" id="pressure_high" value="345" />
        <select id="pressure_k_value">
          <option value="21" selected>WBM/Brine</option>
          <option value="18">OBM</option>
        </select>
        <div id="pressure-section-buttons"></div>
        <button type="button" data-pressure-k="obm">OBM</button>
        <div id="pressure-results" class="hidden"></div>
        <div id="pressure-results-empty"></div>
      `;
    });

    it('sets up event listeners without errors', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      expect(() => setupPressureUI(deps)).not.toThrow();
    });

    it('calls deps on input change', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupPressureUI(deps);
      const input = document.getElementById('pressure_low');
      input.value = '50';
      input.dispatchEvent(new Event('input'));
      vi.runAllTimers();
      expect(deps.calculateVolume).toHaveBeenCalled();
      expect(deps.scheduleSave).toHaveBeenCalled();
    });

    it('applies k value button and triggers deps', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupPressureUI(deps);
      const btn = document.querySelector('[data-pressure-k="obm"]');
      btn.click();
      expect(document.getElementById('pressure_k_value').value).toBe(
        String(FLUID_COMPRESSIBILITY.obm)
      );
      expect(deps.calculateVolume).toHaveBeenCalled();
      expect(deps.scheduleSave).toHaveBeenCalled();
    });
  });
});
