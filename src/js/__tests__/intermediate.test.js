import { describe, it, expect } from 'vitest';
import { setupSizeIdInputs } from '../ui.js';

/** @vitest-environment jsdom */

describe('Intermediate drift small-note', () => {
  it('displays drift and Nom ID when intermediate_size selected', () => {
    document.body.innerHTML = `
      <div class="casing-body">
        <div class="input-inline size-with-id">
          <select id="intermediate_size"><option value="12.415">13 3/8" 68# N-80</option></select>
          <div class="size-id-inline">
            <div class="small-note nom-id-inline"></div>
            <input id="intermediate_size_id" value="12.415" class="size-id-input size-id-input--narrow" />
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9_top" />
          <div class="casing-footer-row">
            <div class="drift-input-group">
              <div class="small-note drift-note"></div>
              <button type="button" class="wellhead-btn" data-target="depth_9_top">Wellhead</button>
            </div>
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9" />
          <div id="intermediate_length_note" class="small-note"></div>
        </div>
      </div>
    `;

    setupSizeIdInputs({ scheduleSave: () => {}, calculateVolume: () => {} });
    const driftNote = document.querySelector('.drift-note');
    const nomNote = document.querySelector('.nom-id-inline');
    expect(driftNote.textContent.trim()).toBe('Drift: 12.259 in');
    expect(nomNote.textContent.trim()).toBe('Nom ID:');
  });

  it('displays correct drift for 13 5/8" SM100MS', () => {
    document.body.innerHTML = `
      <div class="casing-body">
        <div class="input-inline size-with-id">
          <select id="intermediate_size"><option value="12.375">13 5/8" 88.2# SM100MS</option></select>
          <div class="size-id-inline">
            <div class="small-note nom-id-inline"></div>
            <input id="intermediate_size_id" value="12.375" class="size-id-input size-id-input--narrow" />
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9_top" />
          <div class="casing-footer-row">
            <div class="drift-input-group">
              <div class="small-note drift-note"></div>
              <button type="button" class="wellhead-btn" data-target="depth_9_top">Wellhead</button>
            </div>
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9" />
          <div id="intermediate_length_note" class="small-note"></div>
        </div>
      </div>
    `;

    setupSizeIdInputs({ scheduleSave: () => {}, calculateVolume: () => {} });
    const driftNote = document.querySelector('.drift-note');
    const nomNote = document.querySelector('.nom-id-inline');
    expect(driftNote.textContent.trim()).toBe('Drift: 12.26 in');
    expect(nomNote.textContent.trim()).toBe('Nom ID:');
  });

  it('displays correct drift for 13 3/8" 72# N-80', () => {
    document.body.innerHTML = `
      <div class="casing-body">
        <div class="input-inline size-with-id">
          <select id="intermediate_size"><option value="12.347">13 3/8" 72# N-80</option></select>
          <div class="size-id-inline">
            <div class="small-note nom-id-inline"></div>
            <input id="intermediate_size_id" value="12.347" class="size-id-input size-id-input--narrow" />
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9_top" />
          <div class="casing-footer-row">
            <div class="drift-input-group">
              <div class="small-note drift-note"></div>
              <button type="button" class="wellhead-btn" data-target="depth_9_top">Wellhead</button>
            </div>
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9" />
          <div id="intermediate_length_note" class="small-note"></div>
        </div>
      </div>
    `;

    setupSizeIdInputs({ scheduleSave: () => {}, calculateVolume: () => {} });
    const driftNote = document.querySelector('.drift-note');
    const nomNote = document.querySelector('.nom-id-inline');
    expect(driftNote.textContent.trim()).toBe('Drift: 12.191 in');
    expect(nomNote.textContent.trim()).toBe('Nom ID:');
  });

  it('displays correct drift for 13 3/8" 61# K-55', () => {
    document.body.innerHTML = `
      <div class="casing-body">
        <div class="input-inline size-with-id">
          <select id="intermediate_size"><option value="12.515">13 3/8" 61# K-55</option></select>
          <div class="size-id-inline">
            <div class="small-note nom-id-inline"></div>
            <input id="intermediate_size_id" value="12.515" class="size-id-input size-id-input--narrow" />
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9_top" />
          <div class="casing-footer-row">
            <div class="drift-input-group">
              <div class="small-note drift-note"></div>
              <button type="button" class="wellhead-btn" data-target="depth_9_top">Wellhead</button>
            </div>
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9" />
          <div id="intermediate_length_note" class="small-note"></div>
        </div>
      </div>
    `;

    setupSizeIdInputs({ scheduleSave: () => {}, calculateVolume: () => {} });
    const driftNote = document.querySelector('.drift-note');
    const nomNote = document.querySelector('.nom-id-inline');
    expect(driftNote.textContent.trim()).toBe('Drift: 12.359 in');
    expect(nomNote.textContent.trim()).toBe('Nom ID:');
  });

  it('displays correct drift for 13 3/8" 64.9# L-80', () => {
    document.body.innerHTML = `
      <div class="casing-body">
        <div class="input-inline size-with-id">
          <select id="intermediate_size"><option value="12.459">13 3/8" 64.9# L-80</option></select>
          <div class="size-id-inline">
            <div class="small-note nom-id-inline"></div>
            <input id="intermediate_size_id" value="12.459" class="size-id-input size-id-input--narrow" />
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9_top" />
          <div class="casing-footer-row">
            <div class="drift-input-group">
              <div class="small-note drift-note"></div>
              <button type="button" class="wellhead-btn" data-target="depth_9_top">Wellhead</button>
            </div>
          </div>
        </div>
        <div class="input-inline">
          <input id="depth_9" />
          <div id="intermediate_length_note" class="small-note"></div>
        </div>
      </div>
    `;

    setupSizeIdInputs({ scheduleSave: () => {}, calculateVolume: () => {} });
    const driftNote = document.querySelector('.drift-note');
    const nomNote = document.querySelector('.nom-id-inline');
    expect(driftNote.textContent.trim()).toBe('Drift: 12.303 in');
    expect(nomNote.textContent.trim()).toBe('Nom ID:');
  });
});
