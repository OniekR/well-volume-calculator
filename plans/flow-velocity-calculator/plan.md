# Flow Velocity Calculator

**Branch:** `feature/flow-velocity-calculator`
**Description:** Adds flow velocity calculator that computes flow velocity in drill pipes/tubing and annuli between pipes and casings at all depths

## Goal

Create a comprehensive flow velocity calculator that takes a flow rate input (L/min) and calculates the velocity inside all drill pipe/tubing sections and in all annuli (space between pipe OD and casing ID) at every depth where casing configurations change. The feature should be accessible via a new "Flow Velocity" tab in the sidebar navigation, styled for excellent UX with an "Under Construction" indicator during development.

## Implementation Steps

### Step 1: Enable Flow Velocity Navigation Tab

**Files:** [src/js/sidebar.js](src/js/sidebar.js), [index.html](index.html)
**What:** Remove `disabled` and `aria-disabled` attributes from the Flow Velocity button in HTML, add `"flow"` to `KNOWN_SECTIONS` Set in sidebar.js, and add "🚧 Under Construction" badge to the button text or as a visual indicator. Reorder navigation so Flow Velocity appears between Completion and Settings.
**Testing:** Click Flow Velocity tab in sidebar, verify it becomes active and no console errors occur. Verify badge displays correctly. Verify order is: Casings → Completion → Flow Velocity → Settings.

### Step 2: Create Flow Velocity View HTML Structure

**Files:** [index.html](index.html), [src/css/style.css](src/css/style.css)
**What:** Add a new `<section id="view-flow" class="app-view" data-view="flow" hidden>` after the completion view. Include:

- Header with title and description
- Input section for flow rate (L/min) with number input, quick preset buttons (1000, 2000, 3000, 4000 L/min similar to the inspiration image)
- Display section showing selected drill pipe/tubing size and casing size(s)
- Results container for velocity calculations (initially hidden)
- Style the section using existing CSS patterns and variables for consistency

**Testing:** Navigate to Flow Velocity tab, verify layout displays correctly on desktop and mobile, verify responsive design works, verify styling matches other sections.

### Step 3: Create Flow Velocity Calculation Module

**Files:** [src/js/flow-velocity.js](src/js/flow-velocity.js) (new), [src/js/constants.js](src/js/constants.js)
**What:** Create `src/js/flow-velocity.js` module with:

- `MINIMUM_HOLE_CLEANING_VELOCITY` constant (0.8 m/s from inspiration image) added to constants.js
- `computeFlowVelocity(flowRateLpm, drillpipeInput, casingsInput, tubingInput)` function that:
  - Converts flow rate from L/min to m³/s
  - Determines active pipe (drillpipe vs tubing) at each depth segment
  - For each depth segment, identifies which casings are present
  - Calculates velocity inside the pipe: v_pipe = Q / A_pipe
  - Calculates velocity in each annulus: v_annulus = Q / (A_casing - A_pipe)
  - Returns structured results with velocities per segment for pipe and all annuli
- Unit conversion helper functions (L/min to m³/s, m/s to ft/s)
- Area calculation helper using pipe ID/OD in inches → area in m²
- Follow pure function pattern (no DOM access)

**Testing:** Write unit tests in `src/js/__tests__/flow-velocity.test.js` covering:

- Flow rate conversions (L/min → m³/s)
- Area calculations from diameters
- Velocity calculations for simple single-casing scenario
- Velocity calculations for multiple overlapping casings
- Edge cases: zero flow rate, missing pipe, no casings

### Step 4: Integrate Flow Velocity Calculation into Main Script

**Files:** [src/js/script.js](src/js/script.js), [src/js/flow-velocity.js](src/js/flow-velocity.js)
**What:**

- Import `computeFlowVelocity` from flow-velocity.js into script.js
- Add `gatherFlowVelocityInput()` function to flow-velocity.js that reads the flow rate input value
- Call flow velocity calculation in `calculateVolume()` function after volume calculations
- Pass drillpipe, tubing, and casings data to the calculation
- Store results for rendering

**Testing:** Enter flow rate, verify calculation runs without errors, use console logging to verify results structure is correct, verify calculation triggers on input change.

### Step 5: Render Flow Velocity Results

**Files:** [src/js/flow-velocity.js](src/js/flow-velocity.js), [index.html](index.html), [src/css/style.css](src/css/style.css)
**What:**

- Add `renderFlowVelocityResults(results)` function to flow-velocity.js
- Update results container in HTML to show:
  - Flow rate entered (with units)
  - Table/cards showing for each depth segment:
    - Depth range
    - Pipe velocity (m/s and ft/s)
    - Annulus velocity for each casing (with casing name/size, velocity in m/s and ft/s)
  - Highlight velocities below minimum hole cleaning velocity (0.8 m/s) in warning color
  - Summary statistics (average velocity, max velocity, min velocity)
- Style results table with existing CSS patterns
- Show/hide results container based on whether calculation succeeded

**Testing:** Enter flow rate, verify results display correctly, verify velocities are calculated for all casings, verify warning colors appear for low velocities, verify units display correctly, test with different pipe sizes and casing configurations.

### Step 6: Add Visual Schematic Similar to Inspiration

**Files:** [index.html](index.html), [src/css/style.css](src/css/style.css), [src/js/flow-velocity.js](src/js/flow-velocity.js)
**What:**

- Add a visual schematic section (similar to the "Well Schematic" in the inspiration image) showing:
  - Simplified well cross-section with pipe inside casing
  - UP arrow (red) showing annulus velocity
  - DOWN arrow (green) showing pipe interior velocity
  - Velocity values displayed next to arrows
  - Update schematic dynamically based on calculation results
- Use CSS for drawing or simple SVG/Canvas if needed
- Position schematic on the right side of results on desktop, below results on mobile
- Style to match application theme

**Testing:** Verify schematic displays correctly, verify velocities update when inputs change, verify colors match (red for UP/annulus, green for DOWN/pipe), verify responsive layout works.

### Step 7: Add Polish and Final UX Enhancements

**Files:** [src/css/style.css](src/css/style.css), [src/js/flow-velocity.js](src/js/flow-velocity.js), [index.html](index.html)
**What:**

- Add input validation: show error if flow rate is negative or zero
- Add informational tooltip/help text explaining what flow velocity means
- Add loading state indicators if calculations are heavy (likely not needed)
- Add smooth transitions when showing/hiding results
- Add "Copy Results" or "Export" functionality if useful
- Ensure keyboard navigation works properly
- Verify accessibility (ARIA labels, focus states, screen reader support)
- Add animation/transition effects for better UX
- Remove "🚧 Under Construction" badge after completion

**Testing:** Test all interactions, verify validation messages appear correctly, test keyboard navigation, test with screen reader if possible, verify smooth transitions, verify on different screen sizes and browsers.

## Clarification Needed

1. **Unit Options:** Should the flow rate input support multiple units (L/min, GPM, m³/h) or just L/min as specified? The inspiration image shows L/min only.
   Answer:

- Yes, you can create support for multiple units, L/min (as default), GPM, m3/h and BPM (barrels per minute)

2. **Tubing vs Drill Pipe Selection:** Should the calculator automatically detect whether drill pipe or tubing is being used based on which is configured in the app, or should there be an explicit selector in the Flow Velocity tab?
   Answer:

- It should automatically detect whether drill pipe or tubing is beind used based on on which is configured in the app.
- There should however be possibility for the user to change in this display (more for experiemental purposes and should not affect the configuration of the well)

3. **Depth Range:** Should the calculator show velocities for:

   - All depths where configuration changes (comprehensive)
   - Only specific depths the user selects (targeted)
   - Both options with a toggle
     Answer:

- Both options with a toggle.

4. **Canvas Integration:** Should the flow velocity results be visually indicated on the main well schematic canvas (the existing canvas that shows the well), or only in the Flow Velocity tab? The plan includes a separate schematic in the Flow Velocity tab.
   Answer:

- When in the 'Flow velocity' tab the flow velocity results should visually indicated on the main well schematic canvas.

5. **Multiple Pipes:** If the user has configured multiple drill pipe segments with different sizes, should the calculator:

   - Show velocity for each segment separately
   - Show average velocity across all segments
   - Both
     Answer:

- It should show velocity for each segment separately.

6. **Export/Reporting:** Do you want the ability to export flow velocity results to CSV/PDF/print format, or is on-screen display sufficient for now?
   Answer:

- No export is needed for flow velocity results.

7. **Preset Flow Rates:** The inspiration image shows preset buttons for 1000, 2000, 3000, 4000 L/min. Do you want:

   - These exact presets
   - Different preset values
   - Configurable presets
     Answer:

- These values are good, can also add 5000 l/min

8. **Velocity Threshold Customization:** The minimum hole cleaning velocity is 0.8 m/s in the inspiration image. Should this be:
   - Fixed at 0.8 m/s
   - Configurable by user
   - Different thresholds for different scenarios (drilling vs production vs circulation)

Please provide feedback on these points so I can refine the plan accordingly.
Answer:

- It should be fixed at 0.8 m/s.
