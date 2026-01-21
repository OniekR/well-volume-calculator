import { describe, it, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

/** @vitest-environment jsdom */

describe('Compute volumes with drill pipe open-ended displacement', () => {
  it('subtracts EOD from the covering casing volume', () => {
    const casingsInput = [
      { role: 'production', id: 8.535, od: 9.66, top: 0, depth: 100, use: true }
    ];

    const dpInput = {
      mode: 'drillpipe',
      count: 1,
      pipes: [{ size: 1, length: 10, eod: 2.985 }]
    };

    const without = computeVolumes(casingsInput, {});
    const withDp = computeVolumes(casingsInput, { drillPipe: dpInput });

    const prodWithout = without.perCasingVolumes.find(
      (p) => p.role === 'production'
    );
    const prodWith = withDp.perCasingVolumes.find(
      (p) => p.role === 'production'
    );

    const expectedSubtract = (2.985 / 1000) * 10; // m3

    expect(prodWith.volume).toBeCloseTo(
      prodWithout.volume - expectedSubtract,
      6
    );
  });
});
