import { describe, it, beforeEach, expect } from 'vitest';
import { renderResults } from '../render.js';

describe('renderResults', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="totalVolume"></div>
      <div id="plugAboveVolume"></div>
      <div id="plugBelowVolume"></div>
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
    expect(document.getElementById('plugAboveVolume').textContent).toBe(
      '1.10 m³'
    );
    expect(document.getElementById('plugBelowVolume').textContent).toBe(
      '11.24 m³'
    );

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
});
