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

  it('includes entire well volume when no string is present', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 0, pipes: [] },
      tubingInput: { count: 0, tubings: [] },
      volumes: { fullWellVolume: 120 }
    });

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      id: 'full_well_volume',
      label: 'Entire Well Volume',
      volumeM3: 120,
      type: 'well'
    });
  });

  it('applies To depth filter using exact section intervals', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 0, pipes: [] },
      tubingInput: { count: 0, tubings: [] },
      casingsInput: [
        { role: 'riser', use: true, top: 0, depth: 300 },
        { role: 'production', use: true, top: 300, depth: 1000 }
      ],
      volumes: {
        fullWellVolume: 80,
        wellTotalDepth: 1000,
        perCasingVolumes: [
          { role: 'riser', perMeter_m3: 0.05 },
          { role: 'production', perMeter_m3: 0.02 }
        ]
      },
      toDepth: 400
    });

    expect(sections).toHaveLength(1);
    expect(sections[0].volumeM3).toBeCloseTo(17, 5);
  });

  it('includes below string volume when string is present and volume is at least 1 m3', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
      tubingInput: { count: 0, tubings: [] },
      casingsInput: [
        { role: 'production', id: 7, depth: 3000, use: true, od: 9.625 }
      ],
      volumes: {
        drillPipeCapacity: 10,
        annulusInnermost: 20,
        belowStringVolume: 5
      }
    });

    expect(sections.find((s) => s.id === 'below_string_volume')).toMatchObject({
      label: 'Below string',
      volumeM3: 5
    });
  });

  it('derives below string volume from remaining full well volume when explicit value is missing', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
      tubingInput: { count: 0, tubings: [] },
      casingsInput: [
        { role: 'production', id: 9.625, depth: 2800, use: true, od: 10.75 }
      ],
      volumes: {
        fullWellVolume: 80,
        drillPipeCapacity: 20,
        annulusInnermost: 35
      }
    });

    expect(sections.find((s) => s.id === 'below_string_volume')).toMatchObject({
      label: 'Below string',
      volumeM3: 25
    });
  });

  it('applies To depth to drill pipe and annulus volumes when string is present', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
      tubingInput: { count: 0, tubings: [] },
      casingsInput: [
        { role: 'production', id: 9.625, depth: 2800, use: true, od: 10.75 }
      ],
      volumes: {
        drillPipeCapacity: 40,
        annulusInnermost: 80,
        drillPipeLength: 2000,
        drillPipeAnnulusLength: 2000
      },
      toDepth: 500
    });

    const pipe = sections.find((s) => s.id === 'drillpipe_capacity');
    const annulus = sections.find((s) => s.id === 'annulus_innermost');
    expect(pipe.volumeM3).toBeCloseTo(10, 5);
    expect(annulus.volumeM3).toBeCloseTo(20, 5);
  });

  it('applies To depth to below string volume when string is present', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
      tubingInput: { count: 0, tubings: [] },
      casingsInput: [
        { role: 'production', id: 9.625, top: 0, depth: 3000, use: true, od: 10.75 }
      ],
      volumes: {
        fullWellVolume: 120,
        drillPipeCapacity: 20,
        annulusInnermost: 30,
        drillPipeLength: 1500,
        drillPipeAnnulusLength: 1500,
        drillPipeTotalDepth: 1500,
        belowStringVolume: 70,
        perCasingVolumes: [{ role: 'production', perMeter_m3: 0.01 }],
        wellTotalDepth: 3000
      },
      toDepth: 2000
    });

    const below = sections.find((s) => s.id === 'below_string_volume');
    expect(below.volumeM3).toBeCloseTo(5, 5);
  });

  it('hides below string volume when computed volume is less than 1 m3', () => {
    const sections = buildSelectableSections({
      drillpipeInput: { mode: 'drillpipe', count: 1, pipes: [{}] },
      tubingInput: { count: 0, tubings: [] },
      casingsInput: [
        { role: 'production', id: 7, depth: 3000, use: true, od: 9.625 }
      ],
      volumes: {
        drillPipeCapacity: 10,
        annulusInnermost: 20,
        belowStringVolume: 0.5
      }
    });

    expect(sections.find((s) => s.id === 'below_string_volume')).toBeUndefined();
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

  it('adds surface volume to selected sections total', () => {
    const result = computePressureTest(
      { ...baseInput, surfaceVolumeM3: 10 },
      baseWellConfig
    );

    expect(result.valid).toBe(true);
    expect(result.totalVolumeM3).toBe(160);
  });

  it('allows calculation with only surface volume and no selected sections', () => {
    const result = computePressureTest(
      { ...baseInput, selectedSectionIds: [], surfaceVolumeM3: 3 },
      baseWellConfig
    );

    expect(result.valid).toBe(true);
    expect(result.totalVolumeM3).toBe(3);
    expect(result.lowTestLiters).toBeCloseTo(3.33, 1);
    expect(result.highTestLiters).toBeCloseTo(54.17, 1);
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
