/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setupEventDelegation,
  setupCasingToggles,
  setupButtons,
  setupProductionToggleButtons,
  setupTooltips,
  setupWellheadSync,
  setupTiebackBehavior,
  setupRiserPositionToggle,
  setupRiserTypeHandler,
  setupEodToggle,
  setupPlugToggle,
  setupNavActive,
  setupThemeToggle,
  initUpperCompletionChecks,
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

  describe('setupCasingToggles() with upper completion', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <section class="casing-input" id="upper_completion_section">
          <div class="casing-header"><h3>Upper Completion</h3></div>
          <input type="checkbox" class="use-checkbox" id="use_upper_completion" />
          <div class="casing-body"></div>
        </section>
      `;
    });

    it('keeps upper completion section expanded', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupCasingToggles(deps);
      const section = document.getElementById('upper_completion_section');
      const header = section.querySelector('.casing-header');
      expect(section.classList.contains('collapsed')).toBe(false);
      expect(header.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('setupButtons()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input id="wellhead_depth" value="100" />
        <input id="depth_9" value="200" />
        <input id="depth_7_top" value="" />
        <input id="depth_tb" value="" />
        <button class="wellhead-btn" data-target="depth_7_top">Wellhead</button>
        <button class="liner-default-btn">Liner</button>
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

    it('sets production top from intermediate shoe minus 50 on liner button click', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupButtons(deps);
      document.querySelector('.liner-default-btn').click();
      expect(document.getElementById('depth_7_top').value).toBe('150');
      expect(document.getElementById('depth_tb').value).toBe('150');
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

  describe('setupWellheadSync()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="wellhead-depth-container" class="hidden"></div>
        <input id="wellhead_depth" value="100" />
        <input id="depth_riser" value="" />
        <input type="checkbox" id="riser_subsea" />
        <input id="depth_18_top" value="" />
        <input id="depth_13_top" value="" />
      `;
    });

    it('syncs riser depth and updates surface tops on subsea toggle', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupWellheadSync(deps);
      const well = document.getElementById('wellhead_depth');
      well.value = '250';
      well.dispatchEvent(new Event('input'));
      expect(document.getElementById('depth_riser').value).toBe('250');
      const toggle = document.getElementById('riser_subsea');
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      expect(document.getElementById('depth_18_top').value).toBe('250');
      expect(document.getElementById('depth_13_top').value).toBe('250');
      expect(deps.calculateVolume).toHaveBeenCalled();
      expect(deps.scheduleSave).toHaveBeenCalled();
    });
  });

  describe('setupTiebackBehavior()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="production_is_liner" />
        <section id="tieback_casing" class="hidden"></section>
        <input type="checkbox" id="use_tieback" />
        <button id="production_casing_btn"></button>
        <button id="production_liner_info_btn"></button>
        <button class="liner-default-btn"></button>
        <input id="depth_tb" value="" />
        <input id="depth_tb_top" value="" />
        <input id="depth_7_top" value="120" />
        <input id="wellhead_depth" value="100" />
        <input type="checkbox" id="dummy_hanger" />
      `;
    });

    it('enables tieback when production liner is checked', () => {
      document.getElementById('production_is_liner').checked = true;
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupTiebackBehavior(deps);
      vi.runAllTimers();
      const tieback = document.getElementById('tieback_casing');
      const useTie = document.getElementById('use_tieback');
      const tb = document.getElementById('depth_tb');
      expect(tieback.classList.contains('hidden')).toBe(false);
      expect(useTie.checked).toBe(true);
      expect(tb.value).toBe('120');
      expect(deps.calculateVolume).toHaveBeenCalled();
      expect(deps.scheduleSave).toHaveBeenCalled();
    });

    it('does not apply dummy hanger depth when dummy is unchecked', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupTiebackBehavior(deps);

      const prodLiner = document.getElementById('production_is_liner');
      const tb = document.getElementById('depth_tb');
      const dummy = document.getElementById('dummy_hanger');
      const prodTop = document.getElementById('depth_7_top');

      prodTop.value = '1550';
      tb.value = '437';
      tb.dataset.userEdited = 'true';
      dummy.checked = false;

      prodLiner.checked = true;
      prodLiner.dispatchEvent(new Event('change'));

      expect(tb.value).toBe('1550');
      expect(tb.readOnly).toBe(true);
      expect(tb.classList.contains('readonly-input')).toBe(true);
    });

    it('hides tieback when production liner is unchecked', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupTiebackBehavior(deps);
      const tieback = document.getElementById('tieback_casing');
      const useTie = document.getElementById('use_tieback');
      expect(tieback.classList.contains('hidden')).toBe(true);
      expect(useTie.checked).toBe(false);
    });

    it('updates tieback values when dummy hanger is checked', () => {
      document.getElementById('production_is_liner').checked = true;
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupTiebackBehavior(deps);
      const dummy = document.getElementById('dummy_hanger');
      dummy.checked = true;
      dummy.dispatchEvent(new Event('change'));
      vi.runAllTimers();
      const tb = document.getElementById('depth_tb');
      expect(tb.value).toBe('175');
      expect(tb.classList.contains('readonly-input')).toBe(false);
    });

    it('keeps liner behavior when tie-back is unchecked from liner state', () => {
      document.getElementById('production_is_liner').checked = true;
      document.getElementById('depth_7_top').value = '1550';

      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };

      setupTiebackBehavior(deps);

      const prodLiner = document.getElementById('production_is_liner');
      const casingBtn = document.getElementById('production_casing_btn');
      const linerBtn = document.querySelector('.liner-default-btn');
      const prodTop = document.getElementById('depth_7_top');
      const tieBottom = document.getElementById('depth_tb');

      prodLiner.checked = false;
      prodLiner.dispatchEvent(new Event('change'));

      expect(casingBtn.classList.contains('active')).toBe(false);
      expect(linerBtn.classList.contains('active')).toBe(true);
      expect(prodTop.value).toBe('1550');
      expect(tieBottom.value).toBe('1550');
    });

    it('resets dummy hanger when tie-back is toggled off and back on', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupTiebackBehavior(deps);

      const prodLiner = document.getElementById('production_is_liner');
      const dummy = document.getElementById('dummy_hanger');
      const prodTop = document.getElementById('depth_7_top');
      const tieBottom = document.getElementById('depth_tb');

      prodTop.value = '1550';
      prodLiner.checked = true;
      prodLiner.dispatchEvent(new Event('change'));

      dummy.checked = true;
      dummy.dispatchEvent(new Event('change'));
      expect(dummy.checked).toBe(true);

      prodLiner.checked = false;
      prodLiner.dispatchEvent(new Event('change'));
      expect(dummy.checked).toBe(false);

      prodLiner.checked = true;
      prodLiner.dispatchEvent(new Event('change'));

      expect(dummy.checked).toBe(false);
      expect(tieBottom.value).toBe('1550');
      expect(tieBottom.readOnly).toBe(true);
      expect(tieBottom.classList.contains('readonly-input')).toBe(true);
    });
  });

  describe('setupRiserPositionToggle()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="riser_subsea" />
        <span id="riser_position_label"></span>
      `;
    });

    it('updates label based on toggle state', () => {
      setupRiserPositionToggle();
      const label = document.getElementById('riser_position_label');
      expect(label.textContent).toBe('Fixed');
      const toggle = document.getElementById('riser_subsea');
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      expect(label.textContent).toBe('Subsea');
    });
  });

  describe('setupRiserTypeHandler()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <select id="riser_type">
          <option value="none" selected>None</option>
          <option value="standard">Standard</option>
        </select>
        <input id="depth_riser" value="" />
        <input id="wellhead_depth" value="250" />
        <div id="depth_riser_container"></div>
      `;
    });

    it('hides riser depth when none selected and restores on change', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupRiserTypeHandler(deps);
      const container = document.getElementById('depth_riser_container');
      expect(container.classList.contains('hidden')).toBe(true);
      const select = document.getElementById('riser_type');
      select.value = 'standard';
      select.dispatchEvent(new Event('change'));
      expect(container.classList.contains('hidden')).toBe(false);
      expect(document.getElementById('depth_riser').value).toBe('250');
    });
  });

  describe('setupEodToggle()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="subtract_eod_toggle" checked />
        <span id="eod_toggle_label"></span>
      `;
    });

    it('updates label and calls deps on change', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupEodToggle(deps);
      const label = document.getElementById('eod_toggle_label');
      expect(label.textContent).toBe('On');
      const toggle = document.getElementById('subtract_eod_toggle');
      toggle.checked = false;
      toggle.dispatchEvent(new Event('change'));
      expect(label.textContent).toBe('Off');
      expect(deps.calculateVolume).toHaveBeenCalled();
      expect(deps.scheduleSave).toHaveBeenCalled();
    });
  });

  describe('setupPlugToggle()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="use_plug" />
        <div id="plug-panel" class="hidden"></div>
      `;
    });

    it('shows and hides plug panel based on toggle', () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn()
      };
      setupPlugToggle(deps);
      const panel = document.getElementById('plug-panel');
      expect(panel.classList.contains('hidden')).toBe(true);
      const toggle = document.getElementById('use_plug');
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      expect(panel.classList.contains('hidden')).toBe(false);
    });
  });

  describe('setupNavActive()', () => {
    beforeEach(() => {
      window.history.pushState({}, '', '/flow');
      document.body.innerHTML = `
        <nav class="linker">
          <a href="http://localhost/flow">Flow</a>
          <a href="http://localhost/other">Other</a>
        </nav>
      `;
    });

    it('adds active class to matching link', () => {
      setupNavActive();
      const links = document.querySelectorAll('.linker a');
      expect(links[0].classList.contains('active')).toBe(true);
      expect(links[1].classList.contains('active')).toBe(false);
    });
  });

  describe('setupThemeToggle()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="checkbox" id="theme_toggle" />
        <span id="theme_label"></span>
      `;
      localStorage.setItem('keino_theme', 'dark');
    });

    it('applies stored theme and updates label on change', () => {
      setupThemeToggle();
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      const label = document.getElementById('theme_label');
      expect(label.textContent).toBe('Light mode');
      const toggle = document.getElementById('theme_toggle');
      toggle.checked = false;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
      expect(localStorage.getItem('keino_theme')).toBe('light');
    });
  });

  describe('initUpperCompletionChecks()', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <select id="upper_completion_size"></select>
        <input id="upper_completion_size_id" value="4.892" />
        <input id="depth_uc_top" value="100" />
        <input id="depth_uc" value="200" />
        <button class="tubing-count-btn"></button>
      `;
    });

    it('attaches listeners and triggers calculations on input', () => {
      const deps = {
        calculateVolume: vi.fn()
      };
      initUpperCompletionChecks(deps);
      const topEl = document.getElementById('depth_uc_top');
      topEl.value = '150';
      topEl.dispatchEvent(new Event('input'));
      vi.runAllTimers();
      expect(deps.calculateVolume).toHaveBeenCalled();
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

  describe('initUI() drillpipe/tubing mode wiring', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="well-form"></form>
        <section id="upper_completion_section" class="casing-input">
          <div class="casing-header"><h3>Upper completion</h3></div>
        </section>
        <input type="checkbox" id="use_upper_completion" checked />
        <input type="checkbox" id="uc_mode_toggle" />
        <div id="uc_tubing_section"></div>
        <div id="uc_drillpipe_section" class="hidden"></div>
        <div id="drillpipe_inputs_container"></div>
        <button class="drillpipe-count-btn active" data-count="2"></button>
        <button class="drillpipe-count-btn" data-count="1"></button>
        <div id="tubing_inputs_container"></div>
        <button class="tubing-count-btn active" data-count="1"></button>
        <button class="tubing-count-btn" data-count="2"></button>
      `;
    });

    it('toggles sections when drillpipe mode is enabled', async () => {
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn(),
        captureStateObject: vi.fn(),
        applyStateObject: vi.fn(),
        initDraw: vi.fn()
      };
      initUI(deps);
      await vi.runAllTimersAsync();
      const toggle = document.getElementById('uc_mode_toggle');
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      const tubingSection = document.getElementById('uc_tubing_section');
      const drillpipeSection = document.getElementById('uc_drillpipe_section');
      expect(tubingSection.classList.contains('hidden')).toBe(true);
      expect(drillpipeSection.classList.contains('hidden')).toBe(false);
    });

    it('disables tubing controls when UC is unchecked', async () => {
      document.getElementById('use_upper_completion').checked = false;
      const tubingSection = document.getElementById('uc_tubing_section');
      const input = document.createElement('input');
      tubingSection.appendChild(input);
      const drillpipeSection = document.getElementById('uc_drillpipe_section');
      const dpInput = document.createElement('input');
      drillpipeSection.appendChild(dpInput);
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn(),
        captureStateObject: vi.fn(),
        applyStateObject: vi.fn(),
        initDraw: vi.fn()
      };
      initUI(deps);
      await vi.runAllTimersAsync();
      expect(input.disabled).toBe(true);
      expect(input.classList.contains('readonly-input')).toBe(true);
      expect(dpInput.disabled).toBe(true);
      expect(dpInput.classList.contains('readonly-input')).toBe(true);
      expect(document.getElementById('uc_mode_toggle').disabled).toBe(true);
    });

    it('updates tubing inputs and triggers recalculation', async () => {
      document.getElementById('uc_mode_toggle').checked = true;
      const deps = {
        calculateVolume: vi.fn(),
        scheduleSave: vi.fn(),
        captureStateObject: vi.fn(),
        applyStateObject: vi.fn(),
        initDraw: vi.fn()
      };
      initUI(deps);
      await vi.runAllTimersAsync();

      const countButtons = document.querySelectorAll('.tubing-count-btn');
      countButtons[1].click();

      const sizeSelect = document.querySelector('select[id^="tubing_size_"]');
      const lengthInput = document.querySelector('input[id^="tubing_length_"]');
      sizeSelect.dispatchEvent(new Event('change'));
      lengthInput.value = '120';
      lengthInput.dispatchEvent(new Event('input'));

      expect(deps.calculateVolume).toHaveBeenCalled();
      expect(deps.scheduleSave).toHaveBeenCalled();
    });
  });
});
