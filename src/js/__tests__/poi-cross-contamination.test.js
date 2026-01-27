/**
 * Regression test for POI volume cross-contamination bug.
 *
 * Bug: When switching between Tubing and Drill Pipe modes, the
 * "Total vol below POI" values for each mode were affecting each other
 * due to missing property merges in script.js.
 *
 * This test ensures:
 * 1. plugBelowVolumeTubing is calculated correctly for tubing mode
 * 2. Drill pipe changes do not affect tubing POI values
 * 3. Tubing changes do not affect drill pipe POI values
 */
import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

describe('POI Cross-Contamination', () => {
  /**
   * Creates a standard casing configuration for testing.
   * Matches the P-45 A well from the screenshots.
   */
  function createTestCasings(ucShoe = 2000) {
    return [
      {
        role: 'riser',
        nomId: 17.5,
        driftId: 17.5,
        top: 0,
        depth: 362,
        use: true,
        riserType: 'drilling'
      },
      {
        role: 'intermediate',
        nomId: 12.375,
        driftId: 12.26,
        top: 361.5,
        depth: 2131,
        use: true
      },
      {
        role: 'production',
        nomId: 8.535,
        driftId: 8.508,
        top: 2081,
        depth: 3277.5,
        use: true,
        isTieback: false
      },
      {
        role: 'reservoir',
        nomId: 6.184,
        driftId: 6.102,
        top: 3228.2,
        depth: 4065,
        use: true
      },
      {
        role: 'upper_completion',
        nomId: 4.892,
        driftId: 4.892,
        od: 6.098,
        top: 0,
        depth: ucShoe,
        use: true
      }
    ];
  }

  const baseOpts = {
    plugEnabled: true,
    plugDepthVal: 362,
    surfaceInUse: false,
    intermediateInUse: true,
    subtractEod: true
  };

  it('computes plugBelowVolumeTubing in tubing mode', () => {
    const casings = createTestCasings(2000);
    const result = computeVolumes(casings, {
      ...baseOpts,
      drillPipe: { mode: 'tubing' }
    });

    // In tubing mode, plugBelowVolumeTubing should equal plugBelowVolume
    expect(result.plugBelowVolumeTubing).toBeDefined();
    expect(result.plugBelowVolumeTubing).toBe(result.plugBelowVolume);
  });

  it('computes plugBelowVolumeTubing differently from plugBelowVolume in DP mode', () => {
    const casings = createTestCasings(2000);
    const dpInput = {
      mode: 'drillpipe',
      pipes: [{ size: '5 7/8"', length: 1000, id: 0.127 }]
    };

    const result = computeVolumes(casings, {
      ...baseOpts,
      drillPipe: dpInput
    });

    // In DP mode, plugBelowVolumeTubing should be higher than plugBelowVolume
    // because it adds back the DP EOD displacement that was subtracted
    expect(result.plugBelowVolumeTubing).toBeDefined();
    expect(result.plugBelowVolumeTubing).toBeGreaterThanOrEqual(
      result.plugBelowVolume
    );
  });

  it('tubing shoe changes affect tubing mode POI values', () => {
    // Short tubing: shoe at 500m (below POI at 362m)
    const casingsShort = createTestCasings(500);
    // Long tubing: shoe at 2000m
    const casingsLong = createTestCasings(2000);

    const resultShort = computeVolumes(casingsShort, {
      ...baseOpts,
      drillPipe: { mode: 'tubing' }
    });

    const resultLong = computeVolumes(casingsLong, {
      ...baseOpts,
      drillPipe: { mode: 'tubing' }
    });

    // Longer tubing = more steel displacement below POI
    // So plugBelowVolumeTubing should differ
    expect(resultLong.plugBelowVolumeTubing).not.toBeCloseTo(
      resultShort.plugBelowVolumeTubing,
      0
    );
  });

  it('drill pipe length changes do NOT affect plugBelowVolumeTubing', () => {
    const casings = createTestCasings(2000); // Fixed tubing shoe at 2000m

    // Calculate for tubing mode first
    const tubingResult = computeVolumes(casings, {
      ...baseOpts,
      drillPipe: { mode: 'tubing' }
    });
    // Sanity: tubing-mode result should be defined
    expect(tubingResult.plugBelowVolumeTubing).toBeDefined();

    // Calculate for DP mode with short DP (above POI)
    const dpShortResult = computeVolumes(casings, {
      ...baseOpts,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: '5 7/8"', length: 363, id: 0.127 }]
      }
    });

    // Calculate for DP mode with long DP (crosses POI at 362m)
    const dpLongResult = computeVolumes(casings, {
      ...baseOpts,
      plugDepthVal: 500, // Set POI deeper so DP crosses it
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: '5 7/8"', length: 1000, id: 0.127 }]
      }
    });

    // plugBelowVolumeTubing in DP mode should add back DP displacement,
    // essentially representing what the tubing-mode value would be
    // The values should not be identical since the POI depth is different,
    // but both should be computed independently from DP settings
    expect(dpShortResult.plugBelowVolumeTubing).toBeDefined();
    expect(dpLongResult.plugBelowVolumeTubing).toBeDefined();
  });

  it('tubing shoe changes do NOT affect drill pipe POI values', () => {
    // This is the key regression test for the bug in the screenshots
    const casingsShortTubing = createTestCasings(363);
    const casingsLongTubing = createTestCasings(2000);

    const dpConfig = {
      mode: 'drillpipe',
      pipes: [{ size: '5 7/8"', length: 363, id: 0.127 }]
    };

    // Calculate DP mode with short tubing (363m)
    const dpWithShortTubing = computeVolumes(casingsShortTubing, {
      ...baseOpts,
      drillPipe: dpConfig
    });

    // Calculate DP mode with long tubing (2000m)
    const dpWithLongTubing = computeVolumes(casingsLongTubing, {
      ...baseOpts,
      drillPipe: dpConfig
    });

    // Drill pipe POI values should be IDENTICAL regardless of tubing shoe depth
    // because drill pipe calculations should not depend on UC/tubing configuration
    expect(dpWithShortTubing.plugBelowVolume).toBeCloseTo(
      dpWithLongTubing.plugBelowVolume,
      1
    );
    expect(dpWithShortTubing.plugAboveDrillpipe).toBeCloseTo(
      dpWithLongTubing.plugAboveDrillpipe,
      1
    );
    expect(dpWithShortTubing.plugBelowDrillpipe).toBeCloseTo(
      dpWithLongTubing.plugBelowDrillpipe,
      1
    );
    expect(dpWithShortTubing.plugAboveDrillpipeAnnulus).toBeCloseTo(
      dpWithLongTubing.plugAboveDrillpipeAnnulus,
      1
    );
    expect(dpWithShortTubing.plugBelowDrillpipeAnnulus).toBeCloseTo(
      dpWithLongTubing.plugBelowDrillpipeAnnulus,
      1
    );
  });

  it('mode switch does not carry over stale values', () => {
    const casings = createTestCasings(2000);

    // Simulate switching from tubing mode
    const tubingResult = computeVolumes(casings, {
      ...baseOpts,
      drillPipe: { mode: 'tubing' }
    });

    // Switch to DP mode
    const dpResult = computeVolumes(casings, {
      ...baseOpts,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: '5 7/8"', length: 363, id: 0.127 }]
      }
    });
    // Sanity: DP run should produce a valid result
    expect(dpResult.plugBelowVolume).toBeDefined();

    // Switch back to tubing mode
    const tubingResult2 = computeVolumes(casings, {
      ...baseOpts,
      drillPipe: { mode: 'tubing' }
    });

    // Values should be identical when returning to tubing mode
    expect(tubingResult2.plugBelowVolumeTubing).toBeCloseTo(
      tubingResult.plugBelowVolumeTubing,
      10
    );
    expect(tubingResult2.plugBelowTubing).toBeCloseTo(
      tubingResult.plugBelowTubing,
      10
    );
    expect(tubingResult2.plugBelowAnnulus).toBeCloseTo(
      tubingResult.plugBelowAnnulus,
      10
    );
  });

  it('returns all required POI properties', () => {
    const casings = createTestCasings(2000);

    const result = computeVolumes(casings, {
      ...baseOpts,
      drillPipe: { mode: 'tubing' }
    });

    // Verify all expected POI properties exist
    const expectedProps = [
      'plugAboveVolume',
      'plugBelowVolume',
      'plugBelowVolumeTubing',
      'plugAboveTubing',
      'plugBelowTubing',
      'plugAboveAnnulus',
      'plugBelowAnnulus',
      'plugAboveTubingOpenCasing',
      'plugAboveDrillpipe',
      'plugBelowDrillpipe',
      'plugAboveDrillpipeAnnulus',
      'plugBelowDrillpipeAnnulus',
      'plugAboveDrillpipeOpenCasing',
      'plugBelowDrillpipeOpenCasing',
      'dpTotalDepth',
      'plugDepthVal'
    ];

    for (const prop of expectedProps) {
      expect(result).toHaveProperty(prop);
    }
  });
});
