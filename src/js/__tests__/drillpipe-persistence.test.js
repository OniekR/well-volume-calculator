import { describe, test, expect, beforeEach } from 'vitest';
import '../script.js';
import { applyStateObject } from '../state.js';
import { renderDrillPipeInputs } from '../drillpipe.js';

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('drill pipe persistence', () => {
  test('restores drill pipe inputs when state applied and UI renders inputs', async () => {
    // Setup minimal DOM similar to app init
    document.body.innerHTML = `
      <input type="checkbox" id="uc_mode_toggle">
      <select id="drillpipe_count"><option value="1">1</option></select>
      <div id="drillpipe_inputs_container"></div>
    `;

    // Attach listeners that mimic app behavior: render when toggle changed or count changed
    const dpCount = document.getElementById('drillpipe_count');
    const ucToggle = document.getElementById('uc_mode_toggle');
    ucToggle.addEventListener('change', () => {
      const isDP = ucToggle.checked;
      const container = document.getElementById('drillpipe_inputs_container');
      if (isDP) {
        const count = parseInt(dpCount.value, 10) || 1;
        renderDrillPipeInputs(count);
      } else {
        if (container) container.innerHTML = '';
      }
    });

    dpCount.addEventListener('change', () => {
      if (ucToggle.checked) {
        renderDrillPipeInputs(parseInt(dpCount.value, 10) || 1);
      }
    });

    // State that represents saved drill pipe setup
    const state = {
      uc_mode_toggle: { type: 'checkbox', value: true },
      drillpipe_count: { type: 'select', value: '1' },
      drillpipe_size_0: { type: 'select', value: '3' },
      drillpipe_length_0: { type: 'input', value: '150' }
    };

    // Apply state; this should render inputs and then our code in applyStateObject
    // will populate the newly created drill pipe inputs
    applyStateObject(state, { calculateVolume: () => {}, scheduleSave: () => {} });

    // The restoration runs asynchronously (setTimeout(0)) to ensure inputs are
    // present after rendering; wait a tick before asserting.
    await new Promise((r) => setTimeout(r, 10));

    const size0 = document.getElementById('drillpipe_size_0');
    const len0 = document.getElementById('drillpipe_length_0');

    expect(size0).toBeTruthy();
    expect(len0).toBeTruthy();
    expect(size0.value).toBe('3');
    expect(len0.value).toBe('150');
  });
});