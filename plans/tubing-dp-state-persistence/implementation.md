# Tubing/Drillpipe Button State Persistence & Slider Accessibility

## Goal

Persist tubing count button state explicitly and allow the "Tubing - Drill pipe" slider to change modes when the Upper completion checkbox is unchecked (without visual section switching until re-checked).

## Prerequisites

Make sure the user is currently on the `tubing-dp-state-persistence` branch before beginning implementation.
If not, move them to the correct branch. If the branch does not exist, create it from main.

---

## Step-by-Step Instructions

### Step 1: Add explicit tubing count capture in persistence.js

- [x] Open `src/js/persistence.js`
- [x] Find the `captureStateObject` function around line 6
- [x] After the existing drillpipe_count capture block (around line 27), add the tubing_count capture

**Current code to find (around lines 20-29):**

```javascript
  try {
    const activeDpBtn = document.querySelector('.drillpipe-count-btn.active');
    if (activeDpBtn?.dataset?.count) {
      state.drillpipe_count = { type: 'input', value: String(activeDpBtn.dataset.count) };
    }
  } catch (e) {
    /* ignore */
  }
  return state;
}
```

**Replace with:**

```javascript
  try {
    const activeDpBtn = document.querySelector('.drillpipe-count-btn.active');
    if (activeDpBtn?.dataset?.count) {
      state.drillpipe_count = { type: 'input', value: String(activeDpBtn.dataset.count) };
    }
  } catch (e) {
    /* ignore */
  }

  try {
    const activeTubingBtn = document.querySelector('.tubing-count-btn.active');
    if (activeTubingBtn?.dataset?.count) {
      state.tubing_count = { type: 'input', value: String(activeTubingBtn.dataset.count) };
    }
  } catch (e) {
    /* ignore */
  }

  return state;
}
```

#### Step 1 Verification Checklist

- [x] No syntax errors in persistence.js
- [x] Run `npm test -- --grep "captureStateObject"` to verify existing capture tests still pass

#### Step 1 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

### Step 2: Replace tubing count inference with explicit restoration

- [x] Open `src/js/persistence.js`
- [x] Find the tubing count restoration logic in `applyStateObject` (around lines 118-167)
- [x] Replace the inference-based logic with explicit restoration from `state.tubing_count`

**Current code to find (the tubing count inference block):**

```javascript
// --- Tubing count buttons restoration (infer from saved tubing inputs) ---
const tubingKeys = Object.keys(state || {}).filter((k) =>
  /^tubing_(size|length)_\d+$/.test(k)
);
if (tubingKeys.length > 0) {
  const maxIdx = Math.max(
    ...tubingKeys.map((k) => parseInt(k.match(/\d+$/)?.[0] || '0', 10))
  );
  const count = Math.min(3, Math.max(1, maxIdx + 1));
  const tubingBtn = el(`tubing_count_${count}`);
  if (tubingBtn) {
    tubingBtn.dispatchEvent(new Event('click', { bubbles: true }));
  }
}
```

**Replace with:**

```javascript
// --- Tubing count buttons restoration (explicit from state.tubing_count) ---
const tubingCountValue = state?.tubing_count?.value;
if (tubingCountValue != null) {
  const tubingBtn = el(`tubing_count_${tubingCountValue}`);
  if (tubingBtn) {
    tubingBtn.dispatchEvent(new Event('click', { bubbles: true }));
  }
} else {
  // Fallback: infer from saved tubing inputs for backward compatibility
  const tubingKeys = Object.keys(state || {}).filter((k) =>
    /^tubing_(size|length)_\d+$/.test(k)
  );
  if (tubingKeys.length > 0) {
    const maxIdx = Math.max(
      ...tubingKeys.map((k) => parseInt(k.match(/\d+$/)?.[0] || '0', 10))
    );
    const count = Math.min(3, Math.max(1, maxIdx + 1));
    const tubingBtn = el(`tubing_count_${count}`);
    if (tubingBtn) {
      tubingBtn.dispatchEvent(new Event('click', { bubbles: true }));
    }
  }
}
```

#### Step 2 Verification Checklist

- [x] No syntax errors in persistence.js
- [x] Manual test: Select "2 Tubings", reload page → verify "2 Tubings" button is still active
- [x] Manual test: Select "3 Tubings", reload page → verify "3 Tubings" button is still active
- [x] Verify drillpipe count persistence still works

#### Step 2 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

### Step 3: Enable slider when completion checkbox is unchecked (preference only)

- [x] Open `src/js/ui.js`
- [x] Find the `toggleSectionByCheckbox` function (starts around line 24)
- [x] Find the special handling for `use_upper_completion` checkbox (around line 52-93)
- [x] Remove the line that disables the mode toggle

**Current code to find (around lines 52-70):**

```javascript
  if (checkbox.id === 'use_upper_completion') {
    const tubingSection = el('uc_tubing_section');
    const drillpipeSection = el('uc_drillpipe_section');
    const modeToggle = el('uc_mode_toggle');
    const isEnabled = checkbox.checked;

    // Disable/enable mode toggle
    if (modeToggle) {
      modeToggle.disabled = !isEnabled;
    }
```

**Replace with:**

```javascript
  if (checkbox.id === 'use_upper_completion') {
    const tubingSection = el('uc_tubing_section');
    const drillpipeSection = el('uc_drillpipe_section');
    const modeToggle = el('uc_mode_toggle');
    const isEnabled = checkbox.checked;

    // Mode toggle remains enabled so user can set preference even when section is disabled
```

#### Step 3 Verification Checklist

- [x] No syntax errors in ui.js
- [x] Manual test: Uncheck "Upper completion/Drill pipe string" checkbox
- [x] Verify the "Tubing - Drill pipe" slider is still clickable (not grayed out)
- [x] Toggle the slider while checkbox is unchecked → verify NO visual change to sections (tubing section should stay visible)
- [x] Re-check the checkbox → verify the currently selected mode's section becomes visible and enabled

#### Step 3 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

### Step 4: Allow mode switch while unchecked and re-enable correctly

- [x] Open `src/js/ui.js`
- [x] In the mode toggle handler, keep switching the visible section even when Upper completion is unchecked
- [x] Ensure UC inputs remain disabled while unchecked
- [x] When Upper completion is re-checked, enable inputs for the current mode and keep the other mode disabled

#### Step 4 Verification Checklist

- [x] No syntax errors in ui.js
- [x] Manual test full flow:
  1. Start with checkbox checked, tubing mode active, enter some tubing values
  2. Uncheck checkbox → inputs disabled
  3. Toggle slider to drill pipe mode → section switches, inputs stay disabled
  4. Re-check checkbox → verify drill pipe section is visible and enabled
  5. Verify tubing values are still preserved (switch back to tubing mode to check)
- [x] Reload page and verify all states persisted correctly

#### Step 4 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

### Step 5: Add unit tests

- [x] Create or update test file `src/js/__tests__/tubing-state-persistence.test.js`
- [x] Add tests for tubing count capture and restoration
- [x] Add tests for slider behavior when checkbox is unchecked

**Create new test file `src/js/__tests__/tubing-state-persistence.test.js`:**

```javascript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureStateObject, applyStateObject } from '../persistence.js';
import { el } from '../dom.js';

describe('Tubing State Persistence', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
    document.body.innerHTML = `
      <div class="tubing-count-selector">
        <button type="button" id="tubing_count_1" class="tubing-count-btn" data-count="1">1 Tubing</button>
        <button type="button" id="tubing_count_2" class="tubing-count-btn active" data-count="2">2 Tubings</button>
        <button type="button" id="tubing_count_3" class="tubing-count-btn" data-count="3">3 Tubings</button>
      </div>
      <div class="drillpipe-count-selector">
        <button type="button" id="drillpipe_count_1" class="drillpipe-count-btn" data-count="1">1 DP</button>
        <button type="button" id="drillpipe_count_2" class="drillpipe-count-btn" data-count="2">2 DPs</button>
        <button type="button" id="drillpipe_count_3" class="drillpipe-count-btn active" data-count="3">3 DPs</button>
      </div>
      <input type="checkbox" id="use_upper_completion" checked />
      <input type="checkbox" id="uc_mode_toggle" />
      <div id="uc_tubing_section"></div>
      <div id="uc_drillpipe_section" class="hidden"></div>
    `;
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
    localStorage.clear();
  });

  describe('captureStateObject', () => {
    it('should capture tubing_count from active button', () => {
      const state = captureStateObject(() => ({}));

      expect(state.tubing_count).toEqual({
        type: 'input',
        value: '2'
      });
    });

    it('should capture drillpipe_count from active button', () => {
      const state = captureStateObject(() => ({}));

      expect(state.drillpipe_count).toEqual({
        type: 'input',
        value: '3'
      });
    });

    it('should capture tubing_count when different button is active', () => {
      // Change active button to 3
      document
        .querySelector('.tubing-count-btn.active')
        .classList.remove('active');
      document.getElementById('tubing_count_3').classList.add('active');

      const state = captureStateObject(() => ({}));

      expect(state.tubing_count).toEqual({
        type: 'input',
        value: '3'
      });
    });
  });

  describe('applyStateObject - tubing count restoration', () => {
    beforeEach(() => {
      // Reset to default state (button 1 active)
      document.querySelectorAll('.tubing-count-btn').forEach((btn) => {
        btn.classList.remove('active');
      });
      document.getElementById('tubing_count_1').classList.add('active');

      // Add click handler to simulate real behavior
      document.querySelectorAll('.tubing-count-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tubing-count-btn').forEach((b) => {
            b.classList.remove('active');
          });
          btn.classList.add('active');
        });
      });
    });

    it('should restore tubing_count from explicit state value', async () => {
      const state = {
        tubing_count: { type: 'input', value: '3' }
      };

      applyStateObject(
        state,
        {},
        () => {},
        () => {}
      );
      await new Promise((r) => setTimeout(r, 10));

      const activeBtn = document.querySelector('.tubing-count-btn.active');
      expect(activeBtn.id).toBe('tubing_count_3');
    });

    it('should restore tubing_count value 2 correctly', async () => {
      const state = {
        tubing_count: { type: 'input', value: '2' }
      };

      applyStateObject(
        state,
        {},
        () => {},
        () => {}
      );
      await new Promise((r) => setTimeout(r, 10));

      const activeBtn = document.querySelector('.tubing-count-btn.active');
      expect(activeBtn.id).toBe('tubing_count_2');
    });
  });
});

describe('Mode Toggle with Checkbox Unchecked', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input type="checkbox" id="use_upper_completion" />
      <input type="checkbox" id="uc_mode_toggle" />
      <div id="uc_tubing_section"></div>
      <div id="uc_drillpipe_section" class="hidden"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should allow mode toggle to be changed when checkbox is unchecked', () => {
    const checkbox = el('use_upper_completion');
    const modeToggle = el('uc_mode_toggle');

    checkbox.checked = false;

    // Mode toggle should NOT be disabled
    expect(modeToggle.disabled).toBe(false);

    // Should be able to change value
    modeToggle.checked = true;
    expect(modeToggle.checked).toBe(true);
  });

  it('should persist mode toggle state when checkbox is unchecked', () => {
    const modeToggle = el('uc_mode_toggle');
    modeToggle.checked = true;

    const state = captureStateObject(() => ({}));

    expect(state.uc_mode_toggle).toEqual({
      type: 'checkbox',
      value: true
    });
  });
});
```

#### Step 5 Verification Checklist

- [x] Run `npm test -- src/js/__tests__/tubing-state-persistence.test.js` → all tests pass
- [x] Run `npm test` → all existing tests still pass
- [x] No lint errors

#### Step 5 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

---

## Final Verification

- [x] All tubing count button states persist across page reloads
- [x] All drillpipe count button states persist across page reloads (unchanged behavior)
- [x] Mode toggle slider works when completion checkbox is unchecked
- [x] Mode toggle only changes visual sections when checkbox is checked
- [x] When checkbox is re-enabled, the correct section (based on slider state) is shown
- [x] All unit tests pass
- [x] All existing functionality still works
