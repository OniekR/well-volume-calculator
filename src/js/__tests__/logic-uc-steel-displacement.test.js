import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

describe('Tubing (UC) steel displacement below POI', () => {
  it('reduces total below POI when casing shoe extends deeper (steel displacement)', () => {
    const production = {
      role: 'production',
      id: 20,
      od: 22,
      top: 0,
      depth: 1000,
      use: true
    };

    const ucShort = {
      role: 'upper_completion',
      id: 4.892,
      od: 5.5,
      top: 0,
      depth: 434,
      use: true
    };
    const ucLong = {
      role: 'upper_completion',
      id: 4.892,
      od: 5.5,
      top: 0,
      depth: 600,
      use: true
    };

    const casingsShort = [production, ucShort];
    const casingsLong = [production, ucLong];

    const opts = { plugEnabled: true, plugDepthVal: 362 };

    const resShort = computeVolumes(casingsShort, opts);
    const resLong = computeVolumes(casingsLong, opts);

    // Expect the total below POI to be reduced when tubing shoe increases
    expect(resLong.plugBelowVolume).toBeLessThan(resShort.plugBelowVolume);

    // Expected reduction should be at least the tubing steel area * additional length
    const ucOdRadius = (ucShort.od / 2) * 0.0254;
    const ucIdArea = Math.PI * Math.pow((ucShort.id / 2) * 0.0254, 2);
    const ucOdArea = Math.PI * Math.pow(ucOdRadius, 2);
    const steelArea = Math.max(0, ucOdArea - ucIdArea);

    const deltaLength = ucLong.depth - ucShort.depth; // 600 - 434
    const expectedReduction = steelArea * deltaLength;

    const actualReduction = resShort.plugBelowVolume - resLong.plugBelowVolume;

    // The total below-POI should reduce by at least the steel displacement; allow small tolerance
    expect(actualReduction).toBeGreaterThanOrEqual(expectedReduction - 1e-6);
  });
});
