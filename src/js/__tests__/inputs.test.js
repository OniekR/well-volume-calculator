import { describe, it, beforeEach, expect } from 'vitest';
import { gatherInputs } from '../inputs.js';

describe('gatherInputs', () => {
  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
  });

  it('links open hole top to deepest casing shoe', () => {
    document.body.innerHTML = `
      <input id="depth_7" value="100" />
      <input id="use_7" type="checkbox" checked />
      <input id="depth_open_top" />
      <div id="open_hole_length_note"></div>
    `;

    const out = gatherInputs();
    // find production casing
    const prod = out.casingsInput.find((c) => c.role === 'production');
    expect(prod).toBeTruthy();
    expect(prod.depth).toBe(100);

    const openTop = document.getElementById('depth_open_top');
    expect(openTop.value).toBe('100');
    const note = document.getElementById('open_hole_length_note');
    expect(note.textContent).toContain(
      'Top linked to deepest casing shoe: 100'
    );
  });

  it('prefers explicit _id input over select value', () => {
    document.body.innerHTML = `
      <select id="production_size"><option value="6.276">6.276</option></select>
      <input id="production_size_id" value="8.921" />
    `;

    const out = gatherInputs();
    const prod = out.casingsInput.find((c) => c.role === 'production');
    expect(prod.id).toBe(8.921);
  });

  it('resolves shared production/tieback IDs with explicit OD mappings', () => {
    document.body.innerHTML = `
      <select id="production_size"><option value="9.66">9.66</option></select>
      <input id="production_size_id" value="9.66" />
      <select id="tieback_size"><option value="8.681">8.681</option></select>
      <input id="tieback_size_id" value="8.681" />
    `;

    const out = gatherInputs();
    const prod = out.casingsInput.find((c) => c.role === 'production');
    const tie = out.casingsInput.find((c) => c.role === 'tieback');

    expect(prod.id).toBe(9.66);
    expect(prod.od).toBe(11.5);
    expect(tie.id).toBe(8.681);
    expect(tie.od).toBe(9.625);
  });
});
