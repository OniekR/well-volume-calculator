import { describe, it, expect } from 'vitest';
import { computeDrillPipeBreakdown } from '../drillpipe.js';

/** @vitest-environment jsdom */

describe('Drill pipe spanning multiple casings', () => {
  it('splits annulus volume proportionally when DP spans two casings', () => {
    // Casing 1 (Riser): 0-800m, ID 7.725"
    // Casing 2 (Production): 800-3000m, ID 8.535"
    // DP 5 7/8": 0-900m (spans from Riser into Production)
    const casingsInput = [
      { role: 'riser', id: 7.725, od: 9.66, top: 0, depth: 800, use: true },
      {
        role: 'production',
        id: 8.535,
        od: 9.625,
        top: 800,
        depth: 3000,
        use: true
      }
    ];

    const pipes = [
      // DP 5 7/8": 900m (0-800 in Riser, 800-900 in Production)
      { size: 3, length: 900 }
    ];

    const result = computeDrillPipeBreakdown(pipes, casingsInput);

    // New structure: sections are organized by casing, not by pipe size
    // So we should have 2 sections: Riser and Production
    expect(result.sections).toHaveLength(2);

    // Verify Riser section (first 800m of DP)
    const riserSec = result.sections[0];
    expect(riserSec.casing).toBe('riser');
    expect(riserSec.dpLength).toBe(800);

    // Verify Production section (last 100m of DP)
    const prodSec = result.sections[1];
    expect(prodSec.casing).toBe('production');
    expect(prodSec.dpLength).toBe(100);

    // Annulus = geometric space between DP OD and casing ID
    // Annulus area = (casing ID area - DP OD area) × overlap length
    const riserIdRadius = (7.725 / 2) * 0.0254;
    const riserIdArea = Math.PI * Math.pow(riserIdRadius, 2);
    const dpOdRadius = (5.875 / 2) * 0.0254; // 5 7/8" OD
    const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);
    const riserAnnulusArea = riserIdArea - dpOdArea;
    const riserAnnulusVol = riserAnnulusArea * 800;

    const prodIdRadius = (8.535 / 2) * 0.0254;
    const prodIdArea = Math.PI * Math.pow(prodIdRadius, 2);
    const prodAnnulusArea = prodIdArea - dpOdArea;
    const prodAnnulusVol = prodAnnulusArea * 100;

    const expectedAnnulus = riserAnnulusVol + prodAnnulusVol;

    expect(riserSec.annulusVolume).toBeCloseTo(riserAnnulusVol, 6);
    expect(prodSec.annulusVolume).toBeCloseTo(prodAnnulusVol, 6);
    expect(result.annulusVolume).toBeCloseTo(expectedAnnulus, 6);
  });

  it('correctly handles DP that spans three casings', () => {
    const casingsInput = [
      { role: 'riser', id: 7.725, od: 9.66, top: 0, depth: 500, use: true },
      {
        role: 'intermediate',
        id: 8.535,
        od: 9.625,
        top: 500,
        depth: 1500,
        use: true
      },
      {
        role: 'production',
        id: 9.063,
        od: 10.125,
        top: 1500,
        depth: 3000,
        use: true
      }
    ];

    const pipes = [
      // DP 5": 1600m total
      // 0-500m in Riser, 500-1500m in Intermediate, 1500-1600m in Production
      { size: 2, length: 1600 }
    ];

    const result = computeDrillPipeBreakdown(pipes, casingsInput);

    // New structure: sections organized by casing
    // Should have 3 sections: Riser (500m), Intermediate (1000m), Production (100m)
    expect(result.sections).toHaveLength(3);

    const riserSec = result.sections[0];
    expect(riserSec.casing).toBe('riser');
    expect(riserSec.dpLength).toBe(500);

    const intSec = result.sections[1];
    expect(intSec.casing).toBe('intermediate');
    expect(intSec.dpLength).toBe(1000);

    const prodSec = result.sections[2];
    expect(prodSec.casing).toBe('production');
    expect(prodSec.dpLength).toBe(100);

    // Annulus = geometric space between DP OD and casing ID
    // Annulus area = (casing ID area - DP OD area) × overlap length
    const dpOdRadius = (5.0 / 2) * 0.0254; // 5" OD
    const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);

    // Riser portion: 500m
    const riserIdRadius = (7.725 / 2) * 0.0254;
    const riserIdArea = Math.PI * Math.pow(riserIdRadius, 2);
    const riserAnnulusArea = riserIdArea - dpOdArea;
    const riserVol = riserAnnulusArea * 500;

    // Intermediate portion: 1000m
    const intIdRadius = (8.535 / 2) * 0.0254;
    const intIdArea = Math.PI * Math.pow(intIdRadius, 2);
    const intAnnulusArea = intIdArea - dpOdArea;
    const intVol = intAnnulusArea * 1000;

    // Production portion: 100m
    const prodIdRadius = (9.063 / 2) * 0.0254;
    const prodIdArea = Math.PI * Math.pow(prodIdRadius, 2);
    const prodAnnulusArea = prodIdArea - dpOdArea;
    const prodVol = prodAnnulusArea * 100;

    const expectedAnnulus = riserVol + intVol + prodVol;

    expect(riserSec.annulusVolume).toBeCloseTo(riserVol, 6);
    expect(intSec.annulusVolume).toBeCloseTo(intVol, 6);
    expect(prodSec.annulusVolume).toBeCloseTo(prodVol, 6);
    expect(result.annulusVolume).toBeCloseTo(expectedAnnulus, 6);
  });
});
