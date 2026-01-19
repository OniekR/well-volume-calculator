import { describe, test, expect } from 'vitest';
import { computeVolumes } from '../logic.js';

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
});
