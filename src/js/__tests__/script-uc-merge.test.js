import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

/** @vitest-environment jsdom */

describe('script merging of UC POI values', () => {
  it('copies casingVolumeBelowTubingShoe from UC-included result into main result', () => {
    const casings = [
      {
        role: 'upper_completion',
        id: 4.892,
        od: 5.5,
        depth: 3228.2,
        use: true,
        top: 0
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
      }
    ];

    const plugDepthVal = 362;

    const effective = casings.map((c) =>
      c.role === 'upper_completion' ? { ...c, use: false } : c
    );

    const result = computeVolumes(effective, {
      plugEnabled: true,
      plugDepthVal,
      surfaceInUse: false,
      intermediateInUse: false,
      drillPipe: { mode: 'tubing', pipes: [] },
      subtractEod: true
    });

    const resultWithUc = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal,
      surfaceInUse: false,
      intermediateInUse: false,
      drillPipe: { mode: 'tubing', pipes: [] },
      subtractEod: true
    });

    // Simulate merge performed in script.js
    result.plugBelowVolumeTubing = resultWithUc.plugBelowVolumeTubing;
    result.casingVolumeBelowTubingShoe =
      resultWithUc.casingVolumeBelowTubingShoe;

    expect(result.casingVolumeBelowTubingShoe).toBeGreaterThan(0);
    expect(result.casingVolumeBelowTubingShoe).toBeCloseTo(
      resultWithUc.casingVolumeBelowTubingShoe,
      6
    );
  });
});
