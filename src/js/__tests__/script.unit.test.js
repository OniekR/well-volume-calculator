/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const mockScheduleDraw = vi.fn();
const mockDrawSchematic = vi.fn();
const mockFlushDraw = vi.fn();
const mockComputeVolumes = vi.fn();
const mockComputeUpperCompletionBreakdown = vi.fn();
const mockCaptureStateObject = vi.fn(() => ({ casings: [] }));
const mockApplyStateObject = vi.fn();
const mockInitUI = vi.fn();
const mockInitializeSidebar = vi.fn();
const mockGetActiveSection = vi.fn();
const mockGatherInputs = vi.fn();
const mockRenderResults = vi.fn();
const mockRenderUpperCompletionBreakdown = vi.fn();
const mockSetupPresetsUI = vi.fn();
const mockCreatePersistence = vi.fn(() => ({
  scheduleSave: vi.fn(),
  loadState: vi.fn(),
  saveState: vi.fn()
}));
const mockGatherDrillPipeInput = vi.fn();
const mockComputeDrillPipeBreakdown = vi.fn();
const mockGatherTubingInput = vi.fn();
const mockComputeFlowVelocity = vi.fn();
const mockGatherFlowVelocityInput = vi.fn();
const mockRenderFlowVelocityResults = vi.fn();
const mockComputePressureTest = vi.fn();
const mockGatherPressureInput = vi.fn();
const mockSetupPressureUI = vi.fn();
const mockRenderPressureResults = vi.fn();
const mockSetupStringLiftUI = vi.fn();

vi.mock('../draw.js', () => ({
  initDraw: vi.fn(),
  scheduleDraw: mockScheduleDraw,
  drawSchematic: mockDrawSchematic,
  __TEST_flush_draw: mockFlushDraw
}));
vi.mock('../logic.js', () => ({
  computeVolumes: mockComputeVolumes,
  computeUpperCompletionBreakdown: mockComputeUpperCompletionBreakdown
}));
vi.mock('../state.js', () => ({
  captureStateObject: mockCaptureStateObject,
  applyStateObject: mockApplyStateObject
}));
vi.mock('../ui.js', () => ({
  initUI: mockInitUI
}));
vi.mock('../sidebar.js', () => ({
  initializeSidebar: mockInitializeSidebar,
  getActiveSection: mockGetActiveSection
}));
vi.mock('../inputs.js', () => ({
  gatherInputs: mockGatherInputs
}));
vi.mock('../render.js', () => ({
  renderResults: mockRenderResults,
  renderUpperCompletionBreakdown: mockRenderUpperCompletionBreakdown
}));
vi.mock('../presets-ui.js', () => ({
  setupPresetsUI: mockSetupPresetsUI
}));
vi.mock('../persistence.js', () => ({
  createPersistence: mockCreatePersistence
}));
vi.mock('../drillpipe.js', () => ({
  gatherDrillPipeInput: mockGatherDrillPipeInput,
  computeDrillPipeBreakdown: mockComputeDrillPipeBreakdown
}));
vi.mock('../tubing.js', () => ({
  gatherTubingInput: mockGatherTubingInput
}));
vi.mock('../flow-velocity.js', () => ({
  computeFlowVelocity: mockComputeFlowVelocity,
  gatherFlowVelocityInput: mockGatherFlowVelocityInput,
  renderFlowVelocityResults: mockRenderFlowVelocityResults
}));
vi.mock('../pressure.js', () => ({
  computePressureTest: mockComputePressureTest,
  gatherPressureInput: mockGatherPressureInput,
  setupPressureUI: mockSetupPressureUI,
  renderPressureResults: mockRenderPressureResults
}));
vi.mock('../string-lift.js', () => ({
  setupStringLiftUI: mockSetupStringLiftUI
}));

const baseInputs = {
  casingsInput: [
    { role: 'surface', depth: 200, use: true, prevDepth: 0, id: 10, od: 12 },
    { role: 'upper_completion', depth: 400, use: true, prevDepth: 0, id: 4, od: 5 }
  ],
  plugEnabled: true,
  plugDepthVal: 120,
  surfaceInUse: true,
  intermediateInUse: false,
  riserTypeVal: 'none',
  riserDepthVal: 75,
  wellheadDepthVal: NaN
};

const baseVolumes = {
  plugAboveTubing: 1,
  plugBelowTubing: 2,
  plugAboveAnnulus: 3,
  plugBelowAnnulus: 4,
  plugAboveTubingOpenCasing: 5,
  plugBelowVolumeTubing: 6,
  casingVolumeBelowTubingShoe: 7,
  plugBelowVolume: 8,
  plugDepthVal: 120,
  ucActive: true,
  casingsToDraw: baseInputs.casingsInput
};

describe('script.js', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = `
      <input id="subtract_eod_toggle" type="checkbox" checked />
      <div class="casing-input"><input class="use-checkbox" type="checkbox" checked /><div class="casing-header"></div></div>
      <input id="production_is_liner" type="checkbox" />
      <button id="production_casing_btn"></button>
      <button class="liner-default-btn"></button>
      <input id="depth_7_top" value="" />
    `;

    mockComputeVolumes.mockReturnValue({ ...baseVolumes });
    mockComputeUpperCompletionBreakdown.mockReturnValue({
      ucIdVolume: 10,
      annulusVolume: 12
    });
    mockComputeDrillPipeBreakdown.mockReturnValue({
      dpIdVolume: 9,
      annulusVolume: 8
    });
    mockComputeFlowVelocity.mockReturnValue({
      valid: true,
      overlay: {
        annulusVelocityMps: 1.1,
        annulusVelocityFps: 3.6,
        pipeVelocityMps: 0.9,
        pipeVelocityFps: 2.9
      }
    });
    mockComputePressureTest.mockReturnValue({ valid: true });
    mockGetActiveSection.mockReturnValue('flow');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('initializes helpers and supports theme toggles', async () => {
    mockGatherInputs.mockReturnValue({ ...baseInputs });
    mockGatherDrillPipeInput.mockReturnValue({ mode: 'tubing', pipes: [] });
    mockGatherTubingInput.mockReturnValue({ count: 1, tubings: [] });
    mockGatherFlowVelocityInput.mockReturnValue({});
    mockGatherPressureInput.mockReturnValue({});

    await import('../script.js');

    expect(typeof window.__TEST_applyTheme).toBe('function');
    window.__TEST_applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    window.__TEST_applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();

    expect(typeof window.__TEST_dumpState).toBe('function');
    const dumped = window.__TEST_dumpState();
    expect(dumped.inputs).toEqual(baseInputs);
    expect(dumped.volumes).toEqual(baseVolumes);
  });

  it('schedules draw with drillpipe and flow overlay', async () => {
    mockGatherInputs.mockReturnValue({ ...baseInputs });
    mockGatherDrillPipeInput.mockReturnValue({
      mode: 'drillpipe',
      pipes: [{ size: 0, length: 100 }]
    });
    mockGatherTubingInput.mockReturnValue({ count: 0, tubings: [] });
    mockGatherFlowVelocityInput.mockReturnValue({});
    mockGatherPressureInput.mockReturnValue({});

    await import('../script.js');

    expect(mockScheduleDraw).toHaveBeenCalled();
    const [, opts] = mockScheduleDraw.mock.calls.at(-1);
    expect(opts.showWater).toBe(true);
    expect(opts.waterDepth).toBe(75);
    expect(opts.drillPipeSegments).toHaveLength(1);
    expect(opts.flowOverlay).toBeDefined();
    expect(mockRenderUpperCompletionBreakdown).toHaveBeenCalledWith(
      expect.any(Object),
      'drillpipe'
    );
  });

  it('forces recalculation and flushes scheduled draw', async () => {
    mockGatherInputs.mockReturnValue({
      ...baseInputs,
      riserTypeVal: 'fixed',
      riserDepthVal: 10,
      wellheadDepthVal: 30
    });
    mockGatherDrillPipeInput.mockReturnValue({ mode: 'tubing', pipes: [] });
    mockGatherTubingInput.mockReturnValue({
      count: 1,
      tubings: [{ top: 0, shoe: 200, length: 200, size: 0 }]
    });
    mockGatherFlowVelocityInput.mockReturnValue({});
    mockGatherPressureInput.mockReturnValue({});

    await import('../script.js');

    expect(typeof window.__TEST_force_recalc).toBe('function');
    expect(window.__TEST_force_recalc()).toBe(true);
    expect(mockDrawSchematic).toHaveBeenCalled();
    expect(mockFlushDraw).toHaveBeenCalled();
  });
});
