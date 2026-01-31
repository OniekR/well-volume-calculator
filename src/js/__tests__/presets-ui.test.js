import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { setupPresetsUI } from '../presets-ui.js';

describe('setupPresetsUI', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="save_preset_btn"></button>
      <button id="load_preset_btn"></button>
      <button id="delete_preset_btn"></button>
      <input id="preset_name" />
      <select id="preset_list"><option value=""></option></select>
      <button id="export_presets_btn"></button>
      <button id="import_presets_btn"></button>
      <input id="import_presets_input" type="file" />
    `;
    global.window.__KeinoPresets = {
      savePreset: vi.fn(() => true),
      loadBuiltinPresets: vi.fn(),
      populatePresetsUI: vi.fn(),
      getPresetState: vi.fn(() => ({ foo: 'bar' })),
      deletePreset: vi.fn(),
      exportPresets: vi.fn(),
      importPresetsFile: vi.fn()
    };
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  afterEach(() => {
    window.alert.mockRestore();
    window.confirm.mockRestore();
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

  it('alerts when saving without a name', () => {
    setupPresetsUI({ captureStateObject: () => ({}) });
    document.getElementById('save_preset_btn').click();
    expect(window.alert).toHaveBeenCalled();
    expect(window.__KeinoPresets.savePreset).not.toHaveBeenCalled();
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

  it('exports presets when export button clicked', () => {
    setupPresetsUI();
    document.getElementById('export_presets_btn').click();
    expect(window.__KeinoPresets.exportPresets).toHaveBeenCalled();
  });

  it('alerts when export module is unavailable', () => {
    window.__KeinoPresets = undefined;
    setupPresetsUI();
    document.getElementById('export_presets_btn').click();
    expect(window.alert).toHaveBeenCalled();
  });

  it('imports presets file when input changes', () => {
    setupPresetsUI();
    const file = new File(['data'], 'presets.json', {
      type: 'application/json'
    });
    const input = document.getElementById('import_presets_input');
    Object.defineProperty(input, 'files', {
      value: [file]
    });
    input.dispatchEvent(new Event('change'));
    expect(window.__KeinoPresets.importPresetsFile).toHaveBeenCalledWith(file);
  });

  it('alerts when import module is unavailable', () => {
    window.__KeinoPresets = undefined;
    setupPresetsUI();
    const file = new File(['data'], 'presets.json', {
      type: 'application/json'
    });
    const input = document.getElementById('import_presets_input');
    Object.defineProperty(input, 'files', {
      value: [file]
    });
    input.dispatchEvent(new Event('change'));
    expect(window.alert).toHaveBeenCalled();
  });

  it('disables delete for builtin presets', () => {
    const sel = document.getElementById('preset_list');
    sel.innerHTML =
      '<option value="builtin" data-builtin="1" selected>Builtin</option>';
    setupPresetsUI();
    document.getElementById('delete_preset_btn').click();
    expect(window.alert).toHaveBeenCalled();
    expect(window.__KeinoPresets.deletePreset).not.toHaveBeenCalled();
  });

  it('deletes preset after confirmation', () => {
    const sel = document.getElementById('preset_list');
    sel.innerHTML = '<option value="custom" selected>Custom</option>';
    setupPresetsUI();
    document.getElementById('delete_preset_btn').click();
    expect(window.__KeinoPresets.deletePreset).toHaveBeenCalledWith('custom');
  });

  it('refreshes presets on storage event', () => {
    setupPresetsUI();
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'well_presets_v1' })
    );
    expect(window.__KeinoPresets.populatePresetsUI).toHaveBeenCalled();
  });
});
