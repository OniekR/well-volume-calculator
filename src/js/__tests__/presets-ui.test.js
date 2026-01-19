import { describe, it, beforeEach, expect, vi } from 'vitest';
import { setupPresetsUI } from '../presets-ui.js';

describe('setupPresetsUI', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="save_preset_btn"></button>
      <button id="load_preset_btn"></button>
      <button id="delete_preset_btn"></button>
      <input id="preset_name" />
      <select id="preset_list"><option value=""></option></select>
    `;
    global.window.__KeinoPresets = {
      savePreset: vi.fn(() => true),
      populatePresetsUI: vi.fn(),
      getPresetState: vi.fn(() => ({ foo: 'bar' })),
      deletePreset: vi.fn()
    };
  });

  it('calls savePreset with captured state and notifies host', () => {
    const captureState = () => ({ a: 1 });
    const onSaved = vi.fn();
    setupPresetsUI({
      captureStateObject: captureState,
      applyStateObject: () => {},
      onPresetSaved: onSaved
    });
    const saveBtn = document.getElementById('save_preset_btn');
    const name = document.getElementById('preset_name');
    name.value = 'my-preset';
    saveBtn.click();
    expect(window.__KeinoPresets.savePreset).toHaveBeenCalledWith('my-preset', {
      a: 1
    });
    expect(onSaved).toHaveBeenCalledWith('my-preset');
  });

  it('loads preset and calls applyStateObject and notifies host', () => {
    const applySpy = vi.fn();
    const onApplied = vi.fn();
    const sel = document.getElementById('preset_list');
    sel.innerHTML = '<option value="p1" selected>p1</option>';
    setupPresetsUI({
      captureStateObject: () => {},
      applyStateObject: applySpy,
      onPresetApplied: onApplied
    });
    const loadBtn = document.getElementById('load_preset_btn');
    loadBtn.click();
    expect(window.__KeinoPresets.getPresetState).toHaveBeenCalledWith('p1');
    expect(applySpy).toHaveBeenCalled();
    expect(onApplied).toHaveBeenCalledWith('p1');
  });
});
