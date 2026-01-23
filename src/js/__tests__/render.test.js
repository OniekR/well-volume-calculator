import { describe, it, beforeEach, expect } from 'vitest';
import { renderResults } from '../render.js';

describe('renderResults', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="totalVolume"></div>
      <div id="plugAboveVolume">
        <span class="label">Volume above point of interest:</span>
        <span>— m³</span>
      </div>
      <div id="plugBelowVolume">
        <span class="label">Volume below point of interest:</span>
        <span>— m³</span>
      </div>
      <table id="casingVolumes"><tbody></tbody></table>
      <div id="riser_length_note"></div>
      <div id="production_length_note"></div>
    `;
  });

  it('renders totals and per-casing rows', () => {
    const result = {
      totalVolume: 12.34,
      plugAboveVolume: 1.1,
      plugBelowVolume: 11.24,
      perCasingVolumes: [
        {
          role: 'riser',
          use: true,
          volume: 1,
          includedLength: 2,
          perMeter_m3: 0.001,
          physicalLength: 2
        },
        {
          role: 'production',
          use: true,
          volume: 11.34,
          includedLength: 10,
          perMeter_m3: 0.001134
        }
      ]
    };

    renderResults(result);

    expect(document.getElementById('totalVolume').textContent).toBe('12.34 m³');

    // Check value in the span (not the full element which includes label)
    const plugAboveValueSpan = document
      .getElementById('plugAboveVolume')
      .querySelector('span:not(.label)');
    const plugBelowValueSpan = document
      .getElementById('plugBelowVolume')
      .querySelector('span:not(.label)');
    expect(plugAboveValueSpan.textContent).toBe('1.10 m³');
    expect(plugBelowValueSpan.textContent).toBe('11.24 m³');

    const rows = document.querySelectorAll('#casingVolumes tbody tr');
    // 2 rows + totals row
    expect(rows.length).toBe(3);
    expect(rows[0].children[0].textContent).toBe('Riser');
    expect(rows[1].children[0].textContent).toBe('Production');

    // physical length note present
    expect(document.getElementById('riser_length_note').textContent).toContain(
      'Length: 2.0'
    );
  });

  it('renders drill pipe breakdown with riser at top and small liner at bottom', () => {
    document.body.innerHTML += `
      <section id="upper-completion-breakdown" class="volume-breakdown">
        <h2 id="upper-completion-breakdown-title"></h2>
        <div class="table-wrap">
          <table id="upperCompletionVolumes"><thead></thead><tbody></tbody></table>
        </div>
      </section>
    `;

    const breakdown = {
      used: true,
      sections: [
        {
          casing: 'small_liner',
          dpIdVolume: 1,
          annulusVolume: 1,
          dpLength: 10,
          dpLPerM: 0.1,
          annulusLPerM: 0.1
        },
        {
          casing: 'riser',
          dpIdVolume: 2,
          annulusVolume: 2,
          dpLength: 20,
          dpLPerM: 0.1,
          annulusLPerM: 0.1
        }
      ],
      dpIdVolume: 3,
      annulusVolume: 3,
      dpIdLength: 30
    };

    // Render in drillpipe mode
    const { renderUpperCompletionBreakdown } = require('../render.js');
    renderUpperCompletionBreakdown(breakdown, 'drillpipe');

    const rows = document.querySelectorAll('#upperCompletionVolumes tbody tr');
    // 2 data rows + totals
    expect(rows.length).toBe(3);
    // First data row should be the riser (outermost)
    expect(rows[0].children[0].textContent).toBe('Riser');
    // Second data row should be small liner
    expect(rows[1].children[0].textContent).toBe('Small liner');
  });

  it('shows both above and below POI volumes when UC is disabled', () => {
    // Add the UC-specific elements to the DOM with proper structure
    document.body.innerHTML += `
      <div id="plugAboveTubing" class="hidden"><span class="label">Volume above (tubing):</span><span>— m³</span></div>
      <div id="plugBelowTubing" class="hidden"><span class="label">Volume below (tubing):</span><span>— m³</span></div>
    `;

    // Update plugAboveVolume and plugBelowVolume with proper structure
    const plugAboveEl = document.getElementById('plugAboveVolume');
    const plugBelowEl = document.getElementById('plugBelowVolume');
    plugAboveEl.innerHTML =
      '<span class="label">Volume above point of interest:</span><span>— m³</span>';
    plugBelowEl.innerHTML =
      '<span class="label">Volume below point of interest:</span><span>— m³</span>';

    const result = {
      totalVolume: 500,
      plugAboveVolume: 150,
      plugBelowVolume: 350,
      plugAboveTubing: undefined,
      plugBelowTubing: undefined,
      plugAboveAnnulus: undefined,
      plugBelowAnnulus: undefined,
      perCasingVolumes: [],
      ucActive: false,
      dpMode: false
    };

    // Call renderResults with UC disabled
    renderResults(result, { ucEnabled: false, dpMode: false });

    const plugAboveTubingEl = document.getElementById('plugAboveTubing');
    const plugBelowTubingEl = document.getElementById('plugBelowTubing');

    // When UC is disabled, combined volumes should be shown
    expect(plugAboveEl.classList.contains('hidden')).toBe(false);
    expect(plugBelowEl.classList.contains('hidden')).toBe(false);

    // UC-specific volumes should be hidden
    expect(plugAboveTubingEl.classList.contains('hidden')).toBe(true);
    expect(plugBelowTubingEl.classList.contains('hidden')).toBe(true);

    // Values should be rendered in the value spans
    const aboveValueSpan = plugAboveEl.querySelector('span:not(.label)');
    const belowValueSpan = plugBelowEl.querySelector('span:not(.label)');
    expect(aboveValueSpan.textContent).toContain('150.00');
    expect(belowValueSpan.textContent).toContain('350.00');
  });
});
