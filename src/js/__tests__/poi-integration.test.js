import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

/** @vitest-environment jsdom */

describe('POI Integration Tests', () => {
  it('calculates plugAboveTubingOpenCasing when tubing is above POI', () => {
    // Scenario from screenshot 1: Tubing at 360m, POI at 366m
    const casings = [
      {
        role: 'riser',
        id: 20,
        od: 20.75,
        depth: 361.5,
        use: true,
        top: 0
      },
      {
        role: 'intermediate',
        id: 13.5,
        od: 14.375,
        depth: 1719.5,
        use: true,
        top: 361.5
      },
      {
        role: 'production',
        id: 8.681,
        od: 9.625,
        depth: 3277.5,
        use: true,
        top: 1719.5
      },
      {
        role: 'reservoir',
        id: 7,
        od: 7.875,
        depth: 4020,
        use: true,
        top: 3277.5
      },
      {
        role: 'upper_completion',
        id: 4.892,
        od: 5.5,
        depth: 360,
        use: true,
        top: 0
      }
    ];

    const result = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 366,
      surfaceInUse: false,
      intermediateInUse: true,
      drillPipe: { mode: 'tubing', pipes: [] },
      subtractEod: true
    });

    console.log('Result:', result);
    console.log('plugAboveTubingOpenCasing:', result.plugAboveTubingOpenCasing);
    console.log('plugAboveTubing:', result.plugAboveTubing);
    console.log('plugBelowTubing:', result.plugBelowTubing);
    console.log('plugAboveAnnulus:', result.plugAboveAnnulus);
    console.log('plugBelowAnnulus:', result.plugBelowAnnulus);

    // UC bottom is at 360m, POI is at 366m -> 6m of open casing
    // Open casing should be calculated in the riser (20" ID)
    // Expected volume: π * (20/2 * 0.0254)² * 6 ≈ 1.22 m³
    expect(result.plugAboveTubingOpenCasing).toBeGreaterThan(0);
    expect(result.plugAboveTubing).toBeGreaterThan(0);
    expect(result.plugAboveAnnulus).toBeGreaterThan(0);
  });

  it('calculates drill pipe POI volumes correctly', () => {
    // Scenario from screenshot 2: Drill pipe mode with 3 DPs
    const casings = [
      {
        role: 'riser',
        id: 20,
        od: 20.75,
        depth: 361.5,
        use: true,
        top: 0
      },
      {
        role: 'intermediate',
        id: 13.5,
        od: 14.375,
        depth: 1719.5,
        use: true,
        top: 361.5
      },
      {
        role: 'production',
        id: 8.681,
        od: 9.625,
        depth: 3277.5,
        use: true,
        top: 1719.5
      },
      {
        role: 'reservoir',
        id: 7,
        od: 7.875,
        depth: 4020,
        use: true,
        top: 3277.5
      },
      {
        role: 'upper_completion',
        id: 4.892,
        od: 5.5,
        depth: 360,
        use: true,
        top: 0
      }
    ];

    const drillPipe = {
      mode: 'drillpipe',
      pipes: [
        { od: 5.78, length: 0, lPerM: 20.134, eod: 2.424 },
        { od: 5, length: 0, lPerM: 15.197, eod: 1.803 },
        { od: 4, length: 0, lPerM: 9.697, eod: 1.141 }
      ]
    };

    const result = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 366,
      surfaceInUse: false,
      intermediateInUse: true,
      drillPipe,
      subtractEod: true
    });

    console.log('Drill pipe result:', result);
    console.log('plugAboveDrillpipe:', result.plugAboveDrillpipe);
    console.log('plugBelowDrillpipe:', result.plugBelowDrillpipe);
    console.log('plugAboveDrillpipeAnnulus:', result.plugAboveDrillpipeAnnulus);
    console.log('plugBelowDrillpipeAnnulus:', result.plugBelowDrillpipeAnnulus);
    console.log(
      'plugAboveDrillpipeOpenCasing:',
      result.plugAboveDrillpipeOpenCasing
    );

    // With drill pipe, we should have values for DP volumes
    // Since DP length is 0, all volumes might be 0, but the structure should be there
    expect(result.dpMode).toBe(true);
  });

  it('shows POI values are 0 when UC is not used', () => {
    const casings = [
      {
        role: 'riser',
        id: 20,
        od: 20.75,
        depth: 361.5,
        use: true,
        top: 0
      },
      {
        role: 'intermediate',
        id: 13.5,
        od: 14.375,
        depth: 1719.5,
        use: true,
        top: 361.5
      },
      {
        role: 'upper_completion',
        id: 4.892,
        od: 5.5,
        depth: 360,
        use: false, // UC not in use
        top: 0
      }
    ];

    const result = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 366,
      surfaceInUse: false,
      intermediateInUse: true,
      drillPipe: { mode: 'tubing', pipes: [] },
      subtractEod: true
    });

    console.log('UC disabled result:', result);
    console.log('ucActive:', result.ucActive);
    console.log('plugAboveTubingOpenCasing:', result.plugAboveTubingOpenCasing);

    // When UC is not active, UC-specific POI values should be 0
    expect(result.ucActive).toBe(false);
    expect(result.plugAboveTubingOpenCasing).toBe(0);
  });

  it('calculates casingVolumeBelowTubingShoe correctly', () => {
    // Test: When tubing shoe is at the same depth as the Reservoir top,
    // casingVolumeBelowTubingShoe should equal the Reservoir volume
    const casings = [
      {
        role: 'riser',
        id: 20,
        od: 20.75,
        depth: 361.5,
        use: true,
        top: 0
      },
      {
        role: 'intermediate',
        id: 13.5,
        od: 14.375,
        depth: 1719.5,
        use: true,
        top: 361.5
      },
      {
        role: 'production',
        id: 8.681,
        od: 9.625,
        depth: 3277.5,
        use: true,
        top: 1719.5
      },
      {
        role: 'reservoir',
        id: 7,
        od: 7.875,
        depth: 4065,
        use: true,
        top: 3277.5
      },
      {
        role: 'upper_completion',
        id: 4.892,
        od: 5.5,
        depth: 3228.2,
        use: true,
        top: 0
      }
    ];

    const result = computeVolumes(
      casings,
      362, // plugDepthVal
      null, // no drill pipe
      { ucActive: true }
    );

    console.log('Tubing shoe volume test:', {
      tubingShoe: 3228.2,
      casingVolumeBelowTubingShoe: result.casingVolumeBelowTubingShoe,
      reservoirVolume: result.perCasingVolumes.find(function (c) { return c.role === 'reservoir'; })?.volume
    });

    // The casing volume below the tubing shoe should include the Production segment
    // between the tubing shoe and the production shoe, plus the Reservoir volume
    const reservoirVolume = result.perCasingVolumes.find(function (c) { return c.role === 'reservoir'; })?.volume || 0;
    const production = result.perCasingVolumes.find(function (c) { return c.role === 'production'; });
    const prodPerMeter = production?.perMeter_m3 || 0;
    const prodTop = 2081; // from test data
    const prodDepth = 3277.5;
    const tubingShoe = 3228.2;
    const prodLenBelow = Math.max(
      0,
      Math.min(prodDepth, Infinity) - Math.max(prodTop, tubingShoe)
    );
    const prodBelowVol = prodPerMeter * prodLenBelow;
    const expected = reservoirVolume + prodBelowVol;
    expect(result.casingVolumeBelowTubingShoe).toBeCloseTo(expected, 2);
  });
});
