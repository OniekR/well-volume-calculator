/** @vitest-environment jsdom */
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import { setupSizeIdInputs } from '../src/js/ui.js';
import { DRIFT } from '../src/js/constants.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

function makeProductionSize() {
  document.body.innerHTML = `
    <div class="size-with-id">
      <select id="production_size">
        <option value="8.681">9 5/8" 47# L-80</option>
        <option value="8.535">9 5/8" 53.5# L-80</option>
      </select>
      <div class="size-id-inline">
        <div class="nom-input-group">
          <div class="small-note nom-id-inline"></div>
          <input id="production_size_id" />
        </div>
        <div class="nom-input-group">
          <div class="small-note drift-label"></div>
          <input id="production_drift" />
        </div>
      </div>
    </div>
  `;
}

test('drift default from DRIFT mapping is applied', () => {
  makeProductionSize();
  const scheduleSave = vi.fn();
  const calculateVolume = vi.fn();

  setupSizeIdInputs({ scheduleSave, calculateVolume });

  const drift = document.getElementById('production_drift');
  expect(drift).not.toBeNull();
  // value set to DRIFT.production[8.681] which is 8.525
  expect(parseFloat(drift.value)).toBeCloseTo(DRIFT.production[8.681]);
});

test('user-edited drift is preserved on size change', () => {
  makeProductionSize();
  const scheduleSave = vi.fn();
  const calculateVolume = vi.fn();

  setupSizeIdInputs({ scheduleSave, calculateVolume });

  const drift = document.getElementById('production_drift');
  const sel = document.getElementById('production_size');

  // user edits drift
  drift.value = '9.0';
  drift.dispatchEvent(new Event('input', { bubbles: true }));
  expect(drift.dataset.userEdited).toBeDefined();

  // change size
  sel.value = '8.535';
  sel.dispatchEvent(new Event('change', { bubbles: true }));

  // drift should remain the user value
  expect(parseFloat(drift.value)).toBeCloseTo(9.0);
});
