import { describe, test, expect, beforeEach, vi } from 'vitest';
// Import the app so it defines window.__TEST_applyStateObject
import '../script.js';
import { applyStateObject } from '../state.js';

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('applyStateObject', () => {
  test('enables small liner when inputs present but no use_small_liner', () => {
    document.body.innerHTML = `
      <div class="casing-input">
        <input type="checkbox" class="use-checkbox" id="use_small_liner">
        <div class="casing-header" aria-expanded="false"></div>
      </div>
      <input id="small_liner_size" value="4.276">
      <input id="small_liner_size_id" value="4.276">
      <input id="depth_small_top" value="1">
      <input id="depth_small" value="10">
    `;

    const state = {
      small_liner_size: { type: 'input', value: '4.276' },
      small_liner_size_id: { type: 'input', value: '4.276' },
      depth_small_top: { type: 'input', value: '1' },
      depth_small: { type: 'input', value: '10' }
    };

    expect(document.getElementById('use_small_liner').checked).toBe(false);
    // call helper
    window.__TEST_applyStateObject(state);
    expect(document.getElementById('use_small_liner').checked).toBe(true);
    const section = document.querySelector('.casing-input');
    const header = section.querySelector('.casing-header');
    expect(section.classList.contains('collapsed')).toBe(false);
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });

  test('production toggle buttons reflect loaded state', () => {
    document.body.innerHTML = `
      <input type="checkbox" id="production_is_liner">
      <button id="production_casing_btn" aria-pressed="false"></button>
      <button class="liner-default-btn" aria-pressed="false"></button>
      <input id="depth_7_top" value="">
    `;

    // Case: production_is_liner checked
    const state1 = { production_is_liner: { type: 'checkbox', value: true } };
    window.__TEST_applyStateObject(state1);
    const linerBtn = document.querySelector('.liner-default-btn');
    const casingBtn = document.getElementById('production_casing_btn');
    expect(linerBtn.classList.contains('active')).toBe(true);
    expect(linerBtn.getAttribute('aria-pressed')).toBe('true');
    expect(casingBtn.classList.contains('active')).toBe(false);

    // Case: production_is_liner false but depth provided => casing active
    document.getElementById('production_is_liner').checked = false;
    document.getElementById('depth_7_top').value = '3';
    const state2 = { depth_7_top: { type: 'input', value: '3' } };
    window.__TEST_applyStateObject(state2);
    expect(casingBtn.classList.contains('active')).toBe(true);
    expect(casingBtn.getAttribute('aria-pressed')).toBe('true');
  });

  test('calls calculateVolume and scheduleSave callbacks', () => {
    document.body.innerHTML = '';
    const calculate = vi.fn();
    const save = vi.fn();
    applyStateObject({}, { calculateVolume: calculate, scheduleSave: save });
    expect(calculate).toHaveBeenCalled();
    expect(save).toHaveBeenCalled();
  });
});
