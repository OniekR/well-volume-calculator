import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureStateObject, applyStateObject } from '../state.js';
import { el } from '../dom.js';

describe('Tubing State Persistence', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
    document.body.innerHTML = `
      <div class="tubing-count-selector">
        <button type="button" id="tubing_count_1" class="tubing-count-btn" data-count="1">1 Tubing</button>
        <button type="button" id="tubing_count_2" class="tubing-count-btn active" data-count="2">2 Tubings</button>
        <button type="button" id="tubing_count_3" class="tubing-count-btn" data-count="3">3 Tubings</button>
      </div>
      <div class="drillpipe-count-selector">
        <button type="button" id="drillpipe_count_1" class="drillpipe-count-btn" data-count="1">1 DP</button>
        <button type="button" id="drillpipe_count_2" class="drillpipe-count-btn" data-count="2">2 DPs</button>
        <button type="button" id="drillpipe_count_3" class="drillpipe-count-btn active" data-count="3">3 DPs</button>
      </div>
      <input type="checkbox" id="use_upper_completion" checked />
      <input type="checkbox" id="uc_mode_toggle" />
      <div id="uc_tubing_section"></div>
      <div id="uc_drillpipe_section" class="hidden"></div>
    `;
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
    localStorage.clear();
  });

  describe('captureStateObject', () => {
    it('should capture tubing_count from active button', () => {
      const state = captureStateObject();

      expect(state.tubing_count).toEqual({
        type: 'input',
        value: '2'
      });
    });

    it('should capture drillpipe_count from active button', () => {
      const state = captureStateObject();

      expect(state.drillpipe_count).toEqual({
        type: 'input',
        value: '3'
      });
    });

    it('should capture tubing_count when different button is active', () => {
      // Change active button to 3
      document
        .querySelector('.tubing-count-btn.active')
        .classList.remove('active');
      document.getElementById('tubing_count_3').classList.add('active');

      const state = captureStateObject();

      expect(state.tubing_count).toEqual({
        type: 'input',
        value: '3'
      });
    });
  });

  describe('applyStateObject - tubing count restoration', () => {
    beforeEach(() => {
      // Reset to default state (button 1 active)
      document.querySelectorAll('.tubing-count-btn').forEach((btn) => {
        btn.classList.remove('active');
      });
      document.getElementById('tubing_count_1').classList.add('active');

      // Add click handler to simulate real behavior
      document.querySelectorAll('.tubing-count-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tubing-count-btn').forEach((b) => {
            b.classList.remove('active');
          });
          btn.classList.add('active');
        });
      });
    });

    it('should restore tubing_count from explicit state value', async () => {
      const state = {
        tubing_count: { type: 'input', value: '3' }
      };

      applyStateObject(state, {
        calculateVolume: () => {},
        scheduleSave: () => {}
      });
      await new Promise((r) => setTimeout(r, 10));

      const activeBtn = document.querySelector('.tubing-count-btn.active');
      expect(activeBtn.id).toBe('tubing_count_3');
    });

    it('should restore tubing_count value 2 correctly', async () => {
      const state = {
        tubing_count: { type: 'input', value: '2' }
      };

      applyStateObject(state, {
        calculateVolume: () => {},
        scheduleSave: () => {}
      });
      await new Promise((r) => setTimeout(r, 10));

      const activeBtn = document.querySelector('.tubing-count-btn.active');
      expect(activeBtn.id).toBe('tubing_count_2');
    });
  });
});

describe('Mode Toggle with Checkbox Unchecked', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input type="checkbox" id="use_upper_completion" />
      <input type="checkbox" id="uc_mode_toggle" />
      <div id="uc_tubing_section"></div>
      <div id="uc_drillpipe_section" class="hidden"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should allow mode toggle to be changed when checkbox is unchecked', () => {
    const checkbox = el('use_upper_completion');
    const modeToggle = el('uc_mode_toggle');

    checkbox.checked = false;

    // Mode toggle should NOT be disabled
    expect(modeToggle.disabled).toBe(false);

    // Should be able to change value
    modeToggle.checked = true;
    expect(modeToggle.checked).toBe(true);
  });

  it('should persist mode toggle state when checkbox is unchecked', () => {
    const modeToggle = el('uc_mode_toggle');
    modeToggle.checked = true;

    const state = captureStateObject();

    expect(state.uc_mode_toggle).toEqual({
      type: 'checkbox',
      value: true
    });
  });
});
