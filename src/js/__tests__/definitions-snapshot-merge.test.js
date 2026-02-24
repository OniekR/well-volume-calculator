import { beforeEach, describe, expect, test } from 'vitest';
import {
  applyDefinitionSnapshot,
  getTubingCatalog,
  resetDefinitionsToDefaults
} from '../definitions.js';

describe('definitions snapshot merge behavior', () => {
  beforeEach(() => {
    resetDefinitionsToDefaults();
  });

  test('keeps new default tubing entries when loading older saved tubing catalog', () => {
    applyDefinitionSnapshot({
      tubingCatalog: [
        {
          name: '4 1/2" 12.6# L-80',
          id: 3.958,
          od: 4.5,
          lPerM: 9.728,
          eod: 0
        },
        {
          name: '5 1/2" 17#',
          id: 4.892,
          od: 5.5,
          lPerM: 11.803,
          eod: 0
        }
      ]
    });

    const tubingCatalog = getTubingCatalog();

    expect(
      tubingCatalog.some((entry) => entry.name === '5 1/2" 20# SM25CRW-125')
    ).toBe(true);
    expect(tubingCatalog).toHaveLength(3);
  });
});
