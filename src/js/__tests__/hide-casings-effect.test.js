/** @vitest-environment jsdom */
import { test, expect, beforeEach } from 'vitest';
import { setupHideCasingsToggle } from '../ui.js';
import { gatherInputs } from '../inputs.js';

beforeEach(() => {
  document.body.innerHTML = `
    <form id="well-form">
      <button id="toggle_hide_casings_btn" class="small-liner-default-btn" type="button">Hide casings</button>

      <div class="casing-input">
        <input type="checkbox" id="use_5" checked />
        <input id="depth_5_top" value="2748" />
        <input id="depth_5" value="3798" />
        <input id="reservoir_size_id" value="6.184" />
      </div>

      <div class="casing-input">
        <input type="checkbox" id="use_small_liner" checked />
        <input id="depth_small_top" value="3691" />
        <input id="depth_small" value="4992" />
        <input id="small_liner_size_id" value="4.276" />
      </div>
    </form>
  `;
});

test('toggling hide casings does not mutate casing inputs or their computed values', () => {
  setupHideCasingsToggle();
  const before = gatherInputs();
  const btn = document.getElementById('toggle_hide_casings_btn');
  btn.click();
  const after = gatherInputs();
  expect(before.casingsInput).toEqual(after.casingsInput);
});
