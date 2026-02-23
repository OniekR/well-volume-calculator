import { describe, test, expect, beforeEach } from 'vitest';
import '../script.js';
import { applyStateObject } from '../state.js';
import { renderTubingInputs } from '../tubing.js';

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('tubing persistence', () => {
  test('restores tubing lengths when state is applied', async () => {
    document.body.innerHTML = `
      <button id="tubing_count_1" class="tubing-count-btn" data-count="1">1 Tubing</button>
      <button id="tubing_count_2" class="tubing-count-btn active" data-count="2">2 Tubings</button>
      <button id="tubing_count_3" class="tubing-count-btn" data-count="3">3 Tubings</button>
      <div id="tubing_inputs_container"></div>
    `;

    document.querySelectorAll('.tubing-count-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const count = Number(btn.dataset.count) || 1;
        document.querySelectorAll('.tubing-count-btn').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        renderTubingInputs(count);
      });
    });

    const state = {
      tubing_count: { type: 'input', value: '2' },
      tubing_size_0: { type: 'select', value: '1' },
      tubing_length_0: { type: 'input', value: '500' },
      tubing_size_1: { type: 'select', value: '0' },
      tubing_length_1: { type: 'input', value: '3000' }
    };

    applyStateObject(state, {
      calculateVolume: () => {},
      scheduleSave: () => {}
    });

    await new Promise((r) => setTimeout(r, 10));

    const len0 = document.getElementById('tubing_length_0');
    const len1 = document.getElementById('tubing_length_1');

    expect(len0).toBeTruthy();
    expect(len1).toBeTruthy();
    expect(len0.value).toBe('500');
    expect(len1.value).toBe('3000');
  });
});
