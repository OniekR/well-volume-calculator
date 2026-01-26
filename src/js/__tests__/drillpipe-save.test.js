import { describe, it, expect, vi } from 'vitest';
import { initUI } from '../ui.js';

/** @vitest-environment jsdom */

describe('drill pipe save behavior', () => {
  it('calls scheduleSave when drill pipe length input is changed', async () => {
    document.body.innerHTML = `
      <input type="checkbox" id="uc_mode_toggle" />
      <div class="switch">
        <span class="slider"></span>
      </div>
      <div id="uc_tubing_section" class="uc-tubing-section"></div>
      <div id="uc_drillpipe_section" class="uc-drillpipe-section hidden">
        <div class="drillpipe-count-selector">
          <label>Number of drill pipe sizes:</label>
          <div class="drillpipe-button-group">
            <button class="drillpipe-count-btn active" data-count="1">1 DP</button>
          </div>
        </div>
        <div id="drillpipe_inputs_container"></div>
      </div>
    `;

    // Ensure toggle is in drill pipe mode so inputs render
    const toggle = document.getElementById('uc_mode_toggle');
    toggle.checked = true;

    const scheduleSave = vi.fn();

    // Initialize UI with spy for scheduleSave
    initUI({ calculateVolume: () => {}, scheduleSave });

    // Wait a tick for async import and render to complete
    await new Promise((r) => setTimeout(r, 100));

    const len = document.querySelector('input[id^="drillpipe_length_"]');
    expect(len).toBeTruthy();

    // Simulate user changing the length
    len.value = '123';
    len.dispatchEvent(new Event('input', { bubbles: true }));

    // scheduleSave should have been called as a result
    expect(scheduleSave).toHaveBeenCalled();
  });
});
