import { describe, it, expect } from 'vitest';
import { initUI } from '../ui.js';

/** @vitest-environment jsdom */

describe('Drill pipe mode UI sync', () => {
  it('shows drill pipe section and hides tubing when toggle is checked on init', async () => {
    document.body.innerHTML = `
      <input type="checkbox" id="uc_mode_toggle" />
      <span class="slider"></span>
      <div id="uc_tubing_section" class="uc-tubing-section"></div>
      <div id="uc_drillpipe_section" class="uc-drillpipe-section hidden">
        <button class="drillpipe-count-btn active" data-count="3" aria-pressed="true">3 DPs</button>
      </div>
      <div id="drillpipe_inputs_container"></div>
    `;

    // Simulate saved state: drill pipe mode enabled
    document.getElementById('uc_mode_toggle').checked = true;

    // Initialize UI; pass noop deps
    initUI({ calculateVolume: () => {} });

    // Wait for async import and dispatch to run
    await new Promise((r) => setTimeout(r, 100));

    const tubing = document.getElementById('uc_tubing_section');
    const dp = document.getElementById('uc_drillpipe_section');
    const slider = document.querySelector('#uc_mode_toggle + .slider');

    expect(tubing.classList.contains('hidden')).toBe(true);
    expect(dp.classList.contains('hidden')).toBe(false);
    // When in DP mode (checked) the slider should not have the tubing class
    expect(slider.classList.contains('slider--tubing')).toBe(false);
  });

  it('shows tubing section when toggle is unchecked on init', async () => {
    document.body.innerHTML = `
      <input type="checkbox" id="uc_mode_toggle" />
      <span class="slider"></span>
      <div id="uc_tubing_section" class="uc-tubing-section hidden"></div>
      <div id="uc_drillpipe_section" class="uc-drillpipe-section">
        <button class="drillpipe-count-btn active" data-count="3" aria-pressed="true">3 DPs</button>
      </div>
      <div id="drillpipe_inputs_container"></div>
    `;

    document.getElementById('uc_mode_toggle').checked = false;
    initUI({ calculateVolume: () => {} });
    await new Promise((r) => setTimeout(r, 100));

    const tubing = document.getElementById('uc_tubing_section');
    const dp = document.getElementById('uc_drillpipe_section');
    const slider = document.querySelector('#uc_mode_toggle + .slider');

    expect(tubing.classList.contains('hidden')).toBe(false);
    expect(dp.classList.contains('hidden')).toBe(true);
    // When in tubing mode (unchecked) the slider should have the tubing class
    expect(slider.classList.contains('slider--tubing')).toBe(true);
  });
});
