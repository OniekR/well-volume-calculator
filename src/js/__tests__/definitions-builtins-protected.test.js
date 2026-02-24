import { beforeEach, describe, expect, test } from 'vitest';
import {
  addManualTubingDefinition,
  addManualDrillpipeDefinition,
  addManualCasingDefinition,
  deleteTubingEntry,
  deleteCasingDefinition,
  deleteDrillpipeEntry,
  getCasingDefinitions,
  getDrillpipeCatalog,
  getTubingCatalog,
  resetDefinitionsToDefaults
} from '../definitions.js';

describe('built-in definitions protection', () => {
  beforeEach(() => {
    resetDefinitionsToDefaults();
  });

  test('cannot delete built-in tubing entries', () => {
    const before = getTubingCatalog();
    expect(deleteTubingEntry(0)).toBe(false);
    expect(deleteTubingEntry(1)).toBe(false);
    expect(deleteTubingEntry(2)).toBe(false);
    expect(getTubingCatalog()).toHaveLength(before.length);
  });

  test('can delete manual tubing entries', () => {
    addManualTubingDefinition({
      name: 'Manual Tubing',
      id: 6.111,
      od: 6.2,
      lPerM: 15.001,
      eod: 4.222
    });

    const withManual = getTubingCatalog();
    const manualIndex = withManual.findIndex((entry) => entry.id === 6.111);
    expect(manualIndex).toBeGreaterThanOrEqual(0);

    expect(deleteTubingEntry(manualIndex)).toBe(true);
    expect(getTubingCatalog().some((entry) => entry.id === 6.111)).toBe(false);
  });

  test('cannot delete built-in drill pipe entries', () => {
    const before = getDrillpipeCatalog();
    expect(deleteDrillpipeEntry(0)).toBe(false);
    expect(deleteDrillpipeEntry(1)).toBe(false);
    expect(deleteDrillpipeEntry(2)).toBe(false);
    expect(deleteDrillpipeEntry(3)).toBe(false);
    expect(getDrillpipeCatalog()).toHaveLength(before.length);
  });

  test('can delete manual drill pipe entries', () => {
    addManualDrillpipeDefinition({
      name: 'Manual DP',
      id: 6.333,
      od: 6.9,
      lPerM: 18.2,
      eod: 5.7,
      ced: 23.9
    });

    const withManual = getDrillpipeCatalog();
    const manualIndex = withManual.findIndex((entry) => entry.id === 6.333);
    expect(manualIndex).toBeGreaterThanOrEqual(0);

    expect(deleteDrillpipeEntry(manualIndex)).toBe(true);
    expect(getDrillpipeCatalog().some((entry) => entry.id === 6.333)).toBe(
      false
    );
  });

  test('cannot delete built-in casing definitions but can delete manual casing', () => {
    const builtInSurface = getCasingDefinitions('surface')[0];
    expect(deleteCasingDefinition('surface', builtInSurface.id)).toBe(false);

    addManualCasingDefinition('surface', {
      id: 14.125,
      label: 'Surface Manual 14.125',
      od: 15,
      drift: 13.8,
      tj: 14.4
    });

    expect(deleteCasingDefinition('surface', 14.125)).toBe(true);
    expect(
      getCasingDefinitions('surface').some((entry) => entry.id === 14.125)
    ).toBe(false);
  });
});
