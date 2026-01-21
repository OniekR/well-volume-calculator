import { describe, it, beforeEach, expect } from 'vitest';
import { renderResults } from '../render.js';

describe('renderResults upper completion exclusion', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="totalVolume"></div>
      <table id="casingVolumes"><tbody></tbody></table>
      <div id="riser_length_note"></div>
      <div id="production_length_note"></div>
    `;
  });

  it('does not render upper_completion rows when they are present but marked not in use', () => {
    const result = {
      totalVolume: 5,
      perCasingVolumes: [
        {
          role: 'upper_completion',
          use: false,
          volume: 1,
          includedLength: 10,
          perMeter_m3: 0.001
        },
        {
          role: 'production',
          use: true,
          volume: 4,
          includedLength: 100,
          perMeter_m3: 0.001
        }
      ]
    };

    renderResults(result);
    const rows = document.querySelectorAll('#casingVolumes tbody tr');
    // 1 rendered row + totals row
    expect(rows.length).toBe(2);
    expect(rows[0].children[0].textContent).toBe('Production');
  });
});
