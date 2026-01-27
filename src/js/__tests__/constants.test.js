import { describe, it, expect } from 'vitest';
import { OD, TJ, SIZE_LABELS } from '../constants.js';

describe('size constants', () => {
  it('4 1/2" 12.6# L-80 (nom 3.958) has expected OD and TJ in small_liner and upper_completion', () => {
    // Access by numeric key - object keys are coerced to strings when read
    expect(OD.small_liner[3.958]).toBeCloseTo(4.5, 6);
    expect(TJ.small_liner[3.958]).toBeCloseTo(4.967, 6);
    // Also available as an upper_completion option
    expect(OD.upper_completion[3.958]).toBeCloseTo(4.5, 6);
    expect(TJ.upper_completion[3.958]).toBeCloseTo(4.967, 6);
  });

  it('size label is available for dropdown in both categories', () => {
    expect(SIZE_LABELS.small_liner[3.958]).toBe('4 1/2" 12.6# L-80');
    expect(SIZE_LABELS.upper_completion[3.958]).toBe('4 1/2" 12.6# L-80');
  });
});
