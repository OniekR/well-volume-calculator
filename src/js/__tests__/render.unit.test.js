/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderResults, renderUpperCompletionBreakdown } from '../render.js';

describe('render.js', () => {
  let originalBody;

  beforeEach(() => {
    originalBody = document.body.innerHTML;
    document.body.innerHTML = `
      <div id="totalVolume"></div>
      <div id="plugAboveVolume" class="hidden">
        <span class="label">Volume above point of interest:</span>
        <span>— m³</span>
      </div>
      <div id="plugBelowVolume" class="hidden">
        <span class="label">Volume below point of interest:</span>
        <span>— m³</span>
      </div>
      <table id="casingVolumes">
        <tbody></tbody>
      </table>
      <div id="surface_length_note"></div>
      <div id="intermediate_length_note"></div>
      <div id="production_length_note"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = originalBody;
  });

  describe('renderResults()', () => {
    const mockResult = {
      totalVolume: 151.25,
      plugAboveVolume: 65.55,
      plugBelowVolume: 85.7,
      perCasingVolumes: [
        {
          role: 'surface',
          use: true,
          volume: 50.5,
          includedLength: 1000,
          perMeter_m3: 0.00005,
          physicalLength: 1000
        },
        {
          role: 'production',
          use: true,
          volume: 100.75,
          includedLength: 2000,
          perMeter_m3: 0.00005
        }
      ],
      ucActive: false,
      dpMode: false
    };

    it('renders total volume', () => {
      renderResults(mockResult, {});
      const totalEl = document.getElementById('totalVolume');
      expect(totalEl.textContent).toBe('151.25 m³');
    });

    it('renders plug above volume', () => {
      renderResults(mockResult, {});
      const aboveEl = document.getElementById('plugAboveVolume');
      const aboveValue = aboveEl.querySelector('span:not(.label)');
      expect(aboveValue.textContent).toBe('65.55 m³');
    });

    it('renders plug below volume', () => {
      renderResults(mockResult, {});
      const belowEl = document.getElementById('plugBelowVolume');
      const belowValue = belowEl.querySelector('span:not(.label)');
      expect(belowValue.textContent).toBe('85.70 m³');
    });

    it('renders casing rows in table', () => {
      renderResults(mockResult, {});
      const tbody = document.querySelector('#casingVolumes tbody');
      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).toBe(3);
    });

    it('shows combined plug volumes when UC disabled', () => {
      renderResults(mockResult, { ucEnabled: false, dpMode: false });
      const plugAboveEl = document.getElementById('plugAboveVolume');
      const plugBelowEl = document.getElementById('plugBelowVolume');
      expect(plugAboveEl.classList.contains('hidden')).toBe(false);
      expect(plugBelowEl.classList.contains('hidden')).toBe(false);
    });

    it('skips upper completion casing rows', () => {
      const resultWithUC = {
        ...mockResult,
        perCasingVolumes: [
          ...mockResult.perCasingVolumes,
          {
            role: 'upper_completion',
            use: true,
            volume: 10,
            includedLength: 100,
            perMeter_m3: 0.0001
          }
        ]
      };
      renderResults(resultWithUC, {});
      const rows = document.querySelectorAll('#casingVolumes tbody tr');
      expect(rows.length).toBe(3);
    });

    it('renders physical length notes when provided', () => {
      renderResults(mockResult, {});
      const noteEl = document.getElementById('surface_length_note');
      expect(noteEl.textContent).toContain('Length: 1000.0');
    });

    it('formats volumes to reasonable decimal places', () => {
      const preciseResult = {
        ...mockResult,
        total: {
          volume: 151.256789,
          abovePlug: 65.123456,
          belowPlug: 85.789012
        }
      };
      renderResults(preciseResult, {});
      const totalEl = document.getElementById('totalVolume');
      expect(totalEl.textContent.length).toBeLessThan(15);
    });
  });

  describe('renderUpperCompletionBreakdown()', () => {
    const mockBreakdown = {
      used: true,
      sections: [
        {
          depth: 1000,
          ucIdVolume: 10,
          annulusVolume: 5,
          sectionLength: 1000,
          ucLPerM: 10
        },
        {
          depth: 2000,
          ucIdVolume: 20,
          annulusVolume: 10,
          sectionLength: 1000,
          ucLPerM: 20
        }
      ],
      ucIdVolume: 30,
      annulusVolume: 15,
      ucIdLength: 2000
    };

    beforeEach(() => {
      document.body.innerHTML += `
        <section id="upper-completion-breakdown" class="hidden">
          <h2 id="upper-completion-breakdown-title"></h2>
          <table id="upperCompletionVolumes">
            <thead></thead>
            <tbody></tbody>
          </table>
        </section>
      `;
    });

    it('renders UC breakdown sections', () => {
      renderUpperCompletionBreakdown(mockBreakdown, 'tubing');
      const rows = document.querySelectorAll('#upperCompletionVolumes tbody tr');
      expect(rows.length).toBe(3);
    });

    it('shows UC results section', () => {
      renderUpperCompletionBreakdown(mockBreakdown, 'tubing');
      const section = document.getElementById('upper-completion-breakdown');
      expect(section.classList.contains('hidden')).toBe(false);
    });

    it('handles empty breakdown', () => {
      const emptyBreakdown = {
        used: true,
        sections: [],
        ucIdVolume: 0,
        annulusVolume: 0,
        ucIdLength: 0
      };
      expect(() =>
        renderUpperCompletionBreakdown(emptyBreakdown, 'tubing')
      ).not.toThrow();
    });

    it('updates title for drillpipe mode', () => {
      renderUpperCompletionBreakdown(mockBreakdown, 'drillpipe');
      const title = document.getElementById('upper-completion-breakdown-title');
      expect(title.textContent).toBe('Drill Pipe breakdown');
    });

    it('handles unused breakdown', () => {
      const unusedBreakdown = { used: false };
      renderUpperCompletionBreakdown(unusedBreakdown, 'tubing');
      const section = document.getElementById('upper-completion-breakdown');
      expect(section.classList.contains('hidden')).toBe(true);
    });
  });
});
