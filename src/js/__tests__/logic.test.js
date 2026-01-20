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
