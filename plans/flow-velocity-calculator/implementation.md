# Flow Velocity Calculator

## Goal

Add a Flow Velocity tab that calculates and displays pipe/annulus velocities across all casing transitions (or a single selected depth) with unit support (L/min, GPM, m³/h, BPM), low-velocity warnings, and schematic overlays on the main well canvas.

## Prerequisites

Make sure that the use is currently on the `feature/flow-velocity-calculator` branch before beginning implementation.
If not, move them to the correct branch. If the branch does not exist, create it from main.

### Step-by-Step Instructions

#### Step 1: Enable Flow Velocity navigation tab

- [x] Update the main navigation list to include Flow Velocity between Completion and Settings. Copy and paste the block below into `index.html` by replacing the existing Navigation `<ul>`:

```html
<ul class="sidebar-nav-list" role="list" aria-labelledby="nav-section-label">
  <li class="sidebar-nav-item" role="listitem">
    <button
      class="sidebar-nav-button"
      data-section="casings"
      aria-label="Navigate to Casings section"
      role="button"
    >
      <svg
        class="sidebar-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
        />
      </svg>
      <span class="sidebar-nav-text">Casings</span>
    </button>
  </li>
  <li class="sidebar-nav-item" role="listitem">
    <button
      class="sidebar-nav-button"
      data-section="completion"
      aria-label="Navigate to Completion and Drillpipe section"
      role="button"
    >
      <svg
        class="sidebar-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
        />
      </svg>
      <span class="sidebar-nav-text">Completion</span>
    </button>
  </li>
  <li class="sidebar-nav-item" role="listitem">
    <button
      class="sidebar-nav-button"
      data-section="flow"
      aria-label="Navigate to Flow Velocity section"
      role="button"
    >
      <svg
        class="sidebar-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-4-4h3V9h2v4h3l-4 4z"
        />
      </svg>
      <span class="sidebar-nav-text"
        >Flow Velocity
        <span class="badge badge--construction">🚧 Under Construction</span>
      </span>
    </button>
  </li>
  <li class="sidebar-nav-item" role="listitem">
    <button
      class="sidebar-nav-button"
      data-section="settings"
      aria-label="Navigate to Settings section"
      role="button"
    >
      <svg
        class="sidebar-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
        />
      </svg>
      <span class="sidebar-nav-text">Settings</span>
    </button>
  </li>
</ul>
```

- [x] Remove Flow Velocity from the Coming Soon list by replacing that `<ul>` in `index.html` with:

```html
<ul class="sidebar-nav-list" role="list" aria-labelledby="future-section-label">
  <li class="sidebar-nav-item" role="listitem">
    <button
      class="sidebar-nav-button"
      data-section="pressure"
      aria-label="Volume pressure calculator (coming soon)"
      disabled
      aria-disabled="true"
    >
      <svg
        class="sidebar-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
        />
      </svg>
      <span class="sidebar-nav-text">Pressure</span>
    </button>
  </li>
  <li class="sidebar-nav-item" role="listitem">
    <button
      class="sidebar-nav-button"
      data-section="lift"
      aria-label="String lift calculator (coming soon)"
      disabled
      aria-disabled="true"
    >
      <svg
        class="sidebar-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
        />
      </svg>
      <span class="sidebar-nav-text">String Lift</span>
    </button>
  </li>
  <li class="sidebar-nav-item" role="listitem">
    <button
      class="sidebar-nav-button"
      data-section="cement"
      aria-label="Cement displacement calculator (coming soon)"
      disabled
      aria-disabled="true"
    >
      <svg
        class="sidebar-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7V7h2v10zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
        />
      </svg>
      <span class="sidebar-nav-text">Cement</span>
    </button>
  </li>
</ul>
```

- [x] Update the known sections in `src/js/sidebar.js`:

```javascript
const DEFAULT_SECTION = 'casings';
const KNOWN_SECTIONS = new Set(['casings', 'completion', 'flow', 'settings']);
```

- [x] Add a construction badge style in `src/css/style.css` near the sidebar styles:

```css
.sidebar-nav-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  background: rgba(227, 27, 35, 0.12);
  color: var(--equinor-red);
}

.badge--construction {
  background: rgba(255, 193, 7, 0.18);
  color: #b85c00;
}

[data-theme='dark'] .badge--construction {
  background: rgba(255, 193, 7, 0.2);
  color: #ffd57a;
}
```

##### Step 1 Verification Checklist

- [ ] Flow Velocity appears between Completion and Settings in the sidebar.
- [ ] The Flow Velocity button is enabled and shows the Under Construction badge.
- [ ] No console errors occur when clicking the Flow Velocity tab.

#### Step 1 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 2: Create Flow Velocity view HTML structure and styling

- [ ] Add the Flow Velocity view after the completion section in `index.html` by inserting the block below right before the existing `<section id="view-settings" ...>`:

```html
<section
  id="view-flow"
  class="app-view"
  data-view="flow"
  aria-label="Flow Velocity"
  hidden
>
  <div class="flow-header">
    <h2>Flow Velocity</h2>
    <p class="small-note">
      Calculate inside-pipe and annulus velocities at each casing transition or
      at a single selected depth.
    </p>
  </div>

  <div class="flow-card">
    <div class="input-row three-cols flow-input-row">
      <div class="input-inline">
        <label for="flow_rate">Flow rate</label>
        <input
          type="number"
          id="flow_rate"
          name="flow_rate"
          step="1"
          min="0"
          placeholder="0"
        />
      </div>
      <div class="input-inline">
        <label for="flow_rate_unit">Unit</label>
        <select id="flow_rate_unit" name="flow_rate_unit">
          <option value="lpm">L/min</option>
          <option value="gpm">GPM</option>
          <option value="m3h">m³/h</option>
          <option value="bpm">BPM</option>
        </select>
      </div>
      <div class="input-inline">
        <label>Presets (L/min)</label>
        <div class="flow-quick-buttons">
          <button type="button" class="flow-quick-btn" data-flow-lpm="1000">
            1000
          </button>
          <button type="button" class="flow-quick-btn" data-flow-lpm="2000">
            2000
          </button>
          <button type="button" class="flow-quick-btn" data-flow-lpm="3000">
            3000
          </button>
          <button type="button" class="flow-quick-btn" data-flow-lpm="4000">
            4000
          </button>
          <button type="button" class="flow-quick-btn" data-flow-lpm="5000">
            5000
          </button>
        </div>
      </div>
    </div>

    <div
      id="flow-rate-error"
      class="small-note warning hidden"
      role="alert"
    ></div>

    <div class="input-row three-cols flow-input-row">
      <div class="input-inline">
        <label for="flow_pipe_mode_override">Pipe selection</label>
        <select id="flow_pipe_mode_override" name="flow_pipe_mode_override">
          <option value="auto">Auto (use configured mode)</option>
          <option value="tubing">Tubing</option>
          <option value="drillpipe">Drill pipe</option>
        </select>
        <div id="flow-pipe-mode-note" class="small-note">
          This only affects Flow Velocity calculations.
        </div>
      </div>
      <div class="input-inline">
        <label>Depth mode</label>
        <div
          class="toggle-inline flow-toggle-group"
          role="group"
          aria-label="Flow depth mode"
        >
          <label class="inline-checkbox">
            <input
              type="radio"
              id="flow_depth_mode_all"
              name="flow_depth_mode"
              checked
            />
            All depths
          </label>
          <label class="inline-checkbox">
            <input
              type="radio"
              id="flow_depth_mode_single"
              name="flow_depth_mode"
            />
            Single depth
          </label>
        </div>
      </div>
      <div class="input-inline" id="flow-depth-input" hidden>
        <label for="flow_depth_value">Depth (m)</label>
        <input
          type="number"
          id="flow_depth_value"
          name="flow_depth_value"
          step="1"
          min="0"
          placeholder="0"
        />
        <div class="casing-footer-row">
          <button
            type="button"
            class="wellhead-btn flow-depth-btn"
            data-target="flow_depth_value"
            data-source="wellhead_depth"
          >
            Use wellhead
          </button>
          <button
            type="button"
            class="wellhead-btn flow-depth-btn"
            data-target="flow_depth_value"
            data-source="depth_open"
          >
            Use TD
          </button>
        </div>
      </div>
    </div>

    <div class="flow-help-row">
      <button
        type="button"
        id="flow_help_info_btn"
        class="info-btn"
        aria-label="Flow velocity help"
      >
        i
      </button>
      <div
        id="flow_help_info_tooltip"
        class="info-tooltip hidden"
        role="tooltip"
        aria-hidden="true"
      >
        <p>
          Flow velocity is computed using the configured tubing or drill pipe
          sizes and active casing IDs at each depth segment.
        </p>
      </div>
    </div>
  </div>

  <div id="flow-results-empty" class="flow-empty-state">
    <p class="small-note">
      Enter a flow rate to see velocities by depth segment.
    </p>
  </div>

  <div id="flow-results" class="flow-results hidden" aria-live="polite">
    <div class="flow-summary-grid">
      <div class="flow-summary-card">
        <h3>Flow rate</h3>
        <p id="flow-rate-summary">—</p>
        <p class="small-note">Minimum hole cleaning velocity: 0.8 m/s</p>
      </div>
      <div class="flow-summary-card">
        <h3>Active pipe</h3>
        <p id="flow-pipe-summary">—</p>
        <p id="flow-casing-summary" class="small-note"></p>
      </div>
      <div class="flow-summary-card">
        <h3>Velocity summary</h3>
        <div class="flow-summary-stats">
          <div>
            <span>Pipe</span>
            <strong id="flow-summary-pipe">—</strong>
          </div>
          <div>
            <span>Annulus</span>
            <strong id="flow-summary-annulus">—</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="flow-results-grid">
      <div class="flow-results-list" id="flow-results-list"></div>
      <div class="flow-schematic-card" aria-label="Flow schematic">
        <div class="flow-schematic">
          <div class="flow-schematic-column">
            <div class="flow-schematic-arrow flow-arrow-up">
              <span class="flow-arrow-label">Annulus (up)</span>
              <strong id="flow-schematic-annulus">—</strong>
            </div>
            <div class="flow-schematic-arrow flow-arrow-down">
              <span class="flow-arrow-label">Pipe (down)</span>
              <strong id="flow-schematic-pipe">—</strong>
            </div>
          </div>
          <div class="flow-schematic-depth" id="flow-schematic-depth">—</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] Add flow view styles to `src/css/style.css` (append near other section styles):

```css
.flow-header {
  margin-bottom: 12px;
}

.flow-card {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.flow-input-row {
  align-items: flex-start;
}

.flow-quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.flow-quick-btn {
  border: 1px solid var(--input-border);
  background: var(--surface-bg);
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease;
}

.flow-quick-btn:hover {
  background: var(--bg-tertiary);
  transform: translateY(-1px);
}

.flow-toggle-group {
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.flow-help-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.flow-empty-state {
  margin-top: 16px;
  padding: 14px;
  border-radius: var(--border-radius);
  border: 1px dashed var(--border-color);
  background: var(--surface-bg);
}

.flow-results {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.flow-results.hidden {
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
}

.flow-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.flow-summary-card {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 12px 14px;
}

.flow-summary-card h3 {
  margin: 0 0 6px 0;
  font-size: 0.95rem;
}

.flow-summary-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
}

.flow-summary-stats strong {
  display: block;
  font-size: 0.95rem;
}

.flow-results-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 16px;
}

.flow-results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flow-segment-card {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-segment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
}

.flow-velocity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
}

.flow-velocity-value {
  font-weight: 700;
}

.flow-velocity-warning {
  color: var(--equinor-red);
}

.flow-annulus-list {
  border-top: 1px dashed var(--table-row-border);
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flow-schematic-card {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-schematic {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.flow-schematic-column {
  width: 140px;
  height: 220px;
  border-radius: 70px;
  border: 2px solid var(--border-color);
  background: linear-gradient(
    180deg,
    rgba(227, 27, 35, 0.08),
    rgba(47, 168, 79, 0.08)
  );
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 18px;
}

.flow-schematic-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.flow-arrow-up::before {
  content: '↑';
  color: var(--equinor-red);
  font-size: 1.6rem;
}

.flow-arrow-down::before {
  content: '↓';
  color: var(--uc-tubing-green);
  font-size: 1.6rem;
}

.flow-arrow-label {
  color: var(--muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.flow-schematic-depth {
  font-size: 0.8rem;
  color: var(--muted);
}

@media (max-width: 900px) {
  .flow-results-grid {
    grid-template-columns: 1fr;
  }

  .flow-schematic-column {
    width: 100%;
    height: 180px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flow-results {
    transition: none;
  }
}
```

##### Step 2 Verification Checklist

- [ ] Flow Velocity view renders correctly with inputs and empty state.
- [ ] Flow rate presets display in a row and wrap on small screens.
- [ ] Depth input row appears only when Single depth is selected.

#### Step 2 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 3: Create Flow Velocity calculation module and tests

- [ ] Add the minimum velocity constant to `src/js/constants.js`:

```javascript
export const MINIMUM_HOLE_CLEANING_VELOCITY = 0.8;
```

- [ ] Create `src/js/flow-velocity.js` with the full module below:

```javascript
import { el } from './dom.js';
import { MINIMUM_HOLE_CLEANING_VELOCITY } from './constants.js';
import { DRILLPIPE_CATALOG } from './drillpipe.js';

export const FLOW_UNIT_LABELS = {
  lpm: 'L/min',
  gpm: 'GPM',
  m3h: 'm³/h',
  bpm: 'BPM'
};

export const FLOW_PRESETS_LPM = [1000, 2000, 3000, 4000, 5000];

const FLOW_UNIT_TO_M3S = {
  lpm: (value) => value / 1000 / 60,
  gpm: (value) => (value * 0.003785411784) / 60,
  m3h: (value) => value / 3600,
  bpm: (value) => (value * 0.158987294928) / 60
};

const FLOW_UNIT_FROM_M3S = {
  lpm: (value) => value * 1000 * 60,
  gpm: (value) => (value * 60) / 0.003785411784,
  m3h: (value) => value * 3600,
  bpm: (value) => (value * 60) / 0.158987294928
};

const ROLE_LABELS = {
  riser: 'Riser',
  conductor: 'Conductor',
  surface: 'Surface',
  intermediate: 'Intermediate',
  production: 'Production',
  tieback: 'Tie-back',
  reservoir: 'Reservoir',
  small_liner: 'Small liner',
  open_hole: 'Open hole'
};

const normalizeNumber = (raw) => {
  if (raw == null) return undefined;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : undefined;
  const value = String(raw).trim().replace(/\s+/g, '').replace(',', '.');
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function convertFlowToM3s(value, unit = 'lpm') {
  const numeric = normalizeNumber(value);
  if (!Number.isFinite(numeric)) return undefined;
  const converter = FLOW_UNIT_TO_M3S[unit] || FLOW_UNIT_TO_M3S.lpm;
  return converter(numeric);
}

export function convertM3sToUnit(valueM3s, unit = 'lpm') {
  if (!Number.isFinite(valueM3s)) return undefined;
  const converter = FLOW_UNIT_FROM_M3S[unit] || FLOW_UNIT_FROM_M3S.lpm;
  return converter(valueM3s);
}

export function convertMpsToFps(valueMps) {
  return Number.isFinite(valueMps) ? valueMps * 3.28084 : undefined;
}

export function diameterInchesToAreaM2(diameterInches) {
  const diameter = normalizeNumber(diameterInches);
  if (!Number.isFinite(diameter) || diameter <= 0) return 0;
  const radius = (diameter * 0.0254) / 2;
  return Math.PI * radius * radius;
}

function buildDrillPipeSegments(drillpipeInput) {
  const pipes = drillpipeInput?.pipes || [];
  let currentDepth = 0;
  return pipes
    .map((pipe) => {
      const length = normalizeNumber(pipe.length) || 0;
      const catalog = DRILLPIPE_CATALOG[pipe.size] || {};
      const segment = {
        top: currentDepth,
        bottom: currentDepth + length,
        id: catalog.id,
        od: catalog.od,
        label: catalog.name || pipe.sizeName || 'Drill pipe'
      };
      currentDepth += length;
      return segment;
    })
    .filter((seg) => seg.bottom > seg.top && seg.id && seg.od);
}

function buildTubingSegments(tubingInput) {
  const tubings = tubingInput?.tubings || [];
  return tubings
    .map((tube) => ({
      top: normalizeNumber(tube.top) || 0,
      bottom: normalizeNumber(tube.shoe) || 0,
      id: tube.id,
      od: tube.od,
      label: tube.sizeName || 'Tubing'
    }))
    .filter((seg) => seg.bottom > seg.top && seg.id && seg.od);
}

function resolvePipeSegments({
  drillpipeInput,
  tubingInput,
  pipeModeOverride
}) {
  const override = pipeModeOverride || 'auto';
  if (override === 'drillpipe') {
    return {
      mode: 'drillpipe',
      segments: buildDrillPipeSegments(drillpipeInput)
    };
  }
  if (override === 'tubing') {
    return { mode: 'tubing', segments: buildTubingSegments(tubingInput) };
  }
  if (drillpipeInput?.mode === 'drillpipe') {
    return {
      mode: 'drillpipe',
      segments: buildDrillPipeSegments(drillpipeInput)
    };
  }
  return { mode: 'tubing', segments: buildTubingSegments(tubingInput) };
}

function buildDepthPoints(casingsInput, pipeSegments) {
  const points = new Set([0]);
  casingsInput.forEach((casing) => {
    if (typeof casing.top !== 'undefined' && !isNaN(casing.top))
      points.add(casing.top);
    if (!isNaN(casing.depth)) points.add(casing.depth);
  });
  pipeSegments.forEach((seg) => {
    points.add(seg.top);
    points.add(seg.bottom);
  });
  return Array.from(points).sort((a, b) => a - b);
}

function getActiveCasings(
  casingsInput,
  segStart,
  segEnd,
  surfaceInUse,
  intermediateInUse
) {
  return casingsInput
    .filter((casing) => {
      if (!casing.use) return false;
      if (casing.role === 'upper_completion') return false;
      if (casing.depth <= segStart) return false;
      const topVal = typeof casing.top !== 'undefined' ? casing.top : 0;
      if (topVal >= segEnd) return false;
      if (casing.role === 'conductor' && surfaceInUse) return false;
      if (casing.role === 'surface' && intermediateInUse) return false;
      return true;
    })
    .sort((a, b) => {
      const aId = Number.isFinite(Number(a.id)) ? Number(a.id) : Infinity;
      const bId = Number.isFinite(Number(b.id)) ? Number(b.id) : Infinity;
      return aId - bId;
    });
}

function formatRoleLabel(role) {
  return ROLE_LABELS[role] || role.replace(/_/g, ' ');
}

function summarize(values) {
  if (!values.length) {
    return { min: undefined, max: undefined, avg: undefined };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  return { min, max, avg };
}

function pickOverlaySegment(segments, depthMode, depthValue) {
  if (depthMode === 'single' && Number.isFinite(depthValue)) {
    return (
      segments.find(
        (segment) =>
          depthValue >= segment.startDepth && depthValue <= segment.endDepth
      ) || segments[0]
    );
  }
  return segments[0];
}

export function computeFlowVelocity(
  flowInput,
  {
    casingsInput = [],
    drillpipeInput = {},
    tubingInput = {},
    surfaceInUse = false,
    intermediateInUse = false
  } = {}
) {
  if (!flowInput || flowInput.active === false) {
    return { active: false, valid: false, segments: [] };
  }

  const flowRateM3s = flowInput.flowRateM3s;
  if (!Number.isFinite(flowRateM3s) || flowRateM3s <= 0) {
    return {
      active: true,
      valid: false,
      reason: 'invalid-flow-rate',
      segments: [],
      flowRateM3s,
      flowRateUnit: flowInput.flowRateUnit,
      flowRateValue: flowInput.flowRateValue
    };
  }

  const { mode: pipeMode, segments: pipeSegments } = resolvePipeSegments({
    drillpipeInput,
    tubingInput,
    pipeModeOverride: flowInput.pipeModeOverride
  });

  if (!pipeSegments.length) {
    return {
      active: true,
      valid: false,
      reason: 'no-pipe',
      segments: [],
      flowRateM3s,
      flowRateUnit: flowInput.flowRateUnit,
      flowRateValue: flowInput.flowRateValue,
      pipeMode
    };
  }

  const points = buildDepthPoints(casingsInput, pipeSegments);
  const segments = [];
  const casingLabels = new Set();

  for (let i = 0; i < points.length - 1; i += 1) {
    const segStart = points[i];
    const segEnd = points[i + 1];
    const segLength = segEnd - segStart;
    if (segLength <= 0) continue;

    const pipeSegment = pipeSegments.find(
      (seg) => segStart >= seg.top && segEnd <= seg.bottom
    );
    if (!pipeSegment) continue;

    const activeCasings = getActiveCasings(
      casingsInput,
      segStart,
      segEnd,
      surfaceInUse,
      intermediateInUse
    );

    const pipeArea = diameterInchesToAreaM2(pipeSegment.id);
    const pipeVelocityMps = pipeArea > 0 ? flowRateM3s / pipeArea : undefined;

    const annuli = activeCasings
      .map((casing) => {
        const casingArea = diameterInchesToAreaM2(casing.id);
        const pipeOdArea = diameterInchesToAreaM2(pipeSegment.od);
        const annulusArea = Math.max(0, casingArea - pipeOdArea);
        if (annulusArea <= 0) return undefined;
        const velocityMps = flowRateM3s / annulusArea;
        const casingLabel = `${formatRoleLabel(casing.role)} ${
          casing.id || ''
        }"`;
        casingLabels.add(casingLabel.trim());
        return {
          casingRole: casing.role,
          casingId: casing.id,
          casingLabel: casingLabel.trim(),
          velocityMps,
          velocityFps: convertMpsToFps(velocityMps)
        };
      })
      .filter(Boolean);

    segments.push({
      startDepth: segStart,
      endDepth: segEnd,
      length: segLength,
      pipe: {
        label: pipeSegment.label,
        velocityMps: pipeVelocityMps,
        velocityFps: convertMpsToFps(pipeVelocityMps)
      },
      annuli
    });
  }

  const pipeVelocities = segments
    .map((segment) => segment.pipe.velocityMps)
    .filter((value) => Number.isFinite(value));

  const annulusVelocities = segments
    .flatMap((segment) => segment.annuli.map((annulus) => annulus.velocityMps))
    .filter((value) => Number.isFinite(value));

  const summary = {
    pipe: summarize(pipeVelocities),
    annulus: summarize(annulusVelocities)
  };

  const overlaySegment = pickOverlaySegment(
    segments,
    flowInput.depthMode,
    flowInput.depthValue
  );
  const overlayAnnulus = overlaySegment?.annuli?.[0];

  return {
    active: true,
    valid: true,
    flowRateM3s,
    flowRateUnit: flowInput.flowRateUnit,
    flowRateValue: flowInput.flowRateValue,
    pipeMode,
    depthMode: flowInput.depthMode,
    depthValue: flowInput.depthValue,
    segments,
    casingLabels: Array.from(casingLabels),
    summary,
    overlay: overlaySegment
      ? {
          depthLabel: `${overlaySegment.startDepth.toFixed(
            1
          )}–${overlaySegment.endDepth.toFixed(1)} m`,
          pipeVelocityMps: overlaySegment.pipe.velocityMps,
          pipeVelocityFps: overlaySegment.pipe.velocityFps,
          annulusVelocityMps: overlayAnnulus?.velocityMps,
          annulusVelocityFps: overlayAnnulus?.velocityFps,
          annulusLabel: overlayAnnulus?.casingLabel
        }
      : undefined
  };
}

export function gatherFlowVelocityInput() {
  const flowRateEl = el('flow_rate');
  if (!flowRateEl) return { active: false };

  const flowRateValue = normalizeNumber(flowRateEl.value);
  const flowRateUnit = el('flow_rate_unit')?.value || 'lpm';
  const flowRateM3s = convertFlowToM3s(flowRateValue, flowRateUnit);
  const depthMode = el('flow_depth_mode_single')?.checked ? 'single' : 'all';
  const depthValue = normalizeNumber(el('flow_depth_value')?.value);
  const pipeModeOverride = el('flow_pipe_mode_override')?.value || 'auto';

  return {
    active: true,
    flowRateValue,
    flowRateUnit,
    flowRateM3s,
    depthMode,
    depthValue,
    pipeModeOverride
  };
}

export function setupFlowVelocityUI(deps = {}) {
  const { calculateVolume = () => {}, scheduleSave = () => {} } = deps;
  const flowRateEl = el('flow_rate');
  if (!flowRateEl) return;

  const unitSelect = el('flow_rate_unit');
  if (unitSelect) {
    unitSelect.dataset.prevUnit = unitSelect.value || 'lpm';
    unitSelect.addEventListener('change', () => {
      const prevUnit = unitSelect.dataset.prevUnit || 'lpm';
      const nextUnit = unitSelect.value || 'lpm';
      const currentValue = normalizeNumber(flowRateEl.value);
      if (Number.isFinite(currentValue)) {
        const currentM3s = convertFlowToM3s(currentValue, prevUnit);
        const nextValue = convertM3sToUnit(currentM3s, nextUnit);
        if (Number.isFinite(nextValue)) {
          flowRateEl.value = String(Math.round(nextValue));
        }
      }
      unitSelect.dataset.prevUnit = nextUnit;
      calculateVolume();
      scheduleSave();
    });
  }

  document.querySelectorAll('[data-flow-lpm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = normalizeNumber(btn.dataset.flowLpm);
      if (!Number.isFinite(preset)) return;
      const unit = unitSelect?.value || 'lpm';
      const presetM3s = convertFlowToM3s(preset, 'lpm');
      const presetValue = convertM3sToUnit(presetM3s, unit);
      if (Number.isFinite(presetValue)) {
        flowRateEl.value = String(Math.round(presetValue));
      }
      calculateVolume();
      scheduleSave();
    });
  });

  const depthModeAll = el('flow_depth_mode_all');
  const depthModeSingle = el('flow_depth_mode_single');
  const depthInputWrap = el('flow-depth-input');
  const syncDepthMode = () => {
    if (!depthInputWrap) return;
    depthInputWrap.hidden = !(depthModeSingle && depthModeSingle.checked);
  };
  if (depthModeAll) depthModeAll.addEventListener('change', syncDepthMode);
  if (depthModeSingle)
    depthModeSingle.addEventListener('change', syncDepthMode);
  syncDepthMode();

  document.querySelectorAll('.flow-depth-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = el(btn.dataset.target);
      const source = el(btn.dataset.source);
      if (!target || !source) return;
      if (source.value !== '') {
        target.value = source.value;
        calculateVolume();
        scheduleSave();
      }
    });
  });
}

function formatVelocityValue(valueMps) {
  if (!Number.isFinite(valueMps)) return '—';
  const valueFps = convertMpsToFps(valueMps);
  return `${valueMps.toFixed(2)} m/s (${valueFps.toFixed(2)} ft/s)`;
}

function formatSummary(summary) {
  if (!Number.isFinite(summary?.avg)) return '—';
  return `Avg ${summary.avg.toFixed(2)} m/s · Min ${summary.min.toFixed(
    2
  )} · Max ${summary.max.toFixed(2)}`;
}

export function renderFlowVelocityResults(result) {
  const resultsEl = el('flow-results');
  const emptyEl = el('flow-results-empty');
  const listEl = el('flow-results-list');
  const errorEl = el('flow-rate-error');
  if (!resultsEl || !emptyEl || !listEl || !errorEl) return;

  if (!result || !result.active) {
    resultsEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    return;
  }

  if (!result.valid) {
    resultsEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    const isInvalidRate = result.reason === 'invalid-flow-rate';
    errorEl.textContent = isInvalidRate
      ? 'Enter a flow rate greater than zero.'
      : 'Flow velocity requires a configured pipe section.';
    errorEl.classList.toggle('hidden', !isInvalidRate);
    return;
  }

  errorEl.classList.add('hidden');
  emptyEl.classList.add('hidden');
  resultsEl.classList.remove('hidden');

  const rateSummary = el('flow-rate-summary');
  const pipeSummary = el('flow-pipe-summary');
  const casingSummary = el('flow-casing-summary');
  const summaryPipeEl = el('flow-summary-pipe');
  const summaryAnnulusEl = el('flow-summary-annulus');

  if (rateSummary) {
    const unitLabel =
      FLOW_UNIT_LABELS[result.flowRateUnit] || result.flowRateUnit;
    rateSummary.textContent = `${result.flowRateValue || 0} ${unitLabel}`;
  }

  if (pipeSummary) {
    pipeSummary.textContent =
      result.pipeMode === 'drillpipe' ? 'Drill pipe mode' : 'Tubing mode';
  }

  if (casingSummary) {
    casingSummary.textContent = result.casingLabels.length
      ? `Casings: ${result.casingLabels.join(', ')}`
      : 'No casing IDs available for annulus calculations.';
  }

  if (summaryPipeEl)
    summaryPipeEl.textContent = formatSummary(result.summary.pipe);
  if (summaryAnnulusEl)
    summaryAnnulusEl.textContent = formatSummary(result.summary.annulus);

  listEl.innerHTML = '';
  result.segments.forEach((segment) => {
    const card = document.createElement('div');
    card.className = 'flow-segment-card';

    const header = document.createElement('div');
    header.className = 'flow-segment-header';
    header.textContent = `${segment.startDepth.toFixed(
      1
    )}–${segment.endDepth.toFixed(1)} m`;
    card.appendChild(header);

    const pipeRow = document.createElement('div');
    pipeRow.className = 'flow-velocity-row';
    const pipeLabel = document.createElement('span');
    pipeLabel.textContent = `Pipe (${segment.pipe.label})`;
    const pipeValue = document.createElement('span');
    pipeValue.className = 'flow-velocity-value';
    if (segment.pipe.velocityMps < MINIMUM_HOLE_CLEANING_VELOCITY) {
      pipeValue.classList.add('flow-velocity-warning');
    }
    pipeValue.textContent = formatVelocityValue(segment.pipe.velocityMps);
    pipeRow.append(pipeLabel, pipeValue);
    card.appendChild(pipeRow);

    if (segment.annuli.length) {
      const annulusList = document.createElement('div');
      annulusList.className = 'flow-annulus-list';
      segment.annuli.forEach((annulus) => {
        const row = document.createElement('div');
        row.className = 'flow-velocity-row';
        const label = document.createElement('span');
        label.textContent = annulus.casingLabel || 'Annulus';
        const value = document.createElement('span');
        value.className = 'flow-velocity-value';
        if (annulus.velocityMps < MINIMUM_HOLE_CLEANING_VELOCITY) {
          value.classList.add('flow-velocity-warning');
        }
        value.textContent = formatVelocityValue(annulus.velocityMps);
        row.append(label, value);
        annulusList.appendChild(row);
      });
      card.appendChild(annulusList);
    }

    listEl.appendChild(card);
  });

  const schematicPipe = el('flow-schematic-pipe');
  const schematicAnnulus = el('flow-schematic-annulus');
  const schematicDepth = el('flow-schematic-depth');
  if (schematicPipe) {
    schematicPipe.textContent = formatVelocityValue(
      result.overlay?.pipeVelocityMps
    );
    schematicPipe.classList.toggle(
      'flow-velocity-warning',
      (result.overlay?.pipeVelocityMps || 0) < MINIMUM_HOLE_CLEANING_VELOCITY
    );
  }
  if (schematicAnnulus) {
    schematicAnnulus.textContent = formatVelocityValue(
      result.overlay?.annulusVelocityMps
    );
    schematicAnnulus.classList.toggle(
      'flow-velocity-warning',
      (result.overlay?.annulusVelocityMps || 0) < MINIMUM_HOLE_CLEANING_VELOCITY
    );
  }
  if (schematicDepth) {
    schematicDepth.textContent =
      result.overlay?.depthLabel || 'Select a depth to focus the schematic.';
  }
}
```

- [ ] Add unit tests in `src/js/__tests__/flow-velocity.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import {
  convertFlowToM3s,
  diameterInchesToAreaM2,
  computeFlowVelocity
} from '../flow-velocity.js';

const buildFlowInput = (value, unit = 'lpm') => ({
  active: true,
  flowRateValue: value,
  flowRateUnit: unit,
  flowRateM3s: convertFlowToM3s(value, unit),
  depthMode: 'all',
  depthValue: undefined,
  pipeModeOverride: 'auto'
});

describe('flow velocity conversions', () => {
  it('converts L/min to m³/s', () => {
    const m3s = convertFlowToM3s(60, 'lpm');
    expect(m3s).toBeCloseTo(0.001, 6);
  });

  it('converts GPM to m³/s', () => {
    const m3s = convertFlowToM3s(10, 'gpm');
    expect(m3s).toBeCloseTo((10 * 0.003785411784) / 60, 10);
  });

  it('converts m³/h to m³/s', () => {
    const m3s = convertFlowToM3s(3.6, 'm3h');
    expect(m3s).toBeCloseTo(0.001, 6);
  });

  it('converts BPM to m³/s', () => {
    const m3s = convertFlowToM3s(1, 'bpm');
    expect(m3s).toBeCloseTo(0.158987294928 / 60, 10);
  });
});

describe('area calculations', () => {
  it('computes area from diameter in inches', () => {
    const area = diameterInchesToAreaM2(4);
    const expected = Math.PI * Math.pow((4 * 0.0254) / 2, 2);
    expect(area).toBeCloseTo(expected, 8);
  });
});

describe('computeFlowVelocity', () => {
  it('computes pipe and annulus velocity for a single casing', () => {
    const flowInput = buildFlowInput(1000, 'lpm');
    const tubingInput = {
      count: 1,
      tubings: [
        {
          top: 0,
          shoe: 1000,
          id: 4,
          od: 4.5,
          sizeName: '4"'
        }
      ]
    };
    const drillpipeInput = { mode: 'tubing', count: 0, pipes: [] };
    const casingsInput = [
      { role: 'production', id: 10, top: 0, depth: 1000, use: true, od: 12 }
    ];

    const result = computeFlowVelocity(flowInput, {
      casingsInput,
      drillpipeInput,
      tubingInput,
      surfaceInUse: false,
      intermediateInUse: false
    });

    expect(result.valid).toBe(true);
    expect(result.segments).toHaveLength(1);
    const segment = result.segments[0];
    const pipeArea = diameterInchesToAreaM2(4);
    const annulusArea =
      diameterInchesToAreaM2(10) - diameterInchesToAreaM2(4.5);
    expect(segment.pipe.velocityMps).toBeCloseTo(
      result.flowRateM3s / pipeArea,
      6
    );
    expect(segment.annuli[0].velocityMps).toBeCloseTo(
      result.flowRateM3s / annulusArea,
      6
    );
  });

  it('returns invalid when flow rate is zero', () => {
    const flowInput = buildFlowInput(0, 'lpm');
    const result = computeFlowVelocity(flowInput, {
      casingsInput: [],
      drillpipeInput: { mode: 'tubing', count: 0, pipes: [] },
      tubingInput: { count: 0, tubings: [] }
    });
    expect(result.valid).toBe(false);
  });

  it('handles multiple casings in the same depth range', () => {
    const flowInput = buildFlowInput(1500, 'lpm');
    const tubingInput = {
      count: 1,
      tubings: [
        {
          top: 0,
          shoe: 800,
          id: 4.5,
          od: 5,
          sizeName: '4 1/2"'
        }
      ]
    };
    const drillpipeInput = { mode: 'tubing', count: 0, pipes: [] };
    const casingsInput = [
      { role: 'production', id: 9.5, top: 0, depth: 800, use: true, od: 10 },
      { role: 'surface', id: 13.375, top: 0, depth: 800, use: true, od: 14 }
    ];

    const result = computeFlowVelocity(flowInput, {
      casingsInput,
      drillpipeInput,
      tubingInput
    });

    expect(result.valid).toBe(true);
    expect(result.segments[0].annuli.length).toBe(2);
  });
});
```

##### Step 3 Verification Checklist

- [ ] `npm test` runs without failures.
- [ ] `computeFlowVelocity` returns valid results for a single casing/tubing setup.
- [ ] Unit conversions match expected values.

#### Step 3 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 4: Integrate Flow Velocity calculations into the main script

- [ ] Update `src/js/sidebar.js` to broadcast section changes. Insert this block at the end of `setSection`:

```javascript
saveActiveSection(normalized);
setActiveView(normalized, { focus: !!focus });

try {
  document.dispatchEvent(
    new CustomEvent('keino:sectionchange', { detail: normalized })
  );
} catch (error) {
  console.warn('Unable to broadcast section change:', error);
}
```

- [ ] Wire Flow Velocity UI hooks in `src/js/ui.js`:

```javascript
import { setupFlowVelocityUI } from './flow-velocity.js';
```

```javascript
setupFlowVelocityUI(deps);
```

- [ ] Update `src/js/script.js` to compute flow velocity results:

```javascript
import {
  computeFlowVelocity,
  gatherFlowVelocityInput,
  renderFlowVelocityResults
} from './flow-velocity.js';
import { initializeSidebar, getActiveSection } from './sidebar.js';
```

```javascript
// Cached DOM
const canvas = el('wellSchematic');

let currentPresetName = '';
let lastFlowResults = undefined;
```

```javascript
  function calculateVolume() {
    const {
      casingsInput,
      plugEnabled,
      plugDepthVal,
      surfaceInUse,
      intermediateInUse,
      riserTypeVal,
      riserDepthVal,
      wellheadDepthVal
    } = gatherInputs();

    const dpInput = gatherDrillPipeInput();
    const tubingInput = gatherTubingInput();

    const flowInput = gatherFlowVelocityInput();
    lastFlowResults = computeFlowVelocity(flowInput, {
      casingsInput,
      drillpipeInput: dpInput,
      tubingInput,
      surfaceInUse,
      intermediateInUse
    });
```

```javascript
renderFlowVelocityResults(lastFlowResults);
```

```javascript
const activeSection = getActiveSection();
const flowOverlay =
  activeSection === 'flow' && lastFlowResults?.valid
    ? lastFlowResults.overlay
    : undefined;
```

```javascript
const __testDrawOpts = {
  showWater,
  waterDepth,
  plugDepth:
    plugEnabled && typeof plugDepthVal !== 'undefined' && !isNaN(plugDepthVal)
      ? plugDepthVal
      : undefined,
  drillPipeSegments:
    dpInput.mode === 'drillpipe' && dpInput.pipes.length > 0
      ? dpInput.pipes
      : undefined,
  tubingSegments,
  flowOverlay
};
```

```javascript
  function init() {
    persistence = createPersistence({ captureStateObject });
    const { scheduleSave: _scheduleSave, loadState: _loadState } = persistence;

    initDraw(canvas);

    initUI({
      calculateVolume,
      scheduleSave: _scheduleSave,
      captureStateObject,
      applyStateObject: applyStateObjectFn,
      initDraw
    });
    initializeSidebar();

    document.addEventListener('keino:sectionchange', () => {
      calculateVolume();
    });
```

##### Step 4 Verification Checklist

- [ ] Flow Velocity calculations update when any flow input changes.
- [ ] Switching to the Flow tab triggers a fresh calculation.
- [ ] No new console errors appear in the Flow view.

#### Step 4 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 5: Render Flow Velocity results and warnings

- [ ] Ensure `renderFlowVelocityResults` is wired in `src/js/script.js` (from Step 4).
- [ ] Verify the `flow-rate-error` warning shows when flow rate is zero or negative.
- [ ] Confirm that velocities below 0.8 m/s render with the warning style.

##### Step 5 Verification Checklist

- [ ] Enter a valid flow rate and see segment cards populated.
- [ ] Toggle to Single depth and confirm the schematic depth label updates.
- [ ] Velocities below 0.8 m/s are highlighted in red.

#### Step 5 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 6: Add main-canvas schematic overlay

- [ ] Update `src/js/draw.js` to render flow velocity arrows when `flowOverlay` is provided. Add the helper functions below near the bottom of the file and call `drawFlowOverlay` at the end of `drawSchematic`:

```javascript
if (opts?.flowOverlay) {
  drawFlowOverlay(opts.flowOverlay, rect);
}
```

```javascript
function drawFlowOverlay(overlay, rect) {
  if (!ctx || !overlay) return;
  const baseX = rect.width * 0.78;
  const baseY = rect.height * 0.18;
  const arrowHeight = Math.min(140, rect.height * 0.25);
  const fontSize = Math.max(11, Math.round(rect.width * 0.012));

  ctx.save();
  ctx.font = `600 ${fontSize}px Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const pipeText = overlay.pipeVelocityMps
    ? `${overlay.pipeVelocityMps.toFixed(
        2
      )} m/s (${overlay.pipeVelocityFps.toFixed(2)} ft/s)`
    : '—';
  const annulusText = overlay.annulusVelocityMps
    ? `${overlay.annulusVelocityMps.toFixed(
        2
      )} m/s (${overlay.annulusVelocityFps.toFixed(2)} ft/s)`
    : '—';

  drawArrow(baseX, baseY, arrowHeight, 'up', '#e31b23');
  ctx.fillStyle = '#e31b23';
  ctx.fillText(`Annulus ${overlay.annulusLabel || ''}`, baseX + 18, baseY - 8);
  ctx.fillText(annulusText, baseX + 18, baseY + 10);

  const pipeY = baseY + arrowHeight + 40;
  drawArrow(baseX, pipeY, arrowHeight, 'down', '#2fa84f');
  ctx.fillStyle = '#2fa84f';
  ctx.fillText('Pipe', baseX + 18, pipeY - 8);
  ctx.fillText(pipeText, baseX + 18, pipeY + 10);

  if (overlay.depthLabel) {
    ctx.fillStyle = '#555';
    ctx.fillText(
      `Depth: ${overlay.depthLabel}`,
      baseX,
      pipeY + arrowHeight + 26
    );
  }

  ctx.restore();
}

function drawArrow(x, y, height, direction, color) {
  if (!ctx) return;
  const arrowWidth = 10;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (direction === 'up') {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - arrowWidth);
    ctx.lineTo(x - arrowWidth, y + arrowWidth);
    ctx.lineTo(x + arrowWidth, y + arrowWidth);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + height + arrowWidth);
    ctx.lineTo(x - arrowWidth, y + height - arrowWidth);
    ctx.lineTo(x + arrowWidth, y + height - arrowWidth);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
```

##### Step 6 Verification Checklist

- [ ] Flow tab shows velocity arrows on the main well schematic.
- [ ] Values update when flow rate or depth mode changes.
- [ ] No visual overlap issues with existing canvas content.

#### Step 6 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.

#### Step 7: Polish UX, tooltip wiring, and documentation

- [ ] Hook up the new Flow Velocity tooltip in `src/js/ui.js`:

```javascript
setup('flow_help_info_btn', 'flow_help_info_tooltip');
```

- [ ] Remove the Under Construction badge from the Flow Velocity nav button in `index.html` by replacing the Flow Velocity button text with:

```html
<span class="sidebar-nav-text">Flow Velocity</span>
```

- [ ] Update `README.md` to mention the Flow Velocity tab and supported units:

```markdown
- Flow Velocity: calculates pipe and annulus velocities across casing transitions.
  Supports L/min, GPM, m³/h, and BPM inputs.
```

##### Step 7 Verification Checklist

- [ ] Tooltip opens on hover/focus and can be dismissed.
- [ ] Flow Velocity tab no longer shows the construction badge.
- [ ] README documents Flow Velocity and units.

#### Step 7 STOP & COMMIT

**STOP & COMMIT:** Agent must stop here and wait for the user to test, stage, and commit the change.
