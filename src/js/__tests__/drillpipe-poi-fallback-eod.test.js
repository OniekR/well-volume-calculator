import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

/** @vitest-environment jsdom */

describe('Drill pipe POI with fallback EOD calculation', () => {
  it('calculates POI volumes correctly when DP does not have eod property (fallback from OD/ID)', () => {
    // Scenario: DP with OD and ID info, but no explicit EOD value
    // System should fallback to calculating steel displacement from OD and ID
    const casings = [
      {
        role: 'riser',
        id: 13.5,
        od: 15.5,
        top: 0,
        depth: 2500,
        use: true
      }
    ];

    // Test 1: DP at 363m with EOD provided
    const result1 = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: 1, length: 363, lPerM: 13.1, od: 5.875, eod: 4.739 }]
      }
    });

    // Test 2: DP at 363m WITHOUT EOD (should use fallback calculation)
    // For 5.875" OD with 13.1 L/m ID volume, calculate what the steel displacement should be
    // ID volume rate = 13.1 L/m = 0.0131 m³/m
    // ID area = 0.0131 m²
    // ID radius = sqrt(0.0131 / π) = sqrt(0.004167) = 0.06455 m
    // OD radius = 5.875/2 * 0.0254 = 0.07462 m
    // Steel area = π * (0.07462² - 0.06455²) = π * (0.005568 - 0.004167) = 0.004401 m²
    // Steel volume per meter = 0.004401 m³/m = 4.401 L/m
    const result2 = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: 1, length: 363, lPerM: 13.1, od: 5.875 }]
      }
    });

    // Both should have similar total volumes below POI (calculated slightly differently)
    // The difference should be minimal since we're calculating the same physical property
    expect(result1.plugBelowVolume).toBeCloseTo(result2.plugBelowVolume, 0);
  });

  it('uses fallback calculation when DP at deeper depth without eod', () => {
    // Scenario: Verify fallback works correctly at increased depths
    const casings = [
      {
        role: 'riser',
        id: 13.5,
        od: 15.5,
        top: 0,
        depth: 2500,
        use: true
      }
    ];

    // Test 1: DP at 500m WITH EOD
    const result1 = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: 1, length: 500, lPerM: 13.1, od: 5.875, eod: 4.739 }]
      }
    });

    // Test 2: DP at 500m WITHOUT EOD (using fallback)
    const result2 = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: 1, length: 500, lPerM: 13.1, od: 5.875 }]
      }
    });

    // Both should show volume below POI decreasing (more DP steel = less fluid)
    // The magnitude of decrease should be similar
    expect(result2.plugBelowVolume).toBeCloseTo(result1.plugBelowVolume, 0);
  });

  it('handles mixed DP segments with and without eod', () => {
    // Scenario: First segment has EOD, second doesn't - both should work
    const casings = [
      {
        role: 'riser',
        id: 13.5,
        od: 15.5,
        top: 0,
        depth: 700,
        use: true
      }
    ];

    const result = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 382,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [
          { size: 1, length: 400, lPerM: 13.1, od: 5.875, eod: 4.739 },
          { size: 2, length: 150, lPerM: 11.8, od: 5.0 } // no eod, will use fallback
        ]
      }
    });

    // Should successfully calculate volumes with mixed EOD/no-EOD segments
    expect(result.plugBelowVolume).toBeGreaterThan(0);
    expect(result.plugBelowDrillpipe).toBeGreaterThan(0);
  });
});
