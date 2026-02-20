/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  computeAnnularArea,
  computeLiftForce,
  calculateStringLift,
  gatherStringLiftInput,
  renderStringLiftResults,
  setupStringLiftUI,
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
      expect(labels).toContain('13 3/8" (12.415" ID)');
      expect(labels).toContain('13 3/8" (12.347" ID)');
      expect(labels).toContain('9 5/8" (8.535" ID)');
      expect(labels).toContain('7" (6.184" ID)');
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

  describe('gatherStringLiftInput', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <select id="lift_casing_select"><option value="12.415" selected></option></select>
        <input id="lift_casing_id" value="12.415" />
        <select id="lift_drillpipe_select"><option value="5" selected></option></select>
        <input id="lift_drillpipe_od" value="5" />
        <input id="lift_pressure" value="5000" />
        <select id="lift_pressure_unit"><option value="psi" selected></option></select>
      `;
    });

    it('parses input values and converts psi to bar', () => {
      const input = gatherStringLiftInput();
      expect(input.casingID).toBe(12.415);
      expect(input.pipeOD).toBe(5);
      expect(input.pressureUnit).toBe('psi');
      expect(input.pressureBar).toBeCloseTo(5000 * 0.0689476, 6);
    });
  });

  describe('renderStringLiftResults', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="lift-results" class="hidden"></div>
        <div id="lift-results-empty"></div>
        <div id="lift-error" class="hidden"></div>
        <div id="lift-result-value"></div>
        <div id="lift-breakdown-id"></div>
        <div id="lift-breakdown-od"></div>
        <div id="lift-breakdown-area"></div>
        <div id="lift-breakdown-pressure"></div>
        <div id="lift-breakdown-lift"></div>
      `;
    });

    it('shows error for invalid result', () => {
      renderStringLiftResults({ valid: false, reason: 'missing_input' });
      expect(
        document.getElementById('lift-error').classList.contains('hidden')
      ).toBe(false);
    });

    it('renders valid result values', () => {
      renderStringLiftResults({
        valid: true,
        casingID: 12.415,
        casingIDMeters: 0.315,
        pipeOD: 5,
        pipeODMeters: 0.127,
        areaM2: 0.05,
        areaIn2: 10,
        pressureBar: 100,
        pressurePa: 10000000,
        pressureUnit: 'bar',
        pressureRaw: 100,
        tons: 50,
        kgf: 100,
        newtons: 200
      });
      expect(
        document.getElementById('lift-results').classList.contains('hidden')
      ).toBe(false);
      expect(
        document.getElementById('lift-result-value').textContent
      ).toContain('50');
    });
  });

  describe('setupStringLiftUI', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <select id="lift_casing_select"><option value="12.415" selected></option></select>
        <input id="lift_casing_id" value="12.415" />
        <select id="lift_drillpipe_select"><option value="5" selected></option></select>
        <input id="lift_drillpipe_od" value="5" />
        <input id="lift_pressure" value="100" />
        <select id="lift_pressure_unit"><option value="bar" selected></option></select>
        <div id="lift-results"></div>
        <div id="lift-results-empty"></div>
        <div id="lift-error" class="hidden"></div>
        <div id="lift-result-value"></div>
        <div id="lift-breakdown-id"></div>
        <div id="lift-breakdown-od"></div>
        <div id="lift-breakdown-area"></div>
        <div id="lift-breakdown-pressure"></div>
        <div id="lift-breakdown-lift"></div>
      `;
    });

    it('recalculates on input changes and schedules save', () => {
      const deps = { scheduleSave: vi.fn() };
      setupStringLiftUI(deps);
      document.getElementById('lift_pressure').value = '200';
      document
        .getElementById('lift_pressure')
        .dispatchEvent(new Event('input'));
      expect(deps.scheduleSave).toHaveBeenCalled();
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
      expect(result.tons).toBeCloseTo(124, 0);
    });
  });
});
