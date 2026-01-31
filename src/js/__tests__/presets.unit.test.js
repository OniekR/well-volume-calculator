/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadBuiltinPresets,
  loadPresetsFromStorage,
  savePresetsToStorage,
  getPresetNames,
  getPresetState,
  populatePresetsUI,
  exportPresets,
  importPresetsFile,
  savePreset,
  deletePreset
} from '../presets.js';
import { PRESETS_KEY } from '../storage.js';

describe('presets.js', () => {
  const mockStoredPresets = {
    'My Custom Well': {
      savedAt: 1700000000000,
      state: {
        casings: [{ name: 'Surface', od: 13.375, id: 12.415, length: 500 }]
      }
    },
    'Test Preset': {
      savedAt: 1700000001000,
      state: {
        casings: [{ name: 'Production', od: 7, id: 6.184, length: 3000 }]
      }
    }
  };

  const mockBuiltinPresets = {
    'Builtin Well A': {
      state: {
        _builtin: true,
        casings: [{ name: 'Conductor', od: 20, id: 19, length: 100 }]
      }
    }
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    window.alert = vi.fn();
    window.confirm = vi.fn(() => true);
    document.body.innerHTML = `
      <select id="preset_list">
        <option value="">Select preset...</option>
      </select>
    `;
  });

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  describe('loadPresetsFromStorage()', () => {
    it('returns empty object when no presets stored', () => {
      const result = loadPresetsFromStorage();
      expect(result).toEqual({});
    });

    it('returns stored presets object', () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      const result = loadPresetsFromStorage();
      expect(result).toEqual(mockStoredPresets);
    });

    it('returns empty object on invalid JSON', () => {
      localStorage.setItem(PRESETS_KEY, 'invalid json {{');
      const result = loadPresetsFromStorage();
      expect(result).toEqual({});
    });
  });

  describe('savePresetsToStorage()', () => {
    it('saves presets to localStorage', () => {
      savePresetsToStorage(mockStoredPresets);
      const stored = JSON.parse(localStorage.getItem(PRESETS_KEY));
      expect(stored).toEqual(mockStoredPresets);
    });

    it('overwrites existing presets', () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify({ old: {} }));
      savePresetsToStorage(mockStoredPresets);
      const stored = JSON.parse(localStorage.getItem(PRESETS_KEY));
      expect(stored).toEqual(mockStoredPresets);
      expect(stored.old).toBeUndefined();
    });
  });

  describe('getPresetNames()', () => {
    it('returns empty array when no presets', () => {
      const names = getPresetNames();
      expect(names).toEqual([]);
    });

    it('returns sorted array of stored preset names', () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      const names = getPresetNames();
      expect(names).toContain('My Custom Well');
      expect(names).toContain('Test Preset');
      expect(names).toEqual([...names].sort());
    });

    it('combines builtin and stored names when builtins loaded', async () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBuiltinPresets)
        })
      );
      await loadBuiltinPresets();
      const names = getPresetNames();
      expect(names).toContain('Builtin Well A');
      expect(names).toContain('My Custom Well');
    });
  });

  describe('getPresetState()', () => {
    it('returns null for non-existent preset', () => {
      const result = getPresetState('NonExistent');
      expect(result).toBeNull();
    });

    it('returns stored preset state', () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      const result = getPresetState('My Custom Well');
      expect(result).toEqual(mockStoredPresets['My Custom Well'].state);
    });

    it('returns builtin preset state after loading', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBuiltinPresets)
        })
      );
      await loadBuiltinPresets();
      const result = getPresetState('Builtin Well A');
      expect(result._builtin).toBe(true);
    });
  });

  describe('savePreset()', () => {
    it('saves new preset to storage', () => {
      const state = { casings: [{ name: 'Test' }] };
      const result = savePreset('New Preset', state);
      expect(result).toBe(true);
      const stored = JSON.parse(localStorage.getItem(PRESETS_KEY));
      expect(stored['New Preset'].state).toEqual(state);
      expect(typeof stored['New Preset'].savedAt).toBe('number');
    });

    it('returns false for empty name', () => {
      const result = savePreset('', { casings: [] });
      expect(result).toBe(false);
    });

    it('allows whitespace-only name', () => {
      const result = savePreset('   ', { casings: [] });
      expect(result).toBe(true);
    });

    it('overwrites existing preset with same name', () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      const newState = { casings: [{ name: 'Updated' }] };
      savePreset('My Custom Well', newState);
      const stored = JSON.parse(localStorage.getItem(PRESETS_KEY));
      expect(stored['My Custom Well'].state).toEqual(newState);
      expect(typeof stored['My Custom Well'].savedAt).toBe('number');
    });

    it('returns false when trying to overwrite builtin', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBuiltinPresets)
        })
      );
      await loadBuiltinPresets();
      const result = savePreset('Builtin Well A', { casings: [] });
      expect(result).toBe(false);
    });
  });

  describe('deletePreset()', () => {
    it('deletes existing preset', () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      const result = deletePreset('My Custom Well');
      expect(result).toBe(true);
      const stored = JSON.parse(localStorage.getItem(PRESETS_KEY));
      expect(stored['My Custom Well']).toBeUndefined();
    });

    it('returns false for non-existent preset', () => {
      const result = deletePreset('NonExistent');
      expect(result).toBe(false);
    });

    it('returns false when trying to delete builtin', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBuiltinPresets)
        })
      );
      await loadBuiltinPresets();
      const result = deletePreset('Builtin Well A');
      expect(result).toBe(false);
    });

    it('preserves other presets when deleting one', () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      deletePreset('My Custom Well');
      const stored = JSON.parse(localStorage.getItem(PRESETS_KEY));
      expect(stored['Test Preset']).toBeDefined();
    });
  });

  describe('populatePresetsUI()', () => {
    it('clears existing options and adds presets', () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      populatePresetsUI();
      const select = document.getElementById('preset_list');
      const options = select.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(1);
    });

    it('includes default empty option', () => {
      populatePresetsUI();
      const select = document.getElementById('preset_list');
      const firstOption = select.querySelector('option');
      expect(firstOption.value).toBe('');
    });

    it('handles missing select element gracefully', () => {
      document.body.innerHTML = '';
      expect(() => populatePresetsUI()).not.toThrow();
    });
  });

  describe('exportPresets()', () => {
    it('creates a download and revokes the blob URL', () => {
      const createObjectURL = vi.fn(() => 'blob:mock');
      const revokeObjectURL = vi.fn();
      const originalCreateElement = document.createElement.bind(document);
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        const el = originalCreateElement(tag);
        if (tag === 'a') el.click = vi.fn();
        return el;
      });

      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      exportPresets();

      expect(createObjectURL).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalled();
    });

    it('alerts when export fails', () => {
      vi.stubGlobal('URL', {
        createObjectURL: () => {
          throw new Error('boom');
        },
        revokeObjectURL: vi.fn()
      });
      exportPresets();
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('importPresetsFile()', () => {
    it('merges incoming presets and refreshes UI', () => {
      const originalFileReader = global.FileReader;
      class MockFileReader {
        readAsText() {
          this.result = JSON.stringify({
            presets: {
              Incoming: { state: { casings: [{ name: 'Incoming' }] } }
            }
          });
          this.onload();
        }
      }
      global.FileReader = MockFileReader;
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));

      importPresetsFile(new File(['data'], 'presets.json'));

      const stored = JSON.parse(localStorage.getItem(PRESETS_KEY));
      expect(stored.Incoming).toBeDefined();
      expect(window.alert).toHaveBeenCalled();

      global.FileReader = originalFileReader;
    });

    it('respects conflict cancellation', () => {
      const originalFileReader = global.FileReader;
      window.confirm = vi.fn(() => false);
      class MockFileReader {
        readAsText() {
          this.result = JSON.stringify({
            presets: {
              'My Custom Well': { state: { casings: [{ name: 'Incoming' }] } }
            }
          });
          this.onload();
        }
      }
      global.FileReader = MockFileReader;
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));

      importPresetsFile(new File(['data'], 'presets.json'));

      const stored = JSON.parse(localStorage.getItem(PRESETS_KEY));
      expect(stored['My Custom Well'].state).toEqual(
        mockStoredPresets['My Custom Well'].state
      );

      global.FileReader = originalFileReader;
    });

    it('alerts when reader fails', () => {
      const originalFileReader = global.FileReader;
      class MockFileReader {
        readAsText() {
          this.onerror();
        }
      }
      global.FileReader = MockFileReader;

      importPresetsFile(new File(['data'], 'presets.json'));
      expect(window.alert).toHaveBeenCalled();

      global.FileReader = originalFileReader;
    });
  });

  describe('loadBuiltinPresets()', () => {
    it('fetches and stores builtin presets', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBuiltinPresets)
        })
      );
      await loadBuiltinPresets();
      expect(fetch).toHaveBeenCalled();
      const state = getPresetState('Builtin Well A');
      expect(state).not.toBeNull();
    });

    it('handles fetch failure gracefully', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      await expect(loadBuiltinPresets()).resolves.not.toThrow();
    });

    it('handles non-ok response gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      );
      await expect(loadBuiltinPresets()).resolves.not.toThrow();
    });
  });
});
