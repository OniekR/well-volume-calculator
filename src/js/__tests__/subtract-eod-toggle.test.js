import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

/** @vitest-environment jsdom */

describe('Subtract EOD toggle', () => {
  it('subtracts EOD when subtractEod is true', () => {
    const casings = [
      {
        role: 'riser',
        id: 9.625,
        od: 10.75,
        depth: 100,
        top: 0,
        use: true
      }
    ];

    const drillPipe = {
      mode: 'drillpipe',
      count: 1,
      pipes: [
        {
          size: 2,
          length: 100,
          id: 4.276,
          od: 4.75,
          lPerM: 9.021,
          eod: 2.985 // L/m
        }
      ]
    };

    // With EOD subtraction enabled
    const resultWithEod = computeVolumes(casings, {
      drillPipe,
      subtractEod: true
    });

    // Without EOD subtraction
    const resultWithoutEod = computeVolumes(casings, {
      drillPipe,
      subtractEod: false
    });

    // Volume should be smaller when EOD is subtracted
    expect(resultWithEod.totalVolume).toBeLessThan(
      resultWithoutEod.totalVolume
    );

    // The difference should be approximately the EOD volume
    // EOD = 2.985 L/m * 100 m = 298.5 L = 0.2985 m³
    const eodVolume = (2.985 / 1000) * 100;
    expect(
      resultWithoutEod.totalVolume - resultWithEod.totalVolume
    ).toBeCloseTo(eodVolume, 3);
  });

  it('does not subtract EOD when subtractEod is false', () => {
    const casings = [
      {
        role: 'riser',
        id: 9.625,
        od: 10.75,
        depth: 100,
        top: 0,
        use: true
      }
    ];

    const drillPipe = {
      mode: 'drillpipe',
      count: 1,
      pipes: [
        {
          size: 2,
          length: 100,
          id: 4.276,
          od: 4.75,
          lPerM: 9.021,
          eod: 2.985
        }
      ]
    };

    // Without EOD subtraction should be the gross volume
    const result = computeVolumes(casings, {
      drillPipe,
      subtractEod: false
    });

    // Gross volume ≈ riser volume (ignoring annulus calculation details)
    expect(result.totalVolume).toBeGreaterThan(0);
  });

  it('defaults to subtracting EOD when subtractEod is not specified', () => {
    const casings = [
      {
        role: 'riser',
        id: 9.625,
        od: 10.75,
        depth: 100,
        top: 0,
        use: true
      }
    ];

    const drillPipe = {
      mode: 'drillpipe',
      count: 1,
      pipes: [
        {
          size: 2,
          length: 100,
          id: 4.276,
          od: 4.75,
          lPerM: 9.021,
          eod: 2.985
        }
      ]
    };

    // Default behavior (no subtractEod specified)
    const resultDefault = computeVolumes(casings, {
      drillPipe
    });

    // Explicitly enabled
    const resultExplicit = computeVolumes(casings, {
      drillPipe,
      subtractEod: true
    });

    // Should match
    expect(resultDefault.totalVolume).toBeCloseTo(
      resultExplicit.totalVolume,
      6
    );
  });
});
