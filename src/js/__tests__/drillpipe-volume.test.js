import { describe, it, expect } from 'vitest';
import { computeDrillPipeBreakdown } from '../drillpipe.js';

/** @vitest-environment jsdom */

describe('Drill pipe volume calculations', () => {
  it('uses specified liters per meter for DP sizes', () => {
    const pipes = [
      { size: 1, length: 10 }, // 4" -> lPerM 5.396
      { size: 2, length: 20 }, // 5" -> lPerM 9.021
      { size: 3, length: 30 } // 5 7/8" -> lPerM 13.135
    ];

    // Provide casing spanning entire DP length
    const casings = [{ role: 'riser', id: 8.0, use: true, top: 0, depth: 60 }];

    const res = computeDrillPipeBreakdown(pipes, casings);
    expect(res.used).toBe(true);

    // Verify DP volumes are calculated for each size segment
    // Size 1 (4", 10m): 5.396 L/m = 0.0539 m³
    // Size 2 (5", 20m): 9.021 L/m = 0.18042 m³
    // Size 3 (5 7/8", 30m): 13.135 L/m = 0.39405 m³
    const expectedTotal = 0.0539 + 0.18042 + 0.39405; // ~0.628 m³

    expect(res.dpIdVolume).toBeCloseTo(expectedTotal, 3);
    expect(res.dpIdLength).toBe(60);

    // Each pipe size should have its own section if spanning different casings
    // But in this test all are in the same casing, so just one section
    expect(res.sections).toHaveLength(1);
    expect(res.sections[0].dpLPerM).toBeCloseTo(
      (res.dpIdVolume / 60) * 1000,
      2
    );
  });
});
