import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

describe('Tubing steel displacement with complex well geometry', () => {
  it('reduces total below POI when shoe extends with full well config', () => {
    // Approximate well config from the user's screenshots
    const casings = [
      { role: 'riser', id: 20, od: 20.75, top: 0, depth: 361.5, use: true },
      {
        role: 'intermediate',
        id: 13.5,
        od: 14.375,
        top: 361.5,
        depth: 1719.5,
        use: true
      },
      {
        role: 'production',
        id: 8.681,
        od: 9.625,
        top: 1719.5,
        depth: 3277.5,
        use: true
      },
      {
        role: 'reservoir',
        id: 7,
        od: 7.875,
        top: 3277.5,
        depth: 4020,
        use: true
      }
    ];

    const ucShoe500 = {
      role: 'upper_completion',
      id: 4.892,
      od: 5.5,
      top: 0,
      depth: 500,
      use: true
    };
    const ucShoe1000 = {
      role: 'upper_completion',
      id: 4.892,
      od: 5.5,
      top: 0,
      depth: 1000,
      use: true
    };

    const casingsShoe500 = [...casings, ucShoe500];
    const casingsShoe1000 = [...casings, ucShoe1000];

    const opts = { plugEnabled: true, plugDepthVal: 362 };

    const resShoe500 = computeVolumes(casingsShoe500, opts);
    const resShoe1000 = computeVolumes(casingsShoe1000, opts);

    console.log('Shoe 500m - plugBelowVolume:', resShoe500.plugBelowVolume);
    console.log('Shoe 1000m - plugBelowVolume:', resShoe1000.plugBelowVolume);
    console.log(
      'Difference:',
      resShoe500.plugBelowVolume - resShoe1000.plugBelowVolume
    );

    // The total should be reduced when shoe extends
    expect(resShoe1000.plugBelowVolume).toBeLessThan(
      resShoe500.plugBelowVolume
    );
  });
});
