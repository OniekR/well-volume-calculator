# Tubing/Drillpipe Button State Persistence & Slider Accessibility

**Branch:** `tubing-dp-state-persistence`
**Description:** Persist tubing count button state and allow mode slider to work independently of the completion checkbox

## Goal

Enable the "Number of tubing sizes" buttons to persist their state across page reloads (matching the already-working drillpipe count behavior), and decouple the "Tubing - Drill pipe" slider from the "Upper completion/Drill pipe string" checkbox so users can switch modes without first enabling the completion section.

## Current State Analysis

| Element                                       | Currently Persisted?                                   |
| --------------------------------------------- | ------------------------------------------------------ |
| Number of tubing sizes buttons                | ❌ NO (inferred from saved tubing inputs, often wrong) |
| Number of drill pipe sizes buttons            | ✅ YES                                                 |
| Tubing - Drill pipe slider (`uc_mode_toggle`) | ✅ YES (but disabled when checkbox unchecked)          |

## Implementation Steps

### Step 1: Add explicit tubing count persistence

**Files:** [src/js/persistence.js](src/js/persistence.js)
**What:** Add explicit capture of `tubing_count` in `captureStateObject()` using the same pattern as `drillpipe_count`. Replace the inference-based restoration logic with explicit restoration using the saved `tubing_count` value.

**Changes:**

1. In `captureStateObject()` (~line 20-28): Add capture for `.tubing-count-btn.active` similar to the existing `.drillpipe-count-btn.active` pattern
2. In `applyStateObject()`: Remove the inference logic that counts tubing keys, replace with explicit restoration from `state.tubing_count`

**Testing:**

- Select "2 Tubings" or "3 Tubings", reload page → verify the same button is active
- Verify existing drillpipe count persistence still works

### Step 2: Enable slider when completion checkbox is unchecked

**Files:** [src/js/ui.js](src/js/ui.js)
**What:** Modify the `toggleSectionByCheckbox()` handler to NOT disable the `uc_mode_toggle` slider when `use_upper_completion` is unchecked. The slider should remain functional to allow users to pre-select their preferred mode.

**Changes:**

1. Remove or modify the line `modeToggle.disabled = !isEnabled;` (~line 63 in the special handling for `use_upper_completion`)
2. The slider should continue to toggle between tubing/drillpipe sections visually, but inputs remain disabled until the checkbox is checked

**Testing:**

- Uncheck "Upper completion/Drill pipe string" checkbox
- Verify the "Tubing - Drill pipe" slider is still clickable and functional
- Toggle the slider → verify it switches which section is visible (tubing vs drill pipe)
- Check the checkbox → verify the now-visible section's inputs become enabled
- Verify slider state persists across page reloads when checkbox is unchecked

### Step 3: Add unit tests for new behavior

**Files:** [src/js/**tests**/persistence.test.js](src/js/__tests__/persistence.test.js) (or new test file)
**What:** Add tests to verify:

1. `tubing_count` is captured in state
2. `tubing_count` is restored correctly on page load
3. Slider remains enabled when `use_upper_completion` is unchecked
4. Slider state persists when checkbox state changes

**Testing:** Run `npm test` and verify all new tests pass

## Questions for Clarification

1. **Slider behavior when checkbox unchecked:** When the completion checkbox is unchecked and the user toggles the slider, should the tubing/drillpipe sections:
   - **Option A:** Still visually switch (show one, hide the other) but with inputs disabled?
   - **Option B:** Just remember the preference without any visual change until checkbox is checked?
   [NEEDS CLARIFICATION] - I'm assuming Option A based on your request, but please confirm.
   Answer:

- No, when the checkbox is unchecked, just remember the preference without any visual change until checkbox is checked.

2. **Edge case - checkbox toggled off with active inputs:** If a user has filled in tubing values, unchecks the completion checkbox, toggles to drill pipe, then re-checks the checkbox:
   - Should the tubing values be preserved?
   - Should they see the drill pipe section (now empty) or revert to tubing?
   [NEEDS CLARIFICATION] - Current behavior would show drill pipe. Is this acceptable?
   Answer:

- As it is currently, it is not possible to toggle to drill pipe when the checkbox is unchecked. Therefore, if the user has filled in tubing values, unchecks the completion checkbox, toggles to drill pipe, then re-recheck the checkbox - The tubing values be preserved (but in an inactive state) and they should see the drill pipe section.
