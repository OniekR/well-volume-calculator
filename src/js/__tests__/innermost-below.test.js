import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

describe('Innermost-only below-tubing calculation', () => {
  it('uses the inner-most casing per segment (does not sum annuli)', () => {
    const casings = [
      // production (outer) covers 2081..3277.5
      {
        role: 'production',
        id: 8.681,
        od: 9.625,
        depth: 3277.5,
        use: true,
        top: 2081
      },
      // reservoir (inner) covers 3200..4065 (smaller ID -> innermost)
      {
        role: 'reservoir',
        id: 6.184,
        od: 7.875,
        depth: 4065,
        use: true,
        top: 3200
      },
      // upper completion (UC) shoe at 3200 (tubing shoe)
      {
        role: 'upper_completion',
        id: 4.892,
        od: 5.5,
        depth: 3200,
        use: true,
        top: 0
      }
    ];

    const result = computeVolumes(casings, {
      plugEnabled: true,
      plugDepthVal: 362,
      surfaceInUse: false,
      intermediateInUse: true,
      drillPipe: { mode: 'tubing', pipes: [] },
      subtractEod: true
    });

    // Expected: only reservoir contributes below tubing shoe (3200..4065)
    const reservoirVolume =
      result.perCasingVolumes.find((c) => c.role === 'reservoir')?.volume || 0;

    expect(result.casingVolumeBelowTubingShoe).toBeCloseTo(reservoirVolume, 6);
    // And production should not additionally contribute in the overlapped zone
    const productionVolume =
      result.perCasingVolumes.find((c) => c.role === 'production')?.volume || 0;
    // Production should not contribute to the below-shoe innermost volume in this scenario
    expect(productionVolume).toBeCloseTo(0, 6);
  });
});
