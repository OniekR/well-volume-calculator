import { describe, it, expect } from 'vitest';
import { setupSizeIdInputs } from '../ui.js';

/** @vitest-environment jsdom */

describe('Conductor drift small-note', () => {
  it('displays hard-coded drift and Nom ID when conductor_size selected', () => {
    document.body.innerHTML = `
      <div class="casing-body">
        <div class="input-inline size-with-id">
          <select id="conductor_size"><option value="28">30" 309.7#</option></select>
          <div class="size-id-inline">
            <div class="small-note nom-id-inline"></div>
            <input id="conductor_size_id" value="28" class="size-id-input size-id-input--narrow" />
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_18_top" />
          <div>
            <div class="small-note drift-note"></div>
            <button type="button" class="wellhead-btn" data-target="depth_18_top">Wellhead</button>
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_18_bottom" />
          <div id="conductor_length_note" class="small-note"></div>
        </div>
      </div>
    `;
    setupSizeIdInputs({ scheduleSave: () => {}, calculateVolume: () => {} });
    const driftNote = document.querySelector('.drift-note');
    const nomNote = document.querySelector('.nom-id-inline');
    expect(driftNote.textContent.trim()).toBe('Drift: 27.813 in');
    expect(nomNote.textContent.trim()).toBe('Nom ID:');
  });
});
