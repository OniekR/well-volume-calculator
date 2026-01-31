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
        sizeIndex: '1',
        length: '1000'
      };

      const tubingRows = [];
      for (let i = 0; i < tubingCount; i++) {
        const t = tubings[i] || defaultTubing;
        tubingRows.push(`
          <div class="tubing-input-row">
            <select id="tubing_size_${i}">
              <option value="0" ${
                t.sizeIndex === '0' ? 'selected' : ''
              }>4 1/2" 12.6#</option>
              <option value="1" ${
                t.sizeIndex === '1' ? 'selected' : ''
              }>5 1/2" 17#</option>
            </select>
            <input id="tubing_length_${i}" type="number" value="${t.length}" />
            <input id="tubing_top_${i}" type="number" value="0" />
          </div>
        `);
      }

      document.body.innerHTML = `
        <input type="checkbox" id="use_upper_completion" ${
          useUC ? 'checked' : ''
        } />
        <div class="tubing-count-buttons">
          ${Array.from({ length: tubingCount }, (_, idx) => {
            const count = idx + 1;
            return `
              <button class="tubing-count-btn ${
                count === tubingCount ? 'active' : ''
              }" data-count="${count}">
                ${count}
              </button>
            `;
          }).join('')}
        </div>
        <div id="tubing_inputs_container">
          ${tubingRows.join('')}
        </div>
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
        tubings: [{ sizeIndex: '1', length: '1500' }]
      });
      const result = gatherTubingInput();
      expect(result.count).toBe(1);
      expect(result.tubings).toHaveLength(1);
      expect(result.tubings[0].id).toBe(4.892);
      expect(result.tubings[0].length).toBe(1500);
    });

    it('gathers multiple tubing inputs correctly', () => {
      setupTubingDOM({
        useUC: true,
        tubingCount: 2,
        tubings: [
          { sizeIndex: '1', length: '1000' },
          { sizeIndex: '0', length: '500' }
        ]
      });
      const result = gatherTubingInput();
      expect(result.count).toBe(2);
      expect(result.tubings).toHaveLength(2);
      expect(result.tubings[0].id).toBe(4.892);
      expect(result.tubings[0].length).toBe(1000);
      expect(result.tubings[1].id).toBe(3.958);
      expect(result.tubings[1].length).toBe(500);
    });

    it('handles zero length tubing', () => {
      setupTubingDOM({
        useUC: true,
        tubingCount: 1,
        tubings: [{ sizeIndex: '1', length: '0' }]
      });
      const result = gatherTubingInput();
      expect(result.tubings[0].length).toBe(0);
    });

    it('calculates cumulative top depths', () => {
      setupTubingDOM({
        useUC: true,
        tubingCount: 2,
        tubings: [
          { sizeIndex: '1', length: '1000' },
          { sizeIndex: '0', length: '500' }
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
      `;
    });

    it('creates correct number of tubing rows', () => {
      renderTubingInputs(2);
      const rows = document.querySelectorAll('.tubing-input-row');
      expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it('creates rows with required input elements', () => {
      renderTubingInputs(1);
      const container = document.getElementById('tubing_inputs_container');
      expect(container.querySelector('[id^="tubing_size_"]')).not.toBeNull();
      expect(container.querySelector('[id*="tubing_length"]')).not.toBeNull();
    });

    it('handles count of 0', () => {
      renderTubingInputs(0);
      const container = document.getElementById('tubing_inputs_container');
      const rows = container.querySelectorAll('.tubing-input-row');
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
          <div class="tubing-input-row">
            <input id="tubing_length_1" value="1000" />
            <input id="tubing_top_1" value="0" />
          </div>
          <div class="tubing-input-row">
            <input id="tubing_length_2" value="500" />
            <input id="tubing_top_2" value="0" />
          </div>
        </div>
      `;
    });

    it('updates depth displays based on tubing lengths', () => {
      updateTubingDepthDisplays();
      const top1 = document.getElementById('tubing_top_1');
      const top2 = document.getElementById('tubing_top_2');

      expect(top1.value).toBe('0');
      expect(top2.value).toBe('1000');
    });

    it('handles empty container gracefully', () => {
      document.getElementById('tubing_inputs_container').innerHTML = '';
      expect(() => updateTubingDepthDisplays()).not.toThrow();
    });
  });
});
