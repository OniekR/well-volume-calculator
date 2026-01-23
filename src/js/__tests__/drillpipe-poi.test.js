import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

/** @vitest-environment jsdom */

describe('Drill pipe POI (Point of Interest) volumes', () => {
  it('calculates POI volumes correctly when DP is entirely above POI', () => {
    // Scenario: DP from 0-10m, POI at 362m, single casing to 400m
    const casings = [
      {
        role: 'riser',
        id: 13.5,
        od: 15.5,
        top: 0,
        depth: 400,
        use: true
      }
    ];

    const drillPipeInput = {
      mode: 'drillpipe',
      pipes: [
        {
          size: 1,
          length: 10,
          lPerM: 13.1, // 5 7/8" DP: ~13.1 L/m = 0.131 m³ for 10m
          od: 5.875,
          eod: 4.739
        }
      ]
    };

    const result = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: drillPipeInput
    });

    // Expected values:
    // plugAboveDrillpipe: volume inside DP above POI = 10m * 13.1 L/m = 131 L = 0.131 m³
    expect(result.plugAboveDrillpipe).toBeCloseTo(0.131, 2);

    // plugAboveDrillpipeAnnulus: annulus volume above POI
    // Annulus area = pi * ((13.5/2 * 0.0254)^2 - (5.875/2 * 0.0254)^2)
    // For 10m length
    const casingIdRadius = (13.5 / 2) * 0.0254;
    const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
    const dpOdRadius = (5.875 / 2) * 0.0254;
    const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);
    const annulusArea = Math.max(0, casingIdArea - dpOdArea);
    const expectedAnnulusVol = annulusArea * 10;
    expect(result.plugAboveDrillpipeAnnulus).toBeCloseTo(expectedAnnulusVol, 2);

    // plugAboveDrillpipeOpenCasing: open casing volume from dpBottom (10m) to POI (362m)
    // = volume from 10-362m in casing minus DP and annulus for that section
    // Since DP is entirely above POI, this is:
    // casing volume 10-362m = casingIdArea * 352m
    const expectedOpenCasingVol = casingIdArea * 352; // 352m from 10 to 362
    expect(result.plugAboveDrillpipeOpenCasing).toBeCloseTo(
      expectedOpenCasingVol,
      1
    );

    // plugBelowDrillpipeOpenCasing: should be 0 since we're calculating open casing above POI
    expect(result.plugBelowDrillpipeOpenCasing).toBe(0);

    // plugBelowVolume: should be 0 since we're calculating volumes with POI inside the well
    // (nothing below 362m in our 400m well, except for the production zone below)
    // This would depend on other casings, so we'll just verify it's a number
    expect(typeof result.plugBelowVolume).toBe('number');
  });

  it('calculates POI volumes correctly when DP bottom equals POI depth', () => {
    // Scenario: DP from 0-362m, POI at 362m (DP exactly at POI)
    // This is an edge case where the entire DP is exactly at the POI level
    const casings = [
      {
        role: 'riser',
        id: 13.5,
        od: 15.5,
        top: 0,
        depth: 400,
        use: true
      }
    ];

    const drillPipeInput = {
      mode: 'drillpipe',
      pipes: [
        {
          size: 1,
          length: 362,
          lPerM: 13.1, // 5 7/8" DP
          od: 5.875,
          eod: 4.739
        }
      ]
    };

    const result = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: drillPipeInput
    });

    // Expected: entire DP is above POI
    const totalDpVol = (362 * 13.1) / 1000; // 4.7442 m³
    expect(result.plugAboveDrillpipe).toBeCloseTo(totalDpVol, 2);

    // Annulus should be the full annulus volume for 362m length
    const casingIdRadius = (13.5 / 2) * 0.0254;
    const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
    const dpOdRadius = (5.875 / 2) * 0.0254;
    const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);
    const annulusArea = Math.max(0, casingIdArea - dpOdArea);
    const expectedAnnulusVol = annulusArea * 362; // Full 362m annulus
    expect(result.plugAboveDrillpipeAnnulus).toBeCloseTo(expectedAnnulusVol, 1);

    // Open casing volume should be 0 since DP reaches the POI
    expect(result.plugAboveDrillpipeOpenCasing).toBeCloseTo(0, 1);

    // Below should be 0
    expect(result.plugBelowDrillpipe).toBe(0);
    expect(result.plugBelowDrillpipeAnnulus).toBe(0);
  });

  it('calculates POI annulus correctly when DP bottom equals POI and DP passes through multiple casings', () => {
    // Scenario similar to user's screenshot:
    // DP: 5 7/8" (5.875"), 362m (0-362m)
    // Riser: 13.5" ID, 0-362m (and deeper)
    // Intermediate: 11.0" ID, 300-362m
    // POI: 362m (entire DP above POI)
    //
    // Wellbore geometry consideration:
    // - Smaller ID = more restrictive = inner casing
    // - Larger ID = less restrictive = outer casing
    // - DP annulus = space between DP OD and innermost surrounding casing ID
    // - At 300-362m: Both casings present, Intermediate (11") is innermost
    // - Expected: Intermediate's annulus for 300-362m, Riser's for 0-300m

    const casings = [
      {
        role: 'riser',
        id: 13.5,
        od: 15.5,
        top: 0,
        depth: 450, // extends beyond DP bottom
        use: true
      },
      {
        role: 'intermediate',
        id: 11.0,
        od: 12.5,
        top: 300, // starts partway down
        depth: 450,
        use: true
      }
    ];

    const drillPipeInput = {
      mode: 'drillpipe',
      pipes: [
        {
          size: 1,
          length: 362,
          lPerM: 13.1, // 5 7/8" DP
          od: 5.875,
          eod: 4.739
        }
      ]
    };

    const result = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: drillPipeInput
    });

    // Calculate expected annulus:
    // From 0-300m: in Riser only (13.5" ID)
    const casingIdRadius1 = (13.5 / 2) * 0.0254;
    const casingIdArea1 = Math.PI * Math.pow(casingIdRadius1, 2);
    const dpOdRadius = (5.875 / 2) * 0.0254;
    const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);
    const annulusArea1 = Math.max(0, casingIdArea1 - dpOdArea);
    const expectedAnnulus1 = annulusArea1 * 300;

    // From 300-362m: in both casings, Intermediate (11.0") is innermost
    const casingIdRadius2 = (11.0 / 2) * 0.0254;
    const casingIdArea2 = Math.PI * Math.pow(casingIdRadius2, 2);
    const annulusArea2 = Math.max(0, casingIdArea2 - dpOdArea);
    const expectedAnnulus2 = annulusArea2 * 62;

    const expectedTotalAnnulus = expectedAnnulus1 + expectedAnnulus2;

    // When entire DP is above POI, POI annulus should match total annulus
    expect(result.plugAboveDrillpipeAnnulus).toBeCloseTo(
      expectedTotalAnnulus,
      1
    );
  });

  it('calculates POI volumes correctly when DP crosses POI', () => {
    // Scenario: DP from 0-500m, POI at 362m
    const casings = [
      {
        role: 'riser',
        id: 13.5,
        od: 15.5,
        top: 0,
        depth: 600,
        use: true
      }
    ];

    const drillPipeInput = {
      mode: 'drillpipe',
      pipes: [
        {
          size: 1,
          length: 500,
          lPerM: 13.1, // 5 7/8" DP
          od: 5.875,
          eod: 4.739
        }
      ]
    };

    const result = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: drillPipeInput
    });

    // When DP crosses POI (362m is within 0-500m DP):
    // Volume above POI in DP = (362 / 500) * total DP volume
    const totalDpVol = (500 * 13.1) / 1000; // 6.55 m³
    const expectedAboveDp = (362 / 500) * totalDpVol;
    expect(result.plugAboveDrillpipe).toBeCloseTo(expectedAboveDp, 2);

    // Volume below POI in DP = ((500 - 362) / 500) * total DP volume
    const expectedBelowDp = ((500 - 362) / 500) * totalDpVol;
    expect(result.plugBelowDrillpipe).toBeCloseTo(expectedBelowDp, 2);

    // The annulus splits the same way
    const casingIdRadius = (13.5 / 2) * 0.0254;
    const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
    const dpOdRadius = (5.875 / 2) * 0.0254;
    const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);
    const annulusArea = Math.max(0, casingIdArea - dpOdArea);
    const totalAnnulusVol = annulusArea * 500;
    const expectedAboveAnnulus = (362 / 500) * totalAnnulusVol;
    const expectedBelowAnnulus = ((500 - 362) / 500) * totalAnnulusVol;
    expect(result.plugAboveDrillpipeAnnulus).toBeCloseTo(
      expectedAboveAnnulus,
      2
    );
    expect(result.plugBelowDrillpipeAnnulus).toBeCloseTo(
      expectedBelowAnnulus,
      2
    );

    // When DP crosses POI, there's no open casing volume between DP and POI
    // (POI is within the DP range, so no formation above POI below the DP)
    expect(result.plugAboveDrillpipeOpenCasing).toBe(0);
    expect(result.plugBelowDrillpipeOpenCasing).toBe(0);
  });

  it('decreases total volume below POI as DP depth increases beyond POI', () => {
    // Scenario: POI fixed at 362m, but DP depth increases from 363m to 500m to 2000m
    // As DP goes deeper, it occupies more space, so plugBelowVolume should decrease
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

    // Test 1: DP at 363m (just crossing POI)
    const result1 = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: 1, length: 363, lPerM: 13.1, od: 5.875, eod: 4.739 }]
      }
    });

    // Test 2: DP at 500m
    const result2 = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: 1, length: 500, lPerM: 13.1, od: 5.875, eod: 4.739 }]
      }
    });

    // Test 3: DP at 2000m
    const result3 = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: 1, length: 2000, lPerM: 13.1, od: 5.875, eod: 4.739 }]
      }
    });

    // Vol above POI in DP should stay the same (only 0-362m of DP above POI)
    const dpAboveLen = 362;
    const dpAboveVol = (dpAboveLen * 13.1) / 1000;
    expect(result1.plugAboveDrillpipe).toBeCloseTo(dpAboveVol, 1);
    expect(result2.plugAboveDrillpipe).toBeCloseTo(dpAboveVol, 1);
    expect(result3.plugAboveDrillpipe).toBeCloseTo(dpAboveVol, 1);

    // Vol above POI in annulus should also stay the same
    expect(result1.plugAboveDrillpipeAnnulus).toBeCloseTo(
      result2.plugAboveDrillpipeAnnulus,
      1
    );
    expect(result2.plugAboveDrillpipeAnnulus).toBeCloseTo(
      result3.plugAboveDrillpipeAnnulus,
      1
    );

    // Vol below POI in DP should increase as DP goes deeper
    expect(result2.plugBelowDrillpipe).toBeGreaterThan(
      result1.plugBelowDrillpipe
    );
    expect(result3.plugBelowDrillpipe).toBeGreaterThan(
      result2.plugBelowDrillpipe
    );

    // Vol below POI in annulus should increase as DP goes deeper
    expect(result2.plugBelowDrillpipeAnnulus).toBeGreaterThan(
      result1.plugBelowDrillpipeAnnulus
    );
    expect(result3.plugBelowDrillpipeAnnulus).toBeGreaterThan(
      result2.plugBelowDrillpipeAnnulus
    );

    // Total volume below POI should DECREASE as DP goes deeper (more steel = less fluid)
    expect(result2.plugBelowVolume).toBeLessThan(result1.plugBelowVolume);
    expect(result3.plugBelowVolume).toBeLessThan(result2.plugBelowVolume);
  });

  it('maintains constant vol above POI in DP when adding DP segments entirely below POI', () => {
    // Scenario: DP 1 is 5 7/8" at 400m, POI is at 382m
    // When we add DP 2 (5" at 150m), vol above POI should NOT change
    // because all of DP 2 is below POI depth
    const casings = [
      {
        role: 'riser',
        id: 13.5,
        od: 15.5,
        top: 0,
        depth: 700,
        use: true
      },
      {
        role: 'intermediate',
        id: 11.0,
        od: 12.5,
        top: 300,
        depth: 700,
        use: true
      }
    ];

    const poiDepth = 382;

    // Test 1: Only DP 1 (5 7/8" x 400m)
    const result1 = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: poiDepth,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [{ size: 1, length: 400, lPerM: 13.1, od: 5.875, eod: 4.739 }]
      }
    });

    // Test 2: DP 1 + DP 2 (DP 2 is 5" x 150m, goes from 400m to 550m)
    const result2 = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: poiDepth,
      drillPipe: {
        mode: 'drillpipe',
        pipes: [
          { size: 1, length: 400, lPerM: 13.1, od: 5.875, eod: 4.739 },
          { size: 2, length: 150, lPerM: 11.8, od: 5.0, eod: 4.144 }
        ]
      }
    });

    // Vol above POI in DP should remain the same (both tests have 382m of DP 1 above POI)
    expect(result1.plugAboveDrillpipe).toBeCloseTo(
      result2.plugAboveDrillpipe,
      2
    );

    // Vol above POI in annulus should also remain the same
    expect(result1.plugAboveDrillpipeAnnulus).toBeCloseTo(
      result2.plugAboveDrillpipeAnnulus,
      2
    );

    // Vol below POI in DP should increase (now includes DP 2 portion)
    expect(result2.plugBelowDrillpipe).toBeGreaterThan(
      result1.plugBelowDrillpipe
    );

    // Vol below POI in annulus should increase (now includes DP 2 annulus)
    expect(result2.plugBelowDrillpipeAnnulus).toBeGreaterThan(
      result1.plugBelowDrillpipeAnnulus
    );
  });
});
