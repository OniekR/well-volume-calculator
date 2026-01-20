/** @vitest-environment jsdom */
import { beforeEach, afterEach, test, expect } from 'vitest';
import { checkUpperCompletionFit } from '../src/js/ui.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

function makeUpperCompletion(ucTop = '23', ucShoe = '4000', ucId = '4.892') {
  const container = document.createElement('div');
  container.id = 'upper_completion_section';
  container.innerHTML = `
    <div class="casing-body">
      <input id="upper_completion_size_id" value="${ucId}" />
      <input id="depth_uc_top" value="${ucTop}" />
      <input id="depth_uc" value="${ucShoe}" />
    </div>
  `;
  document.body.appendChild(container);
}

function makeSmallLiner(
  drift = '4.0',
  top = '3691',
  shoe = '4992',
  enabled = true
) {
  const section = document.createElement('div');
  section.className = 'casing-input';
  section.innerHTML = `
    <input class="use-checkbox" id="use_small_liner" type="checkbox" ${
      enabled ? 'checked' : ''
    } />
    <input id="depth_small_top" value="${top}" />
    <input id="depth_small" value="${shoe}" />
    <input id="small_liner_drift" value="${drift}" />
  `;
  document.body.appendChild(section);
}

test('shows warning when UC overlaps small liner and UC OD > drift', () => {
  makeUpperCompletion();
  makeSmallLiner('4.0'); // drift < UC OD (5.5)

  checkUpperCompletionFit();

  const warn = document.getElementById('upper_completion_fit_warning');
  expect(warn).not.toBeNull();
  expect(warn.textContent).toMatch(/Upper completion OD/);
});

test('does not warn when drift >= UC OD', () => {
  makeUpperCompletion();
  makeSmallLiner('6.0'); // drift >= UC OD

  checkUpperCompletionFit();

  const warn = document.getElementById('upper_completion_fit_warning');
  expect(warn).toBeNull();
});

test('does not warn when UC does not overlap casing', () => {
  // UC shoe above casing top
  makeUpperCompletion('23', '3000');
  makeSmallLiner('4.0', '3691', '4992');

  checkUpperCompletionFit();

  const warn = document.getElementById('upper_completion_fit_warning');
  expect(warn).toBeNull();
});

test('does not warn when casing disabled', () => {
  makeUpperCompletion();
  makeSmallLiner('4.0', '3691', '4992', false); // disabled

  checkUpperCompletionFit();

  const warn = document.getElementById('upper_completion_fit_warning');
  expect(warn).toBeNull();
});
