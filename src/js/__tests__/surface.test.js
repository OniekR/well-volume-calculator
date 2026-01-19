import { describe, it, expect } from 'vitest';
import { setupSizeIdInputs } from '../ui.js';

/** @vitest-environment jsdom */

describe('Surface drift small-note', () => {
  it('displays drift and Nom ID when surface_size selected', () => {
    document.body.innerHTML = `
      <div class="casing-body">
        <div class="input-inline size-with-id">
          <select id="surface_size"><option value="17.8">18 5/8" 84.5# X-56</option></select>
          <div class="size-id-inline">
            <div class="small-note nom-id-inline"></div>
            <input id="surface_size_id" value="17.8" class="size-id-input size-id-input--narrow" />
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_13_top" />
          <div class="casing-footer-row">
            <div class="drift-input-group">
              <div class="small-note drift-note"></div>
              <button type="button" class="wellhead-btn" data-target="depth_13_top">Wellhead</button>
            </div>
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_13" />
          <div id="surface_length_note" class="small-note"></div>
        </div>
      </div>
    `;

    setupSizeIdInputs({ scheduleSave: () => {}, calculateVolume: () => {} });
    const driftNote = document.querySelector('.drift-note');
    const nomNote = document.querySelector('.nom-id-inline');
    expect(driftNote.textContent.trim()).toBe('Drift: 17.168 in');
    expect(nomNote.textContent.trim()).toBe('Nom ID:');
  });
});
