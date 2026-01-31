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
        <form id="well-form">
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
        <section class="casing-input" id="surface_casing_section">
          <div class="casing-header"><h3>Surface</h3></div>
          <input type="checkbox" class="use-checkbox" id="use_surface_casing" checked />
          <div class="casing-body"></div>
        </section>
        <section class="casing-input" id="intermediate_casing_section">
          <div class="casing-header"><h3>Intermediate</h3></div>
          <input type="checkbox" class="use-checkbox" id="use_intermediate_casing" />
          <div class="casing-body"></div>
        </section>
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
      expect(deps.scheduleSave).toHaveBeenCalled();
    });
  });

  describe('setupButtons()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input id="wellhead_depth" value="100" />
        <input id="depth_7_top" value="" />
        <button class="wellhead-btn" data-target="depth_7_top">Wellhead</button>
      `;
    });

    it('sets up without errors', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      expect(() => setupButtons(deps)).not.toThrow();
    });

    it('updates target input and triggers save on wellhead button click', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupButtons(deps);
      document.querySelector('.wellhead-btn').click();
      expect(document.getElementById('depth_7_top').value).toBe('100');
      expect(deps.calculateVolume).toHaveBeenCalled();
      expect(deps.scheduleSave).toHaveBeenCalled();
    });
  });

  describe('setupProductionToggleButtons()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button id="production_casing_btn">Casing</button>
        <button class="liner-default-btn">Liner</button>
        <input type="checkbox" id="use_tieback" />
        <input type="checkbox" id="production_is_liner" />
        <input id="depth_7_top" value="" />
      `;
    });

    it('sets up without errors', () => {
      expect(() => setupProductionToggleButtons()).not.toThrow();
    });

    it('toggles between modes on button click', () => {
      setupProductionToggleButtons();
      const linerBtn = document.querySelector('.liner-default-btn');
      linerBtn.click();
      expect(linerBtn.classList.contains('active')).toBe(true);
    });
  });

  describe('setupTooltips()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button id="production_liner_info_btn"></button>
        <div id="production_liner_info_tooltip" class="hidden"></div>
        <button id="reservoir_default_info_btn"></button>
        <div id="reservoir_default_info_tooltip" class="hidden"></div>
        <button id="flow_help_info_btn"></button>
        <div id="flow_help_info_tooltip" class="hidden"></div>
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
        <input type="checkbox" id="uc_mode_toggle" />
        <section id="upper_completion_section" class="casing-input">
          <div class="casing-body"></div>
        </section>
        <input id="upper_completion_size_id" value="4.892" />
        <input id="depth_uc_top" value="0" />
        <input id="depth_uc" value="1000" />
        <section class="casing-input" id="production_casing_section">
          <input type="checkbox" class="use-checkbox" id="use_production_casing" checked />
          <input id="production_drift" value="5" />
        </section>
        <input id="depth_7_top" value="0" />
        <input id="depth_7" value="3000" />
      `;
    });

    it('executes without errors', () => {
      expect(() => checkUpperCompletionFit()).not.toThrow();
    });

    it('shows warning when UC does not fit', () => {
      checkUpperCompletionFit();
      const warning = document.getElementById('upper_completion_fit_warning');
      expect(warning).not.toBeNull();
    });

    it('shows OK when UC fits', () => {
      document.getElementById('production_drift').value = '10';
      checkUpperCompletionFit();
      const warning = document.getElementById('upper_completion_fit_warning');
      expect(warning).toBeNull();
    });

    it('handles UC checkbox unchecked', () => {
      document.getElementById('use_upper_completion').checked = false;
      expect(() => checkUpperCompletionFit()).not.toThrow();
    });
  });

  describe('initUI()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="well-form">
          <input id="test_input" value="100" />
        </form>
        <nav id="sidebar">
          <button class="sidebar-nav-button" data-section="casings">Casings</button>
        </nav>
        <section class="app-view" data-view="casings"></section>
      `;
    });

    it('initializes UI without errors', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn(),
        captureStateObject: vi.fn(),
        applyStateObject: vi.fn(),
        initDraw: vi.fn()
      };
      expect(() => initUI(deps)).not.toThrow();
    });
  });
});
