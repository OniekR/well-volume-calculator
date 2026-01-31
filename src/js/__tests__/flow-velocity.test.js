import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  convertFlowToM3s,
  convertM3sToUnit,
  convertMpsToFps,
  diameterInchesToAreaM2,
  computeFlowVelocity,
  gatherFlowVelocityInput,
  setupFlowVelocityUI,
  renderFlowVelocityResults
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

  it('converts m³/s to unit values', () => {
    const m3s = 0.001;
    expect(convertM3sToUnit(m3s, 'lpm')).toBeCloseTo(60, 5);
    expect(convertM3sToUnit(m3s, 'm3h')).toBeCloseTo(3.6, 5);
  });

  it('converts m/s to ft/s', () => {
    expect(convertMpsToFps(1)).toBeCloseTo(3.28084, 5);
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

  it('returns invalid when no pipe segments', () => {
    const flowInput = buildFlowInput(1200, 'lpm');
    const result = computeFlowVelocity(flowInput, {
      casingsInput: [],
      drillpipeInput: { mode: 'tubing', count: 0, pipes: [] },
      tubingInput: { count: 0, tubings: [] }
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('no-pipe');
  });

  it('uses drillpipe override when specified', () => {
    const flowInput = {
      ...buildFlowInput(1200, 'lpm'),
      pipeModeOverride: 'drillpipe'
    };
    const result = computeFlowVelocity(flowInput, {
      casingsInput: [
        { role: 'surface', id: 13.375, top: 0, depth: 500, use: true, od: 14 }
      ],
      drillpipeInput: {
        mode: 'drillpipe',
        pipes: [{ length: 500, size: 2, sizeName: '5"' }]
      },
      tubingInput: { count: 0, tubings: [] }
    });
    expect(result.valid).toBe(true);
    expect(result.pipeMode).toBe('drillpipe');
  });
});

describe('gatherFlowVelocityInput', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="flow_rate" value="1200" />
      <select id="flow_rate_unit"><option value="lpm" selected>LPM</option></select>
      <input type="radio" id="flow_depth_mode_single" checked />
      <input id="flow_depth_value" value="250" />
      <select id="flow_pipe_mode_override"><option value="auto" selected></option></select>
    `;
  });

  it('parses flow inputs from the DOM', () => {
    const input = gatherFlowVelocityInput();
    expect(input.active).toBe(true);
    expect(input.flowRateValue).toBe(1200);
    expect(input.depthMode).toBe('single');
    expect(input.depthValue).toBe(250);
  });
});

describe('setupFlowVelocityUI', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="flow_rate" value="1200" />
      <select id="flow_rate_unit">
        <option value="lpm" selected>LPM</option>
        <option value="gpm">GPM</option>
      </select>
      <button data-flow-lpm="2000"></button>
      <input type="radio" id="flow_depth_mode_all" checked />
      <input type="radio" id="flow_depth_mode_single" />
      <div id="flow-depth-input" hidden></div>
      <button class="flow-depth-btn" data-target="flow_depth_value" data-source="depth_7"></button>
      <input id="flow_depth_value" value="" />
      <input id="depth_7" value="500" />
    `;
  });

  it('updates flow rate on unit change and preset click', () => {
    const deps = { calculateVolume: vi.fn(), scheduleSave: vi.fn() };
    setupFlowVelocityUI(deps);
    const unit = document.getElementById('flow_rate_unit');
    unit.value = 'gpm';
    unit.dispatchEvent(new Event('change'));
    expect(deps.calculateVolume).toHaveBeenCalled();
    document.querySelector('[data-flow-lpm]').click();
    expect(deps.scheduleSave).toHaveBeenCalled();
  });

  it('toggles depth input visibility and copies depth', () => {
    const deps = { calculateVolume: vi.fn(), scheduleSave: vi.fn() };
    setupFlowVelocityUI(deps);
    const single = document.getElementById('flow_depth_mode_single');
    single.checked = true;
    single.dispatchEvent(new Event('change'));
    expect(document.getElementById('flow-depth-input').hidden).toBe(false);
    document.querySelector('.flow-depth-btn').click();
    expect(document.getElementById('flow_depth_value').value).toBe('500');
  });
});

describe('renderFlowVelocityResults', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="flow-results" class="hidden"></div>
      <div id="flow-results-empty"></div>
      <div id="flow-results-list"></div>
      <div id="flow-rate-error" class="hidden"></div>
      <div id="flow-rate-summary"></div>
      <div id="flow-pipe-summary"></div>
      <div id="flow-casing-summary"></div>
      <div id="flow-summary-pipe"></div>
      <div id="flow-summary-annulus"></div>
    `;
  });

  it('shows empty state for inactive results', () => {
    renderFlowVelocityResults({ active: false });
    expect(
      document.getElementById('flow-results').classList.contains('hidden')
    ).toBe(true);
  });

  it('shows error for invalid flow rate', () => {
    renderFlowVelocityResults({
      active: true,
      valid: false,
      reason: 'invalid-flow-rate'
    });
    expect(
      document.getElementById('flow-rate-error').classList.contains('hidden')
    ).toBe(false);
  });

  it('renders segment cards for valid results', () => {
    const result = {
      active: true,
      valid: true,
      flowRateUnit: 'lpm',
      flowRateValue: 1200,
      pipeMode: 'tubing',
      casingLabels: ['Surface'],
      summary: {
        pipe: { avg: 1, min: 1, max: 1 },
        annulus: { avg: 2, min: 2, max: 2 }
      },
      segments: [
        {
          startDepth: 0,
          endDepth: 100,
          pipe: { label: 'Tubing', velocityMps: 1, velocityFps: 3 },
          annuli: [{ casingLabel: 'Surface', velocityMps: 2, velocityFps: 6 }]
        }
      ]
    };
    renderFlowVelocityResults(result);
    const cards = document.querySelectorAll('.flow-segment-card');
    expect(cards.length).toBe(1);
  });
});
