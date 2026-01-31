# Test Coverage Expansion to 70-80%

**Branch:** `test-coverage-expansion`
**Description:** Increase project test coverage from ~54% to 70-80% by adding comprehensive unit tests for under-tested modules.

## Goal

Dramatically improve test coverage across the codebase to ensure reliability and catch regressions. Currently at ~54% line coverage, targeting 70-80%. Focus on high-value, under-tested modules first, prioritizing pure logic functions before DOM-heavy code.

## Current State

| Metric             | Current | Target |
| ------------------ | ------- | ------ |
| Statement Coverage | 53.71%  | 70-80% |
| Branch Coverage    | 46.07%  | 65-75% |
| Function Coverage  | 56.5%   | 75-85% |
| Line Coverage      | 55.23%  | 70-80% |

## Priority Files (Ordered by Impact)

| File        | Current Lines | Target | Difficulty                    |
| ----------- | ------------- | ------ | ----------------------------- |
| tubing.js   | 20%           | 70%+   | Medium (DOM)                  |
| presets.js  | 28.44%        | 75%+   | Medium (localStorage + fetch) |
| dom.js      | 33.33%        | 90%+   | Easy (utilities)              |
| storage.js  | 57.14%        | 90%+   | Easy (localStorage)           |
| draw.js     | 47.39%        | 65%+   | Hard (Canvas API)             |
| pressure.js | 41.47%        | 75%+   | Medium (DOM + logic)          |
| render.js   | 53.14%        | 70%+   | Medium (DOM)                  |
| sidebar.js  | 72.09%        | 85%+   | Easy (edge cases)             |
| ui.js       | 47.73%        | 65%+   | Medium (DOM)                  |

---

## Implementation Steps

### Step 1: Test Infrastructure & Quick Wins (dom.js, storage.js)

**Files:**

- `src/js/__tests__/dom.unit.test.js` (new)
- `src/js/__tests__/storage.unit.test.js` (expand)

**What:** Start with the easiest wins—pure utility functions in `dom.js` and the simple localStorage wrapper in `storage.js`. These have minimal dependencies and straightforward testing patterns.

**Tests to Add:**

For `dom.js` (currently 33.33%):

- `getEl()` - element retrieval
- `setVal()` - value setting
- `getVal()` - value retrieval with parsing
- Edge cases: missing elements, invalid selectors

For `storage.js` (currently 57.14%):

- `save()` - saves to localStorage
- `load()` - loads from localStorage
- `remove()` - removes from localStorage
- Edge cases: localStorage unavailable, invalid JSON, missing keys

**Testing:** Run `npm test -- --coverage` and verify:

- `dom.js` reaches 90%+ coverage
- `storage.js` reaches 90%+ coverage

---

### Step 2: Tubing Module Tests

**Files:**

- `src/js/__tests__/tubing.unit.test.js` (new or expand)

**What:** `tubing.js` is at critical 20% coverage. Test the core calculation and data-gathering functions, mocking DOM inputs where needed.

**Tests to Add:**

- `gatherTubingInputs()` - gather inputs from DOM
- `computeTubingBreakdown()` - calculate volumes per section
- `computeTubingTotals()` - sum up totals
- `renderTubingBreakdown()` - verify DOM updates
- `renderTubingTotals()` - verify totals display
- Edge cases: empty inputs, zero lengths, invalid data

**DOM Mocking Pattern:**

```javascript
beforeEach(() => {
  document.body.innerHTML = `
    <input id="tubing-od-1" value="2.375" />
    <input id="tubing-id-1" value="1.995" />
    <input id="tubing-len-1" value="1000" />
    <!-- etc -->
  `;
});
```

**Testing:** Run `npm test -- --coverage` and verify `tubing.js` reaches 70%+ coverage

---

### Step 3: Presets Module Tests

**Files:**

- `src/js/__tests__/presets.unit.test.js` (new or expand)

**What:** `presets.js` handles saving/loading well configurations. Test core CRUD operations with mocked localStorage and fetch.

**Tests to Add:**

- `savePreset()` - saves preset to localStorage
- `loadPreset()` - loads and applies preset
- `deletePreset()` - removes preset
- `getPreset()` - retrieves single preset
- `getAllPresets()` - retrieves all presets
- `exportPresets()` - exports as JSON
- `importPresets()` - imports from JSON
- `loadBuiltInPresets()` - fetches from server (mock fetch)
- Edge cases: duplicate names, invalid data, fetch failures

**Mocking Pattern:**

```javascript
import { vi } from 'vitest';

beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(
    JSON.stringify(mockPresets)
  );
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(mockData) })
  );
});
```

**Testing:** Run `npm test -- --coverage` and verify `presets.js` reaches 75%+ coverage

---

### Step 4: Pressure Module Tests

**Files:**

- `src/js/__tests__/pressure.unit.test.js` (expand existing)

**What:** Expand tests for pressure calculation functions. Core math is partially tested; add UI functions and edge cases.

**Tests to Add:**

- `calculatePressureTest()` - core calculation (expand edge cases)
- `renderPressureResults()` - DOM rendering
- `gatherPressureInputs()` - input collection
- `setupPressureHandlers()` - event handler setup
- Edge cases: zero volumes, extreme pressures, invalid inputs

**Testing:** Run `npm test -- --coverage` and verify `pressure.js` reaches 75%+ coverage

---

### Step 5: Draw Module Tests

**Files:**

- `src/js/__tests__/draw.unit.test.js` (new or expand)

**What:** `draw.js` handles canvas schematic drawing. Test initialization, resize logic, and coordinate calculations. Full canvas rendering is complex but setup/config can be tested.

**Tests to Add:**

- `initCanvas()` - canvas initialization
- `resizeCanvas()` - responsive resizing
- `calculateDrawingCoordinates()` - coordinate math (pure function)
- `clearCanvas()` - clearing logic
- Drawing helper functions (colors, dimensions)
- Edge cases: missing canvas, zero dimensions

**Canvas Mocking:**

```javascript
beforeEach(() => {
  document.body.innerHTML = '<canvas id="schematic"></canvas>';
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn()
    // ... other canvas methods
  }));
});
```

**Testing:** Run `npm test -- --coverage` and verify `draw.js` reaches 65%+ coverage

---

### Step 6: Render Module Tests

**Files:**

- `src/js/__tests__/render.unit.test.js` (expand existing)

**What:** Expand render.js tests for result display functions.

**Tests to Add:**

- `renderCasingResults()` - casing volume display
- `renderDrillpipeResults()` - drillpipe results
- `renderTotalResults()` - totals calculation and display
- `updateResultsVisibility()` - show/hide logic
- `formatVolume()` - number formatting
- Edge cases: empty results, null values, extreme numbers

**Testing:** Run `npm test -- --coverage` and verify `render.js` reaches 70%+ coverage

---

### Step 7: Sidebar & UI Module Tests

**Files:**

- `src/js/__tests__/sidebar.unit.test.js` (expand existing)
- `src/js/__tests__/ui.unit.test.js` (expand existing)

**What:** Add edge cases and missing function coverage for sidebar navigation and UI event handling.

**Tests to Add for sidebar.js:**

- Keyboard navigation (Enter, Escape keys)
- Section collapse/expand edge cases
- Multiple rapid clicks
- Invalid section IDs

**Tests to Add for ui.js:**

- `setupEventHandlers()` - handler registration
- `handleCalculate()` - main calculation trigger
- `handleReset()` - form reset
- `handleInputChange()` - debounced input handling
- Form validation integration

**Testing:** Run `npm test -- --coverage` and verify:

- `sidebar.js` reaches 85%+ coverage
- `ui.js` reaches 65%+ coverage

---

### Step 8: Coverage Verification & Gap Analysis

**Files:**

- Coverage reports

**What:** Run full coverage report, identify any remaining gaps below 70%, and add targeted tests for uncovered branches.

**Actions:**

1. Run `npm test -- --coverage`
2. Review HTML coverage report in `coverage/index.html`
3. Identify uncovered branches (red highlights)
4. Add targeted tests for critical uncovered paths
5. Document any intentionally untested code (e.g., error handlers for impossible states)

**Testing:** Final coverage metrics should show:

- Statement Coverage: 70%+
- Branch Coverage: 65%+
- Function Coverage: 75%+
- Line Coverage: 70%+

---

## Questions for Clarification

1. **[NEEDS CLARIFICATION]** Should we add integration tests (multiple modules working together) or focus purely on unit tests?
   Answer:

- Unit tests for now

2. **[NEEDS CLARIFICATION]** Are there specific edge cases or bug scenarios from production that should be prioritized for testing?
   Answer:

- No

3. **[NEEDS CLARIFICATION]** For canvas drawing (`draw.js`), should we invest in comprehensive visual testing, or is testing setup/coordinates sufficient?
   Answer:

- Setup/coordinates sufficient

4. **[NEEDS CLARIFICATION]** Should snapshot testing be considered for DOM rendering functions?
   Answer:

- Use Small Snapshots: Don't snapshot the entire page. Snapshot small, reusable functions from dom.js or specific UI components to make failures easier to debug.
- Combine with Logic Tests: Use snapshots for the "look" of the DOM, but keep using standard unit tests for files like flow-velocity.js (41.47%) and pressure.js (47.39%), where the actual math matters more than the visual output.

---

## Estimated Effort

| Step                        | Estimated Tests | Effort       |
| --------------------------- | --------------- | ------------ |
| Step 1: dom.js + storage.js | ~15 tests       | Small        |
| Step 2: tubing.js           | ~20 tests       | Medium       |
| Step 3: presets.js          | ~25 tests       | Medium       |
| Step 4: pressure.js         | ~15 tests       | Medium       |
| Step 5: draw.js             | ~20 tests       | Medium-Large |
| Step 6: render.js           | ~15 tests       | Medium       |
| Step 7: sidebar.js + ui.js  | ~20 tests       | Medium       |
| Step 8: Gap analysis        | ~10-20 tests    | Small        |

**Total: ~140-150 new tests**

---

## Success Criteria

- [ ] Overall line coverage ≥ 70%
- [ ] Overall branch coverage ≥ 65%
- [ ] No source file below 50% line coverage
- [ ] All tests pass (`npm test`)
- [ ] Coverage report generates without errors
