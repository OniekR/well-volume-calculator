import { describe, it, expect } from 'vitest';
import { DRILLPIPE_CATALOG, renderDrillPipeInputs } from '../drillpipe.js';

/** @vitest-environment jsdom */

describe('Drill pipe catalog and UI', () => {
  it('contains a 5" drill pipe option', () => {
    const found = DRILLPIPE_CATALOG.find((p) => p.name === '5"');
    expect(found).toBeTruthy();
    expect(found.id).toBeCloseTo(4.276, 6);
    expect(found.od).toBeCloseTo(5.0, 6);
  });

  it('renders drill pipe size options including 5"', () => {
    document.body.innerHTML = '<div id="drillpipe_inputs_container"></div>';
    renderDrillPipeInputs(1);
    const select = document.querySelector('#drillpipe_size_0');
    expect(select).toBeTruthy();
    const opt = Array.from(select.options).find((o) => o.text === '5"');
    expect(opt).toBeTruthy();
  });
});
