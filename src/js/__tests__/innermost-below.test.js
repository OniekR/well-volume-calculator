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
    // Compute production contribution below the tubing shoe explicitly
    const belowTubingStart = 3200;
    const belowTubingEnd = Math.max(...casings.map((c) => c.depth || 0));
    const btPointsSet = new Set([belowTubingStart, belowTubingEnd]);
    casings.forEach((c) => {
      const topVal = typeof c.top !== 'undefined' ? c.top : 0;
      if (topVal > belowTubingStart && topVal < belowTubingEnd)
        btPointsSet.add(topVal);
      if (c.depth > belowTubingStart && c.depth < belowTubingEnd)
        btPointsSet.add(c.depth);
    });
    const btPoints = Array.from(btPointsSet).sort((a, b) => a - b);

    let productionBelow = 0;
    for (let i = 0; i < btPoints.length - 1; i++) {
      const segStart = btPoints[i];
      const segEnd = btPoints[i + 1];
      const segLen = segEnd - segStart;
      if (segLen <= 0) continue;

      const covering = casings
        .filter((c) => {
          if (!c.use) return false;
          if (c.role === 'upper_completion') return false;
          if (c.depth <= segStart) return false;
          const topVal = typeof c.top !== 'undefined' ? c.top : 0;
          if (topVal >= segEnd) return false;
          return true;
        })
        .sort((a, b) => {
          const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
          const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);

          const mainWellboreRoles = [
            'conductor',
            'surface',
            'intermediate',
            'production',
            'tieback'
          ];
          const aIsMain = mainWellboreRoles.includes(a.role);
          const bIsMain = mainWellboreRoles.includes(b.role);

          if (aIsMain && !bIsMain) {
            const aiNum = isNaN(Number(a.id)) ? Infinity : Number(a.id);
            const biNum = isNaN(Number(b.id)) ? Infinity : Number(b.id);
            if (biNum < aiNum) return 1;
            return -1;
          }
          if (!aIsMain && bIsMain) {
            const aiNum = isNaN(Number(a.id)) ? Infinity : Number(a.id);
            const biNum = isNaN(Number(b.id)) ? Infinity : Number(b.id);
            if (aiNum < biNum) return -1;
            return 1;
          }

          return ai - bi;
        });

      if (!covering || covering.length === 0) continue;

      const owner = covering[0];
      if (owner.role === 'production' && owner.id) {
        const area = Math.PI * Math.pow((owner.id / 2) * 0.0254, 2);
        productionBelow += area * segLen;
      }
    }

    // Production should not contribute to the below-shoe innermost volume in this scenario
    expect(productionBelow).toBeCloseTo(0, 6);
  });
});
