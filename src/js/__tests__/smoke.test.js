import { test, expect } from 'vitest';
import * as presets from '../presets.js';
import '../script.js';
import { computeVolumes } from '../logic.js';

test('smoke: modules load and expose expected helpers', () => {
  expect(typeof presets.savePreset).toBe('function');
  expect(typeof presets.getPresetState).toBe('function');
  expect(typeof window.__KeinoPresets).toBe('object');
  expect(typeof window.__TEST_applyStateObject).toBe('function');
  expect(typeof computeVolumes).toBe('function');
});
