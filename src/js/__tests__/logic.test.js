import { describe, test, expect } from 'vitest';
import { computeVolumes, computeUpperCompletionBreakdown } from '../logic.js';

describe('computeVolumes', () => {
  test('single casing volume computed correctly', () => {
    const casings = [
      { role: 'production', id: 6.276, top: 0, depth: 100, use: true, od: 7 }
    ];
    const res = computeVolumes(casings, {});
    // area per meter = pi * (id/2 * 0.0254)^2
    const expectedArea = Math.PI * Math.pow((6.276 / 2) * 0.0254, 2);
    const expectedVol = expectedArea * 100;
    expect(res.totalVolume).toBeCloseTo(expectedVol, 8);
    expect(
      res.perCasingVolumes.find((p) => p.role === 'production').volume
    ).toBeCloseTo(expectedVol, 8);
  });

  test('plug splits volumes correctly', () => {
    const casings = [
      { role: 'production', id: 6.276, top: 0, depth: 100, use: true, od: 7 }
    ];
    const res = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 40
    });
    const expectedArea = Math.PI * Math.pow((6.276 / 2) * 0.0254, 2);
    expect(res.plugAboveVolume).toBeCloseTo(expectedArea * 40, 8);
    expect(res.plugBelowVolume).toBeCloseTo(expectedArea * 60, 8);
  });

  test('outer casing volume should not decrease when inner casing deepens', () => {
    // Scenario: Intermediate (outer) and Production (inner) casings overlap
    // When we increase the production casing depth, intermediate volume should not change
    // because the production is INSIDE the intermediate, not replacing it.

    // State 1: Intermediate to 2814, Production to 2814, Reservoir to 4065
    const state1 = [
      {
        role: 'intermediate',
        id: 13.5,
        top: 361.5,
        depth: 2814,
        use: true,
        od: 15.5
      },
      {
        role: 'production',
        id: 9.5,
        top: 2081,
        depth: 2814,
        use: true,
        od: 11.0
      },
      {
        role: 'reservoir',
        id: 7,
        top: 3228.2,
        depth: 4065,
        use: true,
        od: 7.75
      }
    ];
    const res1 = computeVolumes(state1, {});
    const intermediateVol1 = res1.perCasingVolumes.find(
      (p) => p.role === 'intermediate'
    ).volume;

    // State 2: Intermediate to 2814 (UNCHANGED), Production to 3300 (DEEPER)
    // Only production extends beyond intermediate's bottom
    const state2 = [
      {
        role: 'intermediate',
        id: 13.5,
        top: 361.5,
        depth: 2814,
        use: true,
        od: 15.5
      },
      {
        role: 'production',
        id: 9.5,
        top: 2081,
        depth: 3300,
        use: true,
        od: 11.0
      },
      {
        role: 'reservoir',
        id: 7,
        top: 3228.2,
        depth: 4065,
        use: true,
        od: 7.75
      }
    ];
    const res2 = computeVolumes(state2, {});
    const intermediateVol2 = res2.perCasingVolumes.find(
      (p) => p.role === 'intermediate'
    ).volume;

    // Intermediate volume should stay the same (it only goes to 2814, production extending deeper doesn't affect it)
    expect(intermediateVol2).toBeCloseTo(intermediateVol1, 8);
  });

  test('REPORTED BUG: intermediate casing volume decreases when its depth increases', () => {
    // User's reported issue:
    // When increasing intermediate casing shoe from 2814m to 3300m, intermediate volume DECREASES
    // from 122.3 m³ to 120.4 m³, which is counterintuitive.
    //
    // Configuration:
    // - Conductor: 17.5" at 362m
    // - Intermediate: 13 5/8" ID (13.5") at depth 2814m → 3300m
    // - Production: 9 5/8" ID (9.5") at depth 3277.5m
    // - Reservoir: 7" ID (7") at depth 4065m
    //
    // KEY INSIGHT: Production (9.5") is narrower than Intermediate (13.5")
    // When Intermediate extends to 3300m and Production ends at 3277.5m,
    // the segment from 3277.5-3300m should be assigned to Intermediate,
    // but the algorithm might be incorrectly assigning it.

    // State 1: Intermediate at original depth (2814m)
    const state1 = [
      { role: 'conductor', id: 17.5, top: 0, depth: 362, use: true, od: 19 },
      {
        role: 'intermediate',
        id: 13.5,
        top: 362,
        depth: 2814,
        use: true,
        od: 15.5
      },
      {
        role: 'production',
        id: 9.5,
        top: 2100,
        depth: 3277.5,
        use: true,
        od: 11.0
      },
      { role: 'reservoir', id: 7, top: 3220, depth: 4065, use: true, od: 7.75 }
    ];

    const res1 = computeVolumes(state1, {});
    const casings1 = res1.perCasingVolumes;
    const totalVol1 = res1.totalVolume;

    // State 2: Intermediate deepened to 3300m
    // Note: Production (9.5" ID) is narrower than intermediate (13.5" ID)
    // Production depth (3277.5m) is now LESS than intermediate depth (3300m)
    // This creates a segment 3277.5-3300m where Intermediate and Reservoir overlap
    const state2 = [
      { role: 'conductor', id: 17.5, top: 0, depth: 362, use: true, od: 19 },
      {
        role: 'intermediate',
        id: 13.5,
        top: 362,
        depth: 3300,
        use: true,
        od: 15.5
      },
      {
        role: 'production',
        id: 9.5,
        top: 2100,
        depth: 3277.5,
        use: true,
        od: 11.0
      },
      { role: 'reservoir', id: 7, top: 3220, depth: 4065, use: true, od: 7.75 }
    ];

    const res2 = computeVolumes(state2, {});
    const casings2 = res2.perCasingVolumes;
    const totalVol2 = res2.totalVolume;

    // Debug output for analysis
    console.log('\n=== VOLUME CALCULATION BUG ANALYSIS ===');
    console.log('STATE 1 (Intermediate at 2814m):');
    casings1.forEach((c) => {
      console.log(
        `  ${c.role.padEnd(15)}: ${c.volume.toFixed(
          2
        )} m³ (length: ${c.includedLength.toFixed(1)}m)`
      );
    });
    console.log(`  ${'TOTAL'.padEnd(15)}: ${totalVol1.toFixed(2)} m³`);

    console.log('\nSTATE 2 (Intermediate at 3300m):');
    casings2.forEach((c) => {
      console.log(
        `  ${c.role.padEnd(15)}: ${c.volume.toFixed(
          2
        )} m³ (length: ${c.includedLength.toFixed(1)}m)`
      );
    });
    console.log(`  ${'TOTAL'.padEnd(15)}: ${totalVol2.toFixed(2)} m³`);

    // Calculate the change for each casing
    console.log('\n=== VOLUME CHANGES ===');
    casings1.forEach((c1) => {
      const c2 = casings2.find((x) => x.role === c1.role);
      const change = c2.volume - c1.volume;
      const pct = c1.volume > 0 ? (change / c1.volume) * 100 : 0;
      const sign = change >= 0 ? '+' : '';
      const pctSign = pct >= 0 ? '+' : '';
      console.log(
        `  ${c1.role.padEnd(15)}: ${sign}${change.toFixed(
          2
        )} m³ (${pctSign}${pct.toFixed(1)}%)`
      );
    });
    const totalChange = totalVol2 - totalVol1;
    const totalSign = totalChange >= 0 ? '+' : '';
    console.log(
      `  ${'TOTAL'.padEnd(15)}: ${totalSign}${totalChange.toFixed(2)} m³`
    );

    // The segment 3277.5-3300m has both Intermediate and Reservoir
    // Intermediate ID = 13.5", Reservoir ID = 7"
    // Current algorithm sorts by ID ascending, so Reservoir (7" < 13.5") wins
    const segmentLength = 3300 - 3277.5;
    const intermediateArea = Math.PI * Math.pow((13.5 / 2) * 0.0254, 2);
    const reservoirArea = Math.PI * Math.pow((7 / 2) * 0.0254, 2);
    const expectedIntermediateVol = intermediateArea * segmentLength;
    const expectedReservoirVol = reservoirArea * segmentLength;

    console.log(`\n=== SEGMENT 3277.5-3300m ANALYSIS ===`);
    console.log(`Segment length: ${segmentLength}m`);
    console.log(`Covering casings: Intermediate (13.5" ID), Reservoir (7" ID)`);
    console.log(
      `Current algorithm sorts by ID ascending: Reservoir (7") < Intermediate (13.5")`
    );
    console.log(
      `Therefore, Reservoir "wins" and gets the segment volume (innermost casing rule)`
    );
    console.log(
      `Expected Intermediate addition: ${expectedIntermediateVol.toFixed(2)} m³`
    );
    console.log(
      `Expected Reservoir addition:    ${expectedReservoirVol.toFixed(2)} m³`
    );

    // Check what actually happened
    const actualIntermediateChange =
      casings2.find((c) => c.role === 'intermediate').volume -
      casings1.find((c) => c.role === 'intermediate').volume;
    const actualReservoirChange =
      casings2.find((c) => c.role === 'reservoir').volume -
      casings1.find((c) => c.role === 'reservoir').volume;

    console.log(
      `\nActual Intermediate change: ${actualIntermediateChange.toFixed(2)} m³`
    );
    console.log(
      `Actual Reservoir change:    ${actualReservoirChange.toFixed(2)} m³`
    );

    console.log(`\n=== CONCLUSION ===`);
    console.log(
      '✓ Innermost casing rule: Reservoir (7" ID) is innermost and claims overlapping segments'
    );
    console.log(
      '✓ When intermediate extends, it does NOT gain volume in zones where innermost casings (like reservoir) are present'
    );
    console.log(
      '✓ This is the correct behavior: wider outer casings do not claim volume from innermost installations'
    );

    // EXPECTED: When intermediate is extended into a zone where reservoir (innermost) is present,
    // the reservoir should claim the overlapping segment, not intermediate.
    // Innermost casing always claims volume in overlapping zones.
    expect(casings2.find((c) => c.role === 'intermediate').volume).toBeCloseTo(
      casings1.find((c) => c.role === 'intermediate').volume,
      1
    );
    // Reservoir should keep its volume (not gain or lose from intermediate extension)
    expect(casings2.find((c) => c.role === 'reservoir').volume).toBeCloseTo(
      casings1.find((c) => c.role === 'reservoir').volume,
      1
    );
  });
});

describe('computeUpperCompletionBreakdown', () => {
  test('returns not used when upper completion is disabled', () => {
    const casings = [
      {
        role: 'upper_completion',
        id: 4.892,
        od: 5.5,
        top: 100,
        depth: 500,
        use: false
      }
    ];
    const res = computeUpperCompletionBreakdown(casings);
    expect(res.used).toBe(false);
    expect(res.sections).toEqual([]);
  });

  test('calculates UC ID volume and annulus volume correctly', () => {
    const casings = [
      { role: 'production', id: 8.5, od: 9.625, top: 0, depth: 500, use: true },
      {
        role: 'upper_completion',
        id: 4.892,
        od: 5.5,
        top: 100,
        depth: 300,
        use: true
      }
    ];
    const res = computeUpperCompletionBreakdown(casings);
    expect(res.used).toBe(true);
    // Entire UC range is contained by the single production casing -> one merged section
    expect(res.sections.length).toBe(1);

    // UC ID volume
    const ucIdArea = Math.PI * Math.pow((4.892 / 2) * 0.0254, 2);
    const expectedUcIdVol = ucIdArea * 200; // 300 - 100 = 200m
    expect(res.ucIdVolume).toBeCloseTo(expectedUcIdVol, 4);

    // Annulus volume = (production ID area - UC OD area) * length
    const prodIdArea = Math.PI * Math.pow((8.5 / 2) * 0.0254, 2);
    const ucOdArea = Math.PI * Math.pow((5.5 / 2) * 0.0254, 2);
    const expectedAnnulusVol = (prodIdArea - ucOdArea) * 200;
    expect(res.annulusVolume).toBeCloseTo(expectedAnnulusVol, 4);
  });

  test('handles multiple casing sections in UC range', () => {
    const casings = [
      {
        role: 'intermediate',
        id: 9.5,
        od: 10.75,
        top: 0,
        depth: 200,
        use: true
      },
      {
        role: 'production',
        id: 8.5,
        od: 9.625,
        top: 200,
        depth: 400,
        use: true
      },
      {
        role: 'upper_completion',
        id: 4.892,
        od: 5.5,
        top: 100,
        depth: 350,
        use: true
      }
    ];
    const res = computeUpperCompletionBreakdown(casings);
    expect(res.used).toBe(true);
    // UC crosses intermediate and production casings -> expect two merged sections
    expect(res.sections.length).toBe(2);
    expect(res.ucIdLength).toBeCloseTo(250, 6); // 350 - 100 = 250
  });
});
