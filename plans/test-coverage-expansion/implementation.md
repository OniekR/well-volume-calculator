# Test Coverage Expansion to 70-80%

## Goal

Increase project test coverage from ~54% to 70-80% by adding comprehensive unit tests for under-tested modules, following established testing patterns.

## Prerequisites

Make sure you are currently on the `test-coverage-expansion` branch before beginning implementation.
If not, move to the correct branch. If the branch does not exist, create it from main.

```bash
git checkout -b test-coverage-expansion
```

---

### Step-by-Step Instructions

---

#### Step 1: Test Infrastructure & Quick Wins (dom.js, storage.js)

- [x] Create new test file `src/js/__tests__/dom.unit.test.js`
- [x] Copy and paste code below into `src/js/__tests__/dom.unit.test.js`:

```javascript
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { el, qs, setAttr, toggleClass } from '../dom.js';

describe('dom.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
  });

  describe('el()', () => {
    it('returns element when it exists', () => {
      document.body.innerHTML = '<div id="test-element">Hello</div>';
      const result = el('test-element');
      expect(result).not.toBeNull();
      expect(result.textContent).toBe('Hello');
    });

    it('returns null when element does not exist', () => {
      document.body.innerHTML = '<div id="other"></div>';
      const result = el('nonexistent');
      expect(result).toBeNull();
    });

    it('returns null for empty string id', () => {
      document.body.innerHTML = '<div id="test"></div>';
      const result = el('');
      expect(result).toBeNull();
    });
  });

  describe('qs()', () => {
    it('returns array of matching elements', () => {
      document.body.innerHTML = `
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
      `;
      const result = qs('.item');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it('returns empty array when no elements match', () => {
      document.body.innerHTML = '<div class="other"></div>';
      const result = qs('.nonexistent');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('works with complex selectors', () => {
      document.body.innerHTML = `
        <div class="container">
          <span class="target">A</span>
          <span class="target">B</span>
        </div>
        <span class="target">C</span>
      `;
      const result = qs('.container .target');
      expect(result).toHaveLength(2);
    });

    it('returns elements in document order', () => {
      document.body.innerHTML = `
        <div class="item" data-order="1">First</div>
        <div class="item" data-order="2">Second</div>
      `;
      const result = qs('.item');
      expect(result[0].dataset.order).toBe('1');
      expect(result[1].dataset.order).toBe('2');
    });
  });

  describe('setAttr()', () => {
    it('sets attribute on existing element', () => {
      document.body.innerHTML = '<input id="test-input" />';
      const input = el('test-input');
      setAttr(input, 'disabled', 'true');
      expect(input.getAttribute('disabled')).toBe('true');
    });

    it('handles null element gracefully', () => {
      expect(() => setAttr(null, 'disabled', 'true')).not.toThrow();
    });

    it('handles undefined element gracefully', () => {
      expect(() => setAttr(undefined, 'disabled', 'true')).not.toThrow();
    });

    it('overwrites existing attribute', () => {
      document.body.innerHTML = '<div id="test" data-value="old"></div>';
      const div = el('test');
      setAttr(div, 'data-value', 'new');
      expect(div.getAttribute('data-value')).toBe('new');
    });

    it('sets empty string attribute', () => {
      document.body.innerHTML = '<div id="test"></div>';
      const div = el('test');
      setAttr(div, 'data-empty', '');
      expect(div.getAttribute('data-empty')).toBe('');
    });
  });

  describe('toggleClass()', () => {
    it('adds class when condition is true', () => {
      document.body.innerHTML = '<div id="test"></div>';
      const div = el('test');
      toggleClass(div, 'active', true);
      expect(div.classList.contains('active')).toBe(true);
    });

    it('removes class when condition is false', () => {
      document.body.innerHTML = '<div id="test" class="active"></div>';
      const div = el('test');
      toggleClass(div, 'active', false);
      expect(div.classList.contains('active')).toBe(false);
    });

    it('handles null element gracefully', () => {
      expect(() => toggleClass(null, 'active', true)).not.toThrow();
    });

    it('handles undefined element gracefully', () => {
      expect(() => toggleClass(undefined, 'active', true)).not.toThrow();
    });

    it('does not affect other classes when adding', () => {
      document.body.innerHTML = '<div id="test" class="existing other"></div>';
      const div = el('test');
      toggleClass(div, 'active', true);
      expect(div.classList.contains('existing')).toBe(true);
      expect(div.classList.contains('other')).toBe(true);
      expect(div.classList.contains('active')).toBe(true);
    });

    it('does not affect other classes when removing', () => {
      document.body.innerHTML =
        '<div id="test" class="existing active other"></div>';
      const div = el('test');
      toggleClass(div, 'active', false);
      expect(div.classList.contains('existing')).toBe(true);
      expect(div.classList.contains('other')).toBe(true);
      expect(div.classList.contains('active')).toBe(false);
    });

    it('is idempotent for adding', () => {
      document.body.innerHTML = '<div id="test" class="active"></div>';
      const div = el('test');
      toggleClass(div, 'active', true);
      toggleClass(div, 'active', true);
      expect(div.classList.contains('active')).toBe(true);
      expect(div.className).toBe('active');
    });

    it('is idempotent for removing', () => {
      document.body.innerHTML = '<div id="test"></div>';
      const div = el('test');
      toggleClass(div, 'active', false);
      toggleClass(div, 'active', false);
      expect(div.classList.contains('active')).toBe(false);
    });
  });
});
```

- [x] Expand test file `src/js/__tests__/storage.unit.test.js` if it exists, or create it
- [x] Copy and paste code below into `src/js/__tests__/storage.unit.test.js`:

```javascript
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
```

##### Step 1 Verification Checklist

- [x] Run `npm test -- --run` - all tests pass
- [x] Run `npm test -- --coverage` and verify:
  - `dom.js` reaches 90%+ line coverage
  - `storage.js` reaches 90%+ line coverage
- [x] No build errors or console warnings

#### Step 1 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

#### Step 2: Tubing Module Tests

- [x] Create new test file `src/js/__tests__/tubing.unit.test.js`
- [x] Copy and paste code below into `src/js/__tests__/tubing.unit.test.js`:

```javascript
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  TUBING_CATALOG,
  updateTubingDepthDisplays,
  gatherTubingInput,
  renderTubingInputs
} from '../tubing.js';

describe('tubing.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
    vi.restoreAllMocks();
  });

  describe('TUBING_CATALOG', () => {
    it('is an array with at least 2 entries', () => {
      expect(Array.isArray(TUBING_CATALOG)).toBe(true);
      expect(TUBING_CATALOG.length).toBeGreaterThanOrEqual(2);
    });

    it('contains 4 1/2" tubing entry', () => {
      const entry = TUBING_CATALOG.find((t) => t.name.includes('4 1/2'));
      expect(entry).toBeDefined();
      expect(entry.id).toBe(3.958);
      expect(entry.od).toBe(4.5);
    });

    it('contains 5 1/2" tubing entry', () => {
      const entry = TUBING_CATALOG.find((t) => t.name.includes('5 1/2'));
      expect(entry).toBeDefined();
      expect(entry.id).toBe(4.892);
      expect(entry.od).toBe(5.5);
    });

    it('all entries have required properties', () => {
      TUBING_CATALOG.forEach((entry) => {
        expect(entry).toHaveProperty('name');
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('od');
        expect(entry).toHaveProperty('lPerM');
        expect(typeof entry.name).toBe('string');
        expect(typeof entry.id).toBe('number');
        expect(typeof entry.od).toBe('number');
        expect(typeof entry.lPerM).toBe('number');
      });
    });

    it('all entries have positive dimensions', () => {
      TUBING_CATALOG.forEach((entry) => {
        expect(entry.id).toBeGreaterThan(0);
        expect(entry.od).toBeGreaterThan(0);
        expect(entry.od).toBeGreaterThan(entry.id);
      });
    });
  });

  describe('gatherTubingInput()', () => {
    function setupTubingDOM({
      useUC = true,
      tubingCount = 1,
      tubings = []
    } = {}) {
      const defaultTubing = {
        sizeId: '4.892',
        length: '1000'
      };

      const tubingRows = [];
      for (let i = 1; i <= tubingCount; i++) {
        const t = tubings[i - 1] || defaultTubing;
        tubingRows.push(`
          <div class="tubing-row" data-index="${i}">
            <select id="tubing_size_id_${i}">
              <option value="4.892" ${
                t.sizeId === '4.892' ? 'selected' : ''
              }>5 1/2" 17#</option>
              <option value="3.958" ${
                t.sizeId === '3.958' ? 'selected' : ''
              }>4 1/2" 12.6#</option>
            </select>
            <input id="tubing_length_${i}" type="number" value="${t.length}" />
            <span id="tubing_top_${i}">0</span>
            <span id="tubing_shoe_${i}">${t.length}</span>
          </div>
        `);
      }

      document.body.innerHTML = `
        <input type="checkbox" id="use_upper_completion" ${
          useUC ? 'checked' : ''
        } />
        <div id="tubing_inputs_container">
          ${tubingRows.join('')}
        </div>
        <button id="add_tubing_btn">Add</button>
        <select id="tubing_count">
          <option value="${tubingCount}" selected>${tubingCount}</option>
        </select>
      `;
    }

    it('returns empty tubings array when UC is disabled', () => {
      setupTubingDOM({ useUC: false });
      const result = gatherTubingInput();
      expect(result.count).toBe(0);
      expect(result.tubings).toHaveLength(0);
    });

    it('gathers single tubing input correctly', () => {
      setupTubingDOM({
        useUC: true,
        tubingCount: 1,
        tubings: [{ sizeId: '4.892', length: '1500' }]
      });
      const result = gatherTubingInput();
      expect(result.count).toBe(1);
      expect(result.tubings).toHaveLength(1);
      expect(result.tubings[0].sizeId).toBe(4.892);
      expect(result.tubings[0].length).toBe(1500);
    });

    it('gathers multiple tubing inputs correctly', () => {
      setupTubingDOM({
        useUC: true,
        tubingCount: 2,
        tubings: [
          { sizeId: '4.892', length: '1000' },
          { sizeId: '3.958', length: '500' }
        ]
      });
      const result = gatherTubingInput();
      expect(result.count).toBe(2);
      expect(result.tubings).toHaveLength(2);
      expect(result.tubings[0].sizeId).toBe(4.892);
      expect(result.tubings[0].length).toBe(1000);
      expect(result.tubings[1].sizeId).toBe(3.958);
      expect(result.tubings[1].length).toBe(500);
    });

    it('handles zero length tubing', () => {
      setupTubingDOM({
        useUC: true,
        tubingCount: 1,
        tubings: [{ sizeId: '4.892', length: '0' }]
      });
      const result = gatherTubingInput();
      expect(result.tubings[0].length).toBe(0);
    });

    it('calculates cumulative top depths', () => {
      setupTubingDOM({
        useUC: true,
        tubingCount: 2,
        tubings: [
          { sizeId: '4.892', length: '1000' },
          { sizeId: '3.958', length: '500' }
        ]
      });
      const result = gatherTubingInput();
      expect(result.tubings[0].top).toBe(0);
      expect(result.tubings[0].shoe).toBe(1000);
      expect(result.tubings[1].top).toBe(1000);
      expect(result.tubings[1].shoe).toBe(1500);
    });
  });

  describe('renderTubingInputs()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="use_upper_completion" checked />
        <div id="tubing_inputs_container"></div>
        <select id="tubing_count">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      `;
    });

    it('creates correct number of tubing rows', () => {
      renderTubingInputs(2);
      const rows = document.querySelectorAll('.tubing-row, [data-index]');
      expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it('creates rows with required input elements', () => {
      renderTubingInputs(1);
      const container = document.getElementById('tubing_inputs_container');
      expect(container.querySelector('[id*="tubing_size_id"]')).not.toBeNull();
      expect(container.querySelector('[id*="tubing_length"]')).not.toBeNull();
    });

    it('handles count of 0', () => {
      renderTubingInputs(0);
      const container = document.getElementById('tubing_inputs_container');
      const rows = container.querySelectorAll('.tubing-row, [data-index]');
      expect(rows.length).toBe(0);
    });

    it('clears existing rows when re-rendering', () => {
      renderTubingInputs(3);
      renderTubingInputs(1);
      const container = document.getElementById('tubing_inputs_container');
      const inputs = container.querySelectorAll('[id^="tubing_length_"]');
      expect(inputs.length).toBe(1);
    });
  });

  describe('updateTubingDepthDisplays()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="use_upper_completion" checked />
        <input id="depth_uc" value="5000" />
        <div id="tubing_inputs_container">
          <div class="tubing-row" data-index="1">
            <input id="tubing_length_1" value="1000" />
            <span id="tubing_top_1">0</span>
            <span id="tubing_shoe_1">0</span>
          </div>
          <div class="tubing-row" data-index="2">
            <input id="tubing_length_2" value="500" />
            <span id="tubing_top_2">0</span>
            <span id="tubing_shoe_2">0</span>
          </div>
        </div>
      `;
    });

    it('updates depth displays based on tubing lengths', () => {
      updateTubingDepthDisplays();
      const top1 = document.getElementById('tubing_top_1');
      const shoe1 = document.getElementById('tubing_shoe_1');
      const top2 = document.getElementById('tubing_top_2');
      const shoe2 = document.getElementById('tubing_shoe_2');

      expect(top1.textContent).toBe('0');
      expect(shoe1.textContent).toBe('1000');
      expect(top2.textContent).toBe('1000');
      expect(shoe2.textContent).toBe('1500');
    });

    it('handles empty container gracefully', () => {
      document.getElementById('tubing_inputs_container').innerHTML = '';
      expect(() => updateTubingDepthDisplays()).not.toThrow();
    });
  });
});
```

##### Step 2 Verification Checklist

- [x] Run `npm test -- --run` - all tests pass
- [x] Run `npm test -- --coverage` and verify `tubing.js` reaches 70%+ line coverage
- [x] No build errors or console warnings

#### Step 2 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

#### Step 3: Presets Module Tests

- [x] Create new test file `src/js/__tests__/presets.unit.test.js`
- [x] Copy and paste code below into `src/js/__tests__/presets.unit.test.js`:

```javascript
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadBuiltinPresets,
  loadPresetsFromStorage,
  savePresetsToStorage,
  getPresetNames,
  getPresetState,
  populatePresetsUI,
  savePreset,
  deletePreset
} from '../presets.js';
import { PRESETS_KEY } from '../storage.js';

describe('presets.js', () => {
  const mockStoredPresets = {
    'My Custom Well': {
      casings: [{ name: 'Surface', od: 13.375, id: 12.415, length: 500 }]
    },
    'Test Preset': {
      casings: [{ name: 'Production', od: 7, id: 6.184, length: 3000 }]
    }
  };

  const mockBuiltinPresets = {
    'Builtin Well A': {
      _builtin: true,
      casings: [{ name: 'Conductor', od: 20, id: 19, length: 100 }]
    }
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    document.body.innerHTML = `
      <select id="preset_list">
        <option value="">Select preset...</option>
      </select>
    `;
  });

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
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
      expect(result).toEqual(mockStoredPresets['My Custom Well']);
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
      expect(stored['New Preset']).toEqual(state);
    });

    it('returns false for empty name', () => {
      const result = savePreset('', { casings: [] });
      expect(result).toBe(false);
    });

    it('returns false for whitespace-only name', () => {
      const result = savePreset('   ', { casings: [] });
      expect(result).toBe(false);
    });

    it('overwrites existing preset with same name', () => {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(mockStoredPresets));
      const newState = { casings: [{ name: 'Updated' }] };
      savePreset('My Custom Well', newState);
      const stored = JSON.parse(localStorage.getItem(PRESETS_KEY));
      expect(stored['My Custom Well']).toEqual(newState);
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
```

##### Step 3 Verification Checklist

- [x] Run `npm test -- --run` - all tests pass
- [x] Run `npm test -- --coverage` and verify `presets.js` reaches 75%+ line coverage
- [x] No build errors or console warnings

#### Step 3 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

#### Step 4: Pressure Module Tests

- [x] Expand existing or create test file `src/js/__tests__/pressure.unit.test.js`
- [x] Copy and paste code below into `src/js/__tests__/pressure.unit.test.js`:

```javascript
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculatePressureVolume,
  buildSelectableSections,
  computePressureTest,
  gatherPressureInput,
  setupPressureUI,
  renderPressureResults,
  FLUID_COMPRESSIBILITY,
  FLUID_COMPRESSIBILITY_LABELS,
  PRESSURE_DEFAULTS
} from '../pressure.js';

describe('pressure.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Constants', () => {
    it('exports FLUID_COMPRESSIBILITY with expected values', () => {
      expect(FLUID_COMPRESSIBILITY.wbm_brine).toBe(21);
      expect(FLUID_COMPRESSIBILITY.obm).toBe(18);
      expect(FLUID_COMPRESSIBILITY.base_oil).toBe(14);
      expect(FLUID_COMPRESSIBILITY.kfls).toBe(35);
    });

    it('exports FLUID_COMPRESSIBILITY_LABELS for all fluids', () => {
      Object.keys(FLUID_COMPRESSIBILITY).forEach((key) => {
        expect(FLUID_COMPRESSIBILITY_LABELS[key]).toBeDefined();
        expect(typeof FLUID_COMPRESSIBILITY_LABELS[key]).toBe('string');
      });
    });

    it('exports PRESSURE_DEFAULTS with expected values', () => {
      expect(PRESSURE_DEFAULTS.lowPressure).toBe(20);
      expect(PRESSURE_DEFAULTS.highPressure).toBe(345);
      expect(PRESSURE_DEFAULTS.maxPressure).toBe(1035);
    });
  });

  describe('calculatePressureVolume()', () => {
    it('calculates pressure volume correctly', () => {
      const volumeM3 = 100;
      const pressureDelta = 100;
      const kValue = 21;
      const result = calculatePressureVolume(volumeM3, pressureDelta, kValue);
      expect(result).toBeCloseTo((100 * 100) / (21 * 10), 2);
    });

    it('returns 0 for zero volume', () => {
      const result = calculatePressureVolume(0, 100, 21);
      expect(result).toBe(0);
    });

    it('returns 0 for zero pressure delta', () => {
      const result = calculatePressureVolume(100, 0, 21);
      expect(result).toBe(0);
    });

    it('handles different k values correctly', () => {
      const volume = 50;
      const pressure = 200;
      const result1 = calculatePressureVolume(volume, pressure, 21);
      const result2 = calculatePressureVolume(volume, pressure, 14);
      expect(result2).toBeGreaterThan(result1);
    });
  });

  describe('buildSelectableSections()', () => {
    const mockCasings = [
      { role: 'surface', name: 'Surface Casing', volume: 10 },
      { role: 'intermediate', name: 'Intermediate', volume: 20 }
    ];

    const mockDrillpipe = {
      dp: { volume: 5 },
      annulus: { volume: 15 }
    };

    const mockTubing = {
      tubings: [{ name: 'Tubing 1', volume: 3 }],
      annulus: { volume: 8 }
    };

    const mockVolumes = {
      casings: mockCasings,
      drillpipe: mockDrillpipe,
      tubing: mockTubing
    };

    it('builds sections from casings input', () => {
      const result = buildSelectableSections({
        casingsInput: mockCasings,
        volumes: mockVolumes
      });
      expect(result).toContainEqual(
        expect.objectContaining({
          role: 'surface'
        })
      );
    });

    it('includes drillpipe sections when provided', () => {
      const result = buildSelectableSections({
        casingsInput: mockCasings,
        drillpipeInput: mockDrillpipe,
        volumes: mockVolumes
      });
      const dpSection = result.find((s) => s.role === 'drillpipe');
      expect(dpSection).toBeDefined();
    });

    it('includes tubing sections when provided', () => {
      const result = buildSelectableSections({
        casingsInput: mockCasings,
        tubingInput: { count: 1, tubings: mockTubing.tubings },
        volumes: mockVolumes
      });
      expect(result.length).toBeGreaterThan(mockCasings.length);
    });

    it('returns empty array for empty input', () => {
      const result = buildSelectableSections({
        casingsInput: [],
        volumes: { casings: [], drillpipe: null, tubing: null }
      });
      expect(result).toEqual([]);
    });
  });

  describe('gatherPressureInput()', () => {
    function setupPressureDOM({
      active = true,
      lowPressure = '20',
      highPressure = '345',
      kValue = '21'
    } = {}) {
      document.body.innerHTML = `
        <input type="checkbox" id="pressure_active" ${
          active ? 'checked' : ''
        } />
        <input type="number" id="pressure_low" value="${lowPressure}" />
        <input type="number" id="pressure_high" value="${highPressure}" />
        <select id="pressure_k_value">
          <option value="21" ${
            kValue === '21' ? 'selected' : ''
          }>WBM/Brine</option>
          <option value="18" ${kValue === '18' ? 'selected' : ''}>OBM</option>
          <option value="14" ${
            kValue === '14' ? 'selected' : ''
          }>Base Oil</option>
          <option value="35" ${kValue === '35' ? 'selected' : ''}>KFLS</option>
        </select>
        <div id="pressure-section-buttons"></div>
      `;
    }

    it('gathers input values correctly', () => {
      setupPressureDOM();
      const result = gatherPressureInput();
      expect(result.active).toBe(true);
      expect(result.lowPressure).toBe(20);
      expect(result.highPressure).toBe(345);
      expect(result.kValue).toBe(21);
    });

    it('returns inactive when checkbox unchecked', () => {
      setupPressureDOM({ active: false });
      const result = gatherPressureInput();
      expect(result.active).toBe(false);
    });

    it('parses numeric values correctly', () => {
      setupPressureDOM({
        lowPressure: '50',
        highPressure: '500',
        kValue: '18'
      });
      const result = gatherPressureInput();
      expect(result.lowPressure).toBe(50);
      expect(result.highPressure).toBe(500);
      expect(result.kValue).toBe(18);
    });
  });

  describe('computePressureTest()', () => {
    const mockPressureInput = {
      active: true,
      lowPressure: 20,
      highPressure: 345,
      kValue: 21,
      selectedSections: ['surface']
    };

    const mockWellConfig = {
      casings: [{ role: 'surface', volume: 100 }],
      drillpipe: null,
      tubing: null
    };

    it('computes pressure test result', () => {
      const result = computePressureTest(mockPressureInput, mockWellConfig);
      expect(result).toHaveProperty('lowVolume');
      expect(result).toHaveProperty('highVolume');
      expect(result).toHaveProperty('totalVolume');
    });

    it('returns null when inactive', () => {
      const result = computePressureTest(
        { ...mockPressureInput, active: false },
        mockWellConfig
      );
      expect(result).toBeNull();
    });

    it('calculates volumes based on pressure delta', () => {
      const result = computePressureTest(mockPressureInput, mockWellConfig);
      expect(result.highVolume).toBeGreaterThan(result.lowVolume);
    });
  });

  describe('renderPressureResults()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="pressure-results" class="hidden">
          <span id="pressure-low-volume">0</span>
          <span id="pressure-high-volume">0</span>
          <span id="pressure-total-volume">0</span>
        </div>
        <div id="pressure-results-empty"></div>
      `;
    });

    it('shows results container and hides empty state', () => {
      renderPressureResults({
        lowVolume: 10,
        highVolume: 50,
        totalVolume: 60
      });
      const results = document.getElementById('pressure-results');
      const empty = document.getElementById('pressure-results-empty');
      expect(results.classList.contains('hidden')).toBe(false);
      expect(empty.classList.contains('hidden')).toBe(true);
    });

    it('updates volume displays', () => {
      renderPressureResults({
        lowVolume: 15.5,
        highVolume: 75.25,
        totalVolume: 90.75
      });
      expect(
        document.getElementById('pressure-low-volume').textContent
      ).toContain('15');
      expect(
        document.getElementById('pressure-high-volume').textContent
      ).toContain('75');
    });

    it('hides results when result is null', () => {
      renderPressureResults(null);
      const results = document.getElementById('pressure-results');
      const empty = document.getElementById('pressure-results-empty');
      expect(results.classList.contains('hidden')).toBe(true);
      expect(empty.classList.contains('hidden')).toBe(false);
    });
  });

  describe('setupPressureUI()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="pressure_active" />
        <input type="number" id="pressure_low" value="20" />
        <input type="number" id="pressure_high" value="345" />
        <select id="pressure_k_value">
          <option value="21" selected>WBM/Brine</option>
        </select>
        <div id="pressure-section-buttons"></div>
        <div id="pressure-results" class="hidden"></div>
        <div id="pressure-results-empty"></div>
      `;
    });

    it('sets up event listeners without errors', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      expect(() => setupPressureUI(deps)).not.toThrow();
    });

    it('toggles visibility when checkbox changes', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupPressureUI(deps);
      const checkbox = document.getElementById('pressure_active');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      vi.runAllTimers();
      expect(deps.calculateVolume).toHaveBeenCalled();
    });
  });
});
```

##### Step 4 Verification Checklist

- [x] Run `npm test -- --run` - all tests pass
- [x] Run `npm test -- --coverage` and verify `pressure.js` reaches 75%+ line coverage
- [x] No build errors or console warnings

#### Step 4 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

#### Step 5: Draw Module Tests

- [x] Expand existing or create test file `src/js/__tests__/draw.unit.test.js`
- [x] Copy and paste code below into `src/js/__tests__/draw.unit.test.js`:

```javascript
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initDraw,
  disposeDraw,
  resizeCanvasForDPR,
  scheduleDraw,
  drawSchematic,
  __TEST_flush_draw
} from '../draw.js';

describe('draw.js', () => {
  let ctxMock;
  let fakeCanvas;

  beforeEach(() => {
    ctxMock = {
      clearRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      strokeStyle: null,
      lineWidth: null,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      fillStyle: null,
      font: null,
      textAlign: null,
      textBaseline: null,
      measureText: vi.fn(() => ({ width: 20 })),
      setTransform: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      strokeRect: vi.fn(),
      setLineDash: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn()
    };

    fakeCanvas = {
      nodeType: 1,
      getContext: vi.fn(() => ctxMock),
      getBoundingClientRect: vi.fn(() => ({ width: 400, height: 600 })),
      width: 0,
      height: 0,
      style: {}
    };

    globalThis.window.devicePixelRatio = 1;
    vi.useFakeTimers();
  });

  afterEach(() => {
    disposeDraw();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initDraw()', () => {
    it('initializes with canvas element', () => {
      expect(() => initDraw(fakeCanvas)).not.toThrow();
    });

    it('gets 2d context from canvas', () => {
      initDraw(fakeCanvas);
      expect(fakeCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('handles null canvas gracefully', () => {
      expect(() => initDraw(null)).not.toThrow();
    });

    it('handles undefined canvas gracefully', () => {
      expect(() => initDraw(undefined)).not.toThrow();
    });
  });

  describe('disposeDraw()', () => {
    it('disposes without error when not initialized', () => {
      expect(() => disposeDraw()).not.toThrow();
    });

    it('disposes after initialization', () => {
      initDraw(fakeCanvas);
      expect(() => disposeDraw()).not.toThrow();
    });

    it('can be called multiple times', () => {
      initDraw(fakeCanvas);
      disposeDraw();
      expect(() => disposeDraw()).not.toThrow();
    });
  });

  describe('resizeCanvasForDPR()', () => {
    it('resizes canvas based on bounding rect', () => {
      initDraw(fakeCanvas);
      resizeCanvasForDPR();
      expect(fakeCanvas.width).toBe(400);
      expect(fakeCanvas.height).toBe(600);
    });

    it('accounts for device pixel ratio', () => {
      globalThis.window.devicePixelRatio = 2;
      initDraw(fakeCanvas);
      resizeCanvasForDPR();
      expect(fakeCanvas.width).toBe(800);
      expect(fakeCanvas.height).toBe(1200);
    });

    it('handles non-initialized state gracefully', () => {
      expect(() => resizeCanvasForDPR()).not.toThrow();
    });
  });

  describe('scheduleDraw()', () => {
    const mockCasings = [
      {
        role: 'surface',
        name: 'Surface Casing',
        od: 13.375,
        id: 12.415,
        top: 0,
        shoe: 500,
        hidden: false
      },
      {
        role: 'production',
        name: 'Production Casing',
        od: 7,
        id: 6.184,
        top: 0,
        shoe: 3000,
        hidden: false
      }
    ];

    it('schedules draw without immediate execution', () => {
      initDraw(fakeCanvas);
      scheduleDraw(mockCasings, {});
      expect(ctxMock.clearRect).not.toHaveBeenCalled();
    });

    it('executes draw after flush', () => {
      initDraw(fakeCanvas);
      scheduleDraw(mockCasings, {});
      __TEST_flush_draw();
      expect(ctxMock.clearRect).toHaveBeenCalled();
    });

    it('handles empty casings array', () => {
      initDraw(fakeCanvas);
      scheduleDraw([], {});
      __TEST_flush_draw();
      expect(ctxMock.clearRect).toHaveBeenCalled();
    });

    it('handles options parameter', () => {
      initDraw(fakeCanvas);
      const opts = {
        plugDepth: 1500,
        showWater: true,
        waterDepth: 2000,
        presetName: 'Test Well'
      };
      expect(() => {
        scheduleDraw(mockCasings, opts);
        __TEST_flush_draw();
      }).not.toThrow();
    });
  });

  describe('drawSchematic()', () => {
    const mockCasings = [
      {
        role: 'surface',
        name: 'Surface',
        od: 13.375,
        id: 12.415,
        top: 0,
        shoe: 500,
        hidden: false
      }
    ];

    it('clears canvas before drawing', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, {});
      expect(ctxMock.clearRect).toHaveBeenCalled();
    });

    it('draws casings', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, {});
      expect(ctxMock.fillRect).toHaveBeenCalled();
    });

    it('handles hidden casings', () => {
      initDraw(fakeCanvas);
      const hiddenCasings = [{ ...mockCasings[0], hidden: true }];
      expect(() => drawSchematic(hiddenCasings, {})).not.toThrow();
    });

    it('draws plug line when plugDepth provided', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, { plugDepth: 250 });
      expect(ctxMock.beginPath).toHaveBeenCalled();
      expect(ctxMock.stroke).toHaveBeenCalled();
    });

    it('draws water level when showWater is true', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, { showWater: true, waterDepth: 300 });
      expect(ctxMock.fillRect).toHaveBeenCalled();
    });

    it('draws preset label when presetName provided', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, { presetName: 'Test Well' });
      expect(ctxMock.fillText).toHaveBeenCalled();
    });

    it('handles non-initialized state gracefully', () => {
      expect(() => drawSchematic(mockCasings, {})).not.toThrow();
    });

    it('draws upper completion when UC data provided', () => {
      initDraw(fakeCanvas);
      const opts = {
        upperCompletion: {
          top: 0,
          shoe: 4000,
          id: 4.892
        }
      };
      expect(() => drawSchematic(mockCasings, opts)).not.toThrow();
    });

    it('draws tubing when tubing data provided', () => {
      initDraw(fakeCanvas);
      const opts = {
        tubing: {
          tubings: [{ top: 0, shoe: 3500, od: 4.5, id: 3.958 }]
        }
      };
      expect(() => drawSchematic(mockCasings, opts)).not.toThrow();
    });

    it('draws drillpipe when drillpipe data provided', () => {
      initDraw(fakeCanvas);
      const opts = {
        drillpipe: {
          top: 0,
          shoe: 3000,
          od: 5,
          id: 4.276
        }
      };
      expect(() => drawSchematic(mockCasings, opts)).not.toThrow();
    });
  });
});
```

##### Step 5 Verification Checklist

- [x] Run `npm test -- --run` - all tests pass
- [x] Run `npm test -- --coverage` and verify `draw.js` reaches 65%+ line coverage
- [x] No build errors or console warnings

#### Step 5 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

#### Step 6: Render Module Tests

- [ ] Expand existing or create test file `src/js/__tests__/render.unit.test.js`
- [ ] Copy and paste code below into `src/js/__tests__/render.unit.test.js`:

```javascript
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderResults, renderUpperCompletionBreakdown } from '../render.js';

describe('render.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
    document.body.innerHTML = `
      <span id="totalVolume">0</span>
      <span id="plugAboveVolume">0</span>
      <span id="plugBelowVolume">0</span>
      <span id="plugAboveTubing">0</span>
      <span id="plugBelowTubing">0</span>
      <span id="plugAboveAnnulus">0</span>
      <span id="plugBelowAnnulus">0</span>
      <table id="casingVolumes">
        <tbody></tbody>
      </table>
      <section id="drillpipe_results_section" class="hidden">
        <span id="dpVolume">0</span>
        <span id="annulusVolume">0</span>
        <span id="dpAbovePlug">0</span>
        <span id="dpBelowPlug">0</span>
        <span id="annulusAbovePlug">0</span>
        <span id="annulusBelowPlug">0</span>
      </section>
      <section id="tubing_results_section" class="hidden">
        <table id="tubingVolumes"><tbody></tbody></table>
        <span id="tubingTotalVolume">0</span>
        <span id="tubingAnnulusVolume">0</span>
      </section>
      <section id="upper_completion_results_section" class="hidden">
        <table id="upperCompletionVolumes"><tbody></tbody></table>
        <span id="ucTotalAbove">0</span>
        <span id="ucTotalBelow">0</span>
      </section>
      <span id="surface_casing_length_note"></span>
      <span id="intermediate_casing_length_note"></span>
      <span id="production_casing_length_note"></span>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
  });

  describe('renderResults()', () => {
    const mockResult = {
      casings: [
        {
          role: 'surface',
          name: 'Surface Casing',
          volume: 50.5,
          abovePlug: 25.25,
          belowPlug: 25.25,
          hidden: false
        },
        {
          role: 'production',
          name: 'Production Casing',
          volume: 100.75,
          abovePlug: 40.3,
          belowPlug: 60.45,
          hidden: false
        }
      ],
      total: {
        volume: 151.25,
        abovePlug: 65.55,
        belowPlug: 85.7
      },
      drillpipe: null,
      tubing: null
    };

    it('renders total volume', () => {
      renderResults(mockResult, {});
      const totalEl = document.getElementById('totalVolume');
      expect(totalEl.textContent).toContain('151');
    });

    it('renders plug above volume', () => {
      renderResults(mockResult, {});
      const aboveEl = document.getElementById('plugAboveVolume');
      expect(aboveEl.textContent).toContain('65');
    });

    it('renders plug below volume', () => {
      renderResults(mockResult, {});
      const belowEl = document.getElementById('plugBelowVolume');
      expect(belowEl.textContent).toContain('85');
    });

    it('renders casing rows in table', () => {
      renderResults(mockResult, {});
      const tbody = document.querySelector('#casingVolumes tbody');
      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it('hides drillpipe section when no drillpipe data', () => {
      renderResults(mockResult, {});
      const dpSection = document.getElementById('drillpipe_results_section');
      expect(dpSection.classList.contains('hidden')).toBe(true);
    });

    it('shows drillpipe section when drillpipe data present', () => {
      const resultWithDP = {
        ...mockResult,
        drillpipe: {
          dp: { volume: 20, abovePlug: 10, belowPlug: 10 },
          annulus: { volume: 30, abovePlug: 15, belowPlug: 15 }
        }
      };
      renderResults(resultWithDP, { mode: 'drillpipe' });
      const dpSection = document.getElementById('drillpipe_results_section');
      expect(dpSection.classList.contains('hidden')).toBe(false);
    });

    it('renders drillpipe volumes correctly', () => {
      const resultWithDP = {
        ...mockResult,
        drillpipe: {
          dp: { volume: 25.5, abovePlug: 12.75, belowPlug: 12.75 },
          annulus: { volume: 35.5, abovePlug: 17.75, belowPlug: 17.75 }
        }
      };
      renderResults(resultWithDP, { mode: 'drillpipe' });
      const dpVolume = document.getElementById('dpVolume');
      expect(dpVolume.textContent).toContain('25');
    });

    it('hides tubing section when no tubing data', () => {
      renderResults(mockResult, {});
      const tubingSection = document.getElementById('tubing_results_section');
      expect(tubingSection.classList.contains('hidden')).toBe(true);
    });

    it('shows tubing section when tubing data present', () => {
      const resultWithTubing = {
        ...mockResult,
        tubing: {
          tubings: [{ name: 'Tubing 1', volume: 15 }],
          annulus: { volume: 25 },
          total: 40
        }
      };
      renderResults(resultWithTubing, { mode: 'tubing' });
      const tubingSection = document.getElementById('tubing_results_section');
      expect(tubingSection.classList.contains('hidden')).toBe(false);
    });

    it('handles hidden casings', () => {
      const resultWithHidden = {
        ...mockResult,
        casings: [
          { ...mockResult.casings[0], hidden: true },
          mockResult.casings[1]
        ]
      };
      expect(() => renderResults(resultWithHidden, {})).not.toThrow();
    });

    it('handles empty casings array', () => {
      const emptyResult = {
        casings: [],
        total: { volume: 0, abovePlug: 0, belowPlug: 0 },
        drillpipe: null,
        tubing: null
      };
      expect(() => renderResults(emptyResult, {})).not.toThrow();
    });

    it('formats volumes to reasonable decimal places', () => {
      const preciseResult = {
        ...mockResult,
        total: {
          volume: 151.256789,
          abovePlug: 65.123456,
          belowPlug: 85.789012
        }
      };
      renderResults(preciseResult, {});
      const totalEl = document.getElementById('totalVolume');
      expect(totalEl.textContent.length).toBeLessThan(15);
    });
  });

  describe('renderUpperCompletionBreakdown()', () => {
    const mockBreakdown = {
      sections: [
        { name: 'UC Section 1', volume: 10, abovePlug: 5, belowPlug: 5 },
        { name: 'UC Section 2', volume: 20, abovePlug: 8, belowPlug: 12 }
      ],
      total: {
        volume: 30,
        abovePlug: 13,
        belowPlug: 17
      }
    };

    it('renders UC breakdown sections', () => {
      renderUpperCompletionBreakdown(mockBreakdown, 'tubing');
      const tbody = document.querySelector('#upperCompletionVolumes tbody');
      expect(tbody).not.toBeNull();
    });

    it('shows UC results section', () => {
      renderUpperCompletionBreakdown(mockBreakdown, 'tubing');
      const section = document.getElementById(
        'upper_completion_results_section'
      );
      expect(section.classList.contains('hidden')).toBe(false);
    });

    it('handles empty breakdown', () => {
      const emptyBreakdown = {
        sections: [],
        total: { volume: 0, abovePlug: 0, belowPlug: 0 }
      };
      expect(() =>
        renderUpperCompletionBreakdown(emptyBreakdown, 'tubing')
      ).not.toThrow();
    });

    it('renders above/below totals', () => {
      renderUpperCompletionBreakdown(mockBreakdown, 'tubing');
      const aboveEl = document.getElementById('ucTotalAbove');
      const belowEl = document.getElementById('ucTotalBelow');
      expect(aboveEl.textContent).toContain('13');
      expect(belowEl.textContent).toContain('17');
    });

    it('handles null breakdown gracefully', () => {
      expect(() =>
        renderUpperCompletionBreakdown(null, 'tubing')
      ).not.toThrow();
    });

    it('handles drillpipe mode', () => {
      expect(() =>
        renderUpperCompletionBreakdown(mockBreakdown, 'drillpipe')
      ).not.toThrow();
    });
  });
});
```

##### Step 6 Verification Checklist

- [ ] Run `npm test -- --run` - all tests pass
- [ ] Run `npm test -- --coverage` and verify `render.js` reaches 70%+ line coverage
- [ ] No build errors or console warnings

#### Step 6 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

#### Step 7: Sidebar & UI Module Tests

- [ ] Expand existing test file `src/js/__tests__/sidebar.unit.test.js`
- [ ] Copy and paste code below into `src/js/__tests__/sidebar.unit.test.js`:

```javascript
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeSidebar, setSection, getActiveSection } from '../sidebar.js';

describe('sidebar.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
    localStorage.clear();
    document.body.innerHTML = `
      <nav id="sidebar">
        <button class="nav-btn" data-section="casings">Casings</button>
        <button class="nav-btn" data-section="drillpipe">Drillpipe</button>
        <button class="nav-btn" data-section="tubing">Tubing</button>
        <button class="nav-btn" data-section="pressure">Pressure</button>
        <button class="nav-btn" data-section="results">Results</button>
      </nav>
      <main>
        <section class="app-view" data-view="casings">Casings Content</section>
        <section class="app-view hidden" data-view="drillpipe">Drillpipe Content</section>
        <section class="app-view hidden" data-view="tubing">Tubing Content</section>
        <section class="app-view hidden" data-view="pressure">Pressure Content</section>
        <section class="app-view hidden" data-view="results">Results Content</section>
      </main>
      <button id="mobile-nav-toggle">Menu</button>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
    localStorage.clear();
  });

  describe('initializeSidebar()', () => {
    it('initializes without errors', () => {
      expect(() => initializeSidebar()).not.toThrow();
    });

    it('sets default section to casings', () => {
      initializeSidebar();
      expect(getActiveSection()).toBe('casings');
    });

    it('restores section from localStorage if present', () => {
      localStorage.setItem('volumeCalc_activeSection', 'drillpipe');
      initializeSidebar();
      expect(getActiveSection()).toBe('drillpipe');
    });

    it('handles invalid localStorage section gracefully', () => {
      localStorage.setItem('volumeCalc_activeSection', 'invalid_section');
      initializeSidebar();
      expect(getActiveSection()).toBe('casings');
    });
  });

  describe('setSection()', () => {
    beforeEach(() => {
      initializeSidebar();
    });

    it('changes active section', () => {
      setSection('drillpipe', { focus: false });
      expect(getActiveSection()).toBe('drillpipe');
    });

    it('updates nav button active state', () => {
      setSection('drillpipe', { focus: false });
      const dpBtn = document.querySelector('[data-section="drillpipe"]');
      expect(dpBtn.classList.contains('active')).toBe(true);
    });

    it('removes active state from previous button', () => {
      setSection('drillpipe', { focus: false });
      const casingBtn = document.querySelector('[data-section="casings"]');
      expect(casingBtn.classList.contains('active')).toBe(false);
    });

    it('shows corresponding view section', () => {
      setSection('drillpipe', { focus: false });
      const dpView = document.querySelector('[data-view="drillpipe"]');
      expect(dpView.classList.contains('hidden')).toBe(false);
    });

    it('hides previous view section', () => {
      setSection('drillpipe', { focus: false });
      const casingView = document.querySelector('[data-view="casings"]');
      expect(casingView.classList.contains('hidden')).toBe(true);
    });

    it('saves section to localStorage', () => {
      setSection('tubing', { focus: false });
      expect(localStorage.getItem('volumeCalc_activeSection')).toBe('tubing');
    });

    it('dispatches keino:sectionchange event', () => {
      const handler = vi.fn();
      document.addEventListener('keino:sectionchange', handler);
      setSection('pressure', { focus: false });
      expect(handler).toHaveBeenCalled();
      document.removeEventListener('keino:sectionchange', handler);
    });

    it('handles invalid section name gracefully', () => {
      expect(() => setSection('nonexistent', { focus: false })).not.toThrow();
      expect(getActiveSection()).toBe('casings');
    });

    it('handles null options gracefully', () => {
      expect(() => setSection('drillpipe')).not.toThrow();
    });
  });

  describe('getActiveSection()', () => {
    it('returns current active section', () => {
      initializeSidebar();
      expect(getActiveSection()).toBe('casings');
    });

    it('updates after setSection call', () => {
      initializeSidebar();
      setSection('results', { focus: false });
      expect(getActiveSection()).toBe('results');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      initializeSidebar();
    });

    it('handles Enter key on nav button', () => {
      const dpBtn = document.querySelector('[data-section="drillpipe"]');
      dpBtn.focus();
      dpBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(getActiveSection()).toBe('drillpipe');
    });

    it('handles Space key on nav button', () => {
      const dpBtn = document.querySelector('[data-section="drillpipe"]');
      dpBtn.focus();
      dpBtn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(getActiveSection()).toBe('drillpipe');
    });
  });

  describe('Click Navigation', () => {
    beforeEach(() => {
      initializeSidebar();
    });

    it('changes section on button click', () => {
      const tubingBtn = document.querySelector('[data-section="tubing"]');
      tubingBtn.click();
      expect(getActiveSection()).toBe('tubing');
    });

    it('handles rapid consecutive clicks', () => {
      const buttons = document.querySelectorAll('.nav-btn');
      buttons.forEach((btn) => btn.click());
      expect(getActiveSection()).toBe('results');
    });
  });
});
```

- [ ] Expand existing or create test file `src/js/__tests__/ui.unit.test.js`
- [ ] Copy and paste code below into `src/js/__tests__/ui.unit.test.js`:

```javascript
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setupEventDelegation,
  setupCasingToggles,
  setupButtons,
  setupProductionToggleButtons,
  setupTooltips,
  checkUpperCompletionFit,
  initUI
} from '../ui.js';

describe('ui.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('setupEventDelegation()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="calculator-form">
          <input type="number" id="test_input" value="100" />
          <select id="test_select">
            <option value="1">One</option>
            <option value="2">Two</option>
          </select>
        </form>
      `;
    });

    it('sets up without errors', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      expect(() => setupEventDelegation(deps)).not.toThrow();
    });

    it('calls calculateVolume on input change', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupEventDelegation(deps);
      const input = document.getElementById('test_input');
      input.value = '200';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      vi.runAllTimers();
      expect(deps.calculateVolume).toHaveBeenCalled();
    });

    it('calls scheduleSave on input change', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupEventDelegation(deps);
      const input = document.getElementById('test_input');
      input.value = '300';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      vi.runAllTimers();
      expect(deps.scheduleSave).toHaveBeenCalled();
    });
  });

  describe('setupCasingToggles()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="surface_casing_section">
          <input type="checkbox" id="use_surface_casing" checked />
          <div class="casing-body"></div>
        </div>
        <div id="intermediate_casing_section">
          <input type="checkbox" id="use_intermediate_casing" />
          <div class="casing-body"></div>
        </div>
      `;
    });

    it('sets up without errors', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      expect(() => setupCasingToggles(deps)).not.toThrow();
    });

    it('toggles casing visibility on checkbox change', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupCasingToggles(deps);
      const checkbox = document.getElementById('use_intermediate_casing');
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      vi.runAllTimers();
      expect(deps.calculateVolume).toHaveBeenCalled();
    });
  });

  describe('setupButtons()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button id="calculate_btn">Calculate</button>
        <button id="reset_btn">Reset</button>
        <form id="calculator-form">
          <input id="test_input" value="100" />
        </form>
      `;
    });

    it('sets up without errors', () => {
      const deps = {
        calculateVolume: vi.fn(),
        resetForm: vi.fn()
      };
      expect(() => setupButtons(deps)).not.toThrow();
    });

    it('calls calculateVolume on calculate button click', () => {
      const deps = {
        calculateVolume: vi.fn(),
        resetForm: vi.fn()
      };
      setupButtons(deps);
      document.getElementById('calculate_btn').click();
      expect(deps.calculateVolume).toHaveBeenCalled();
    });

    it('calls resetForm on reset button click', () => {
      const deps = {
        calculateVolume: vi.fn(),
        resetForm: vi.fn()
      };
      setupButtons(deps);
      document.getElementById('reset_btn').click();
      expect(deps.resetForm).toHaveBeenCalled();
    });
  });

  describe('setupProductionToggleButtons()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="toggle-button-group">
          <button class="toggle-btn" data-mode="drillpipe">Drillpipe</button>
          <button class="toggle-btn" data-mode="tubing">Tubing</button>
        </div>
        <section id="drillpipe_section" class="hidden"></section>
        <section id="tubing_section" class="hidden"></section>
      `;
    });

    it('sets up without errors', () => {
      expect(() => setupProductionToggleButtons()).not.toThrow();
    });

    it('toggles between modes on button click', () => {
      setupProductionToggleButtons();
      const tubingBtn = document.querySelector('[data-mode="tubing"]');
      tubingBtn.click();
      expect(tubingBtn.classList.contains('active')).toBe(true);
    });
  });

  describe('setupTooltips()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <span class="tooltip-trigger" data-tooltip="Test tooltip">?</span>
        <div id="tooltip-container"></div>
      `;
    });

    it('sets up without errors', () => {
      expect(() => setupTooltips()).not.toThrow();
    });
  });

  describe('checkUpperCompletionFit()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="use_upper_completion" checked />
        <input id="upper_completion_size_id" value="4.892" />
        <input id="production_casing_size_id" value="6.184" />
        <div id="uc_fit_warning" class="hidden"></div>
        <div id="uc_fit_ok" class="hidden"></div>
      `;
    });

    it('executes without errors', () => {
      expect(() => checkUpperCompletionFit()).not.toThrow();
    });

    it('shows warning when UC does not fit', () => {
      document.getElementById('upper_completion_size_id').value = '7.0';
      document.getElementById('production_casing_size_id').value = '6.184';
      checkUpperCompletionFit();
      const warning = document.getElementById('uc_fit_warning');
      expect(warning.classList.contains('hidden')).toBe(false);
    });

    it('shows OK when UC fits', () => {
      document.getElementById('upper_completion_size_id').value = '4.892';
      document.getElementById('production_casing_size_id').value = '6.184';
      checkUpperCompletionFit();
      const ok = document.getElementById('uc_fit_ok');
      expect(ok.classList.contains('hidden')).toBe(false);
    });

    it('handles UC checkbox unchecked', () => {
      document.getElementById('use_upper_completion').checked = false;
      expect(() => checkUpperCompletionFit()).not.toThrow();
    });
  });

  describe('initUI()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="calculator-form">
          <input id="test_input" value="100" />
        </form>
        <button id="calculate_btn">Calculate</button>
        <button id="reset_btn">Reset</button>
        <nav id="sidebar">
          <button class="nav-btn" data-section="casings">Casings</button>
        </nav>
        <section class="app-view" data-view="casings"></section>
      `;
    });

    it('initializes UI without errors', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn(),
        resetForm: vi.fn()
      };
      expect(() => initUI(deps)).not.toThrow();
    });
  });
});
```

##### Step 7 Verification Checklist

- [ ] Run `npm test -- --run` - all tests pass
- [ ] Run `npm test -- --coverage` and verify:
  - `sidebar.js` reaches 85%+ line coverage
  - `ui.js` reaches 65%+ line coverage
- [ ] No build errors or console warnings

#### Step 7 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

#### Step 8: Coverage Verification & Gap Analysis

- [ ] Run full coverage report: `npm test -- --run --coverage`
- [ ] Open coverage report at `coverage/index.html` in browser
- [ ] Review each file for red-highlighted uncovered branches
- [ ] For any file below 70% coverage, add targeted tests for uncovered paths

**Gap Analysis Process:**

1. Identify files still below target coverage
2. Click into each file in coverage report
3. Find red-highlighted lines (uncovered code)
4. Add specific tests for those code paths
5. Re-run coverage to verify improvement

**Example targeted test pattern for uncovered branches:**

```javascript
// If coverage shows uncovered error handling:
it('handles specific error case', () => {
  // Setup conditions that trigger the error path
  // Assert expected behavior
});
```

##### Step 8 Verification Checklist

Final coverage metrics should show:

- [ ] Statement Coverage: 70%+
- [ ] Branch Coverage: 65%+
- [ ] Function Coverage: 75%+
- [ ] Line Coverage: 70%+
- [ ] No source file below 50% line coverage
- [ ] All tests pass: `npm test -- --run`

#### Step 8 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the final changes.

---

## Success Criteria

Upon completion of all steps:

- [ ] Overall line coverage ≥ 70%
- [ ] Overall branch coverage ≥ 65%
- [ ] No source file below 50% line coverage
- [ ] All tests pass (`npm test -- --run`)
- [ ] Coverage report generates without errors
- [ ] All commits made with descriptive messages

## Notes

- Tests follow established patterns from existing test files
- DOM mocking uses `beforeEach`/`afterEach` for isolation
- Canvas mocking stubs all required context methods
- localStorage is cleared between tests
- Fake timers used where debouncing/scheduling occurs
- All tests are self-contained and independent
