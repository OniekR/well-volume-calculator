import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

/** @vitest-environment jsdom */

describe('POI tubing volumes', () => {
  it('calculates tubing POI volumes when UC is active', () => {
    const casingsInput = [
      {
        role: 'riser',
        use: true,
        id: 20,
        od: 20.75,
        depth: 400,
        top: 0
      },
      {
        role: 'upper_completion',
        use: true,
        id: 4.892,
        od: 5.5,
        depth: 2000,
        top: 100
      }
    ];

    const result = computeVolumes(casingsInput, {
      plugEnabled: true,
      plugDepthVal: 500, // POI at 500m
      surfaceInUse: false,
      intermediateInUse: false
    });

    // With UC active from 100-2000m and POI at 500m:
    // - UC ID area = π * (4.892/2 * 0.0254)^2 ≈ 0.0167 m²
    // - Tubing volume from 100-500m (above POI) = 0.0167 * 400 ≈ 6.68 m³
    // - Tubing volume from 500-2000m (below POI) = 0.0167 * 1500 ≈ 25.05 m³

    console.log('plugAboveTubing:', result.plugAboveTubing);
    console.log('plugBelowTubing:', result.plugBelowTubing);
    console.log('Result:', result);

    expect(typeof result.plugAboveTubing).toBe('number');
    expect(typeof result.plugBelowTubing).toBe('number');
    expect(result.plugAboveTubing).toBeGreaterThan(0);
    expect(result.plugBelowTubing).toBeGreaterThan(0);
  });
});
