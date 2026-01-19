import { describe, it, expect } from 'vitest';
import {
  validateUpperCompletionFit,
  getUpperCompletionTJ
} from '../validation.js';

/** @vitest-environment jsdom */

describe('validateUpperCompletionFit', () => {
  it('returns empty array when no upper completion present', () => {
    const casings = [];
    expect(validateUpperCompletionFit(casings)).toEqual([]);
  });

  it('detects failure when TJ larger than casing drift', () => {
    const casings = [
      { role: 'upper_completion', id: 4.892, top: 10, depth: 50, use: true },
      {
        role: 'production',
        id: 8.535,
        top: 0,
        depth: 200,
        use: true,
        drift: 6.0
      }
    ];
    const failures = validateUpperCompletionFit(casings);
    expect(failures.length).toBeGreaterThan(0);
    expect(failures[0].role).toBe('production');
    expect(failures[0].tj).toBeCloseTo(getUpperCompletionTJ(4.892));
  });

  it('returns empty array when drift >= TJ', () => {
    const casings = [
      { role: 'upper_completion', id: 4.892, top: 10, depth: 50, use: true },
      {
        role: 'production',
        id: 8.535,
        top: 0,
        depth: 200,
        use: true,
        drift: 7.0
      }
    ];
    expect(validateUpperCompletionFit(casings)).toEqual([]);
  });
});
