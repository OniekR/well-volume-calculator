import { describe, it, expect } from 'vitest';
import { gatherInputs } from '../inputs.js';
import { computeVolumes } from '../logic.js';
import { setupSizeIdInputs } from '../ui.js';

/** @vitest-environment jsdom */

describe('Upper completion integration', () => {
  it('gathers upper completion inputs and includes it in computeVolumes and drawing z-order', () => {
    document.body.innerHTML = `
      <form id="well-form">
        <div class="input-inline">
          <select id="upper_completion_size"><option value="4.892">5 1/2" 17#</option></select>
          <input id="upper_completion_size_id" value="4.892" />
          <div class="small-note"></div>
        </div>
        <input id="depth_uc_top" value="0" />
        <input id="depth_uc" value="100" />
        <input id="use_upper_completion" type="checkbox" checked />
      </form>
    `;

    // initialize UI helpers to populate the small-note
    setupSizeIdInputs({ scheduleSave: () => {}, calculateVolume: () => {} });
    const { casingsInput } = gatherInputs();
    const uc = casingsInput.find((c) => c.role === 'upper_completion');
    expect(uc).toBeTruthy();
    expect(uc.id).toBeCloseTo(4.892, 6);
    expect(uc.od).toBe(5.5);

    // small-note displays TJ (prefixed)
    const smallNote = document.querySelector('.small-note');
    expect(smallNote).toBeTruthy();
    expect(smallNote.textContent.trim()).toBe('TJ: ' + String(6.098));

    const res = computeVolumes(casingsInput, {});
    const draw = res.casingsToDraw.find((d) => d.role === 'upper_completion');
    expect(draw).toBeTruthy();
    expect(draw.z).toBeGreaterThan(5); // ensure it's on top z-wise
  });
});
