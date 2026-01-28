import { describe, it, expect, beforeEach } from 'vitest';
import { gatherInputs } from '../inputs.js';

describe('Input parsing', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="depth_7" value="3277,5">
      <input id="use_7" type="checkbox" checked>
      <input id="depth_5" value="4065">
      <input id="use_5" type="checkbox" checked>
      <input id="depth_uc" value="3228,2">
      <input id="use_upper_completion" type="checkbox" checked>
    `;
  });

  it('parses comma decimals and returns numeric depths', () => {
    const inputs = gatherInputs();
    const prod = inputs.casingsInput.find((c) => c.role === 'production');
    const res = inputs.casingsInput.find((c) => c.role === 'reservoir');
    const uc = inputs.casingsInput.find((c) => c.role === 'upper_completion');

    expect(prod.depth).toBeCloseTo(3277.5, 6);
    expect(res.depth).toBeCloseTo(4065, 6);
    expect(uc.depth).toBeCloseTo(3228.2, 6);
  });
});
