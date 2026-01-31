/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PRESETS_KEY, saveState, loadState } from '../storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('PRESETS_KEY constant', () => {
    it('exports expected key name', () => {
      expect(PRESETS_KEY).toBe('well_presets_v1');
    });
  });

  describe('saveState()', () => {
    it('saves object to localStorage as JSON', () => {
      const testData = { foo: 'bar', num: 42 };
      saveState('test_key', testData);
      const stored = localStorage.getItem('test_key');
      expect(stored).toBe(JSON.stringify(testData));
    });

    it('saves nested objects correctly', () => {
      const testData = {
        level1: {
          level2: {
            value: 'deep'
          }
        }
      };
      saveState('nested_key', testData);
      const stored = JSON.parse(localStorage.getItem('nested_key'));
      expect(stored.level1.level2.value).toBe('deep');
    });

    it('saves arrays correctly', () => {
      const testData = [1, 2, 3, { name: 'test' }];
      saveState('array_key', testData);
      const stored = JSON.parse(localStorage.getItem('array_key'));
      expect(stored).toEqual(testData);
    });

    it('overwrites existing key', () => {
      saveState('overwrite_key', { old: true });
      saveState('overwrite_key', { new: true });
      const stored = JSON.parse(localStorage.getItem('overwrite_key'));
      expect(stored).toEqual({ new: true });
    });

    it('handles empty object', () => {
      saveState('empty_key', {});
      const stored = JSON.parse(localStorage.getItem('empty_key'));
      expect(stored).toEqual({});
    });

    it('handles null value', () => {
      saveState('null_key', null);
      const stored = localStorage.getItem('null_key');
      expect(stored).toBe('null');
    });
  });

  describe('loadState()', () => {
    it('loads and parses JSON from localStorage', () => {
      const testData = { foo: 'bar', num: 42 };
      localStorage.setItem('test_key', JSON.stringify(testData));
      const result = loadState('test_key');
      expect(result).toEqual(testData);
    });

    it('returns null for missing key', () => {
      const result = loadState('nonexistent_key');
      expect(result).toBeNull();
    });

    it('returns null for invalid JSON', () => {
      localStorage.setItem('invalid_key', 'not valid json {{{');
      const result = loadState('invalid_key');
      expect(result).toBeNull();
    });

    it('loads nested objects correctly', () => {
      const testData = { a: { b: { c: 'nested' } } };
      localStorage.setItem('nested_key', JSON.stringify(testData));
      const result = loadState('nested_key');
      expect(result.a.b.c).toBe('nested');
    });

    it('loads arrays correctly', () => {
      const testData = [1, 'two', { three: 3 }];
      localStorage.setItem('array_key', JSON.stringify(testData));
      const result = loadState('array_key');
      expect(result).toEqual(testData);
    });

    it('returns null when localStorage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      const result = loadState('error_key');
      expect(result).toBeNull();
    });

    it('handles stored null value', () => {
      localStorage.setItem('null_key', 'null');
      const result = loadState('null_key');
      expect(result).toBeNull();
    });

    it('handles empty string stored value', () => {
      localStorage.setItem('empty_string', '""');
      const result = loadState('empty_string');
      expect(result).toBe('');
    });
  });
});
