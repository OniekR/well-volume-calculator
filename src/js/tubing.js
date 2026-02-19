/**
 * Tubing Module
 * Handles tapered tubing selection, calculation, and UI management
 */

import { DEFAULT_TUBING_CATALOG, getTubingCatalog } from './definitions.js';

export const TUBING_CATALOG = DEFAULT_TUBING_CATALOG;

/**
 * Update the calculated top depth displays based on cumulative lengths
 */
export function updateTubingDepthDisplays() {
  const container = document.getElementById('tubing_inputs_container');
  if (!container) return;

  const rows = container.querySelectorAll('.tubing-input-row');
  let cumulativeDepth = 0;

  rows.forEach((row) => {
    const lengthInput = row.querySelector('input[id^="tubing_length_"]');
    const topDisplay = row.querySelector('input[id^="tubing_top_"]');

    if (topDisplay) {
      topDisplay.value = String(cumulativeDepth);
    }

    if (lengthInput) {
      const length = parseFloat(lengthInput.value) || 0;
      cumulativeDepth += length;
    }
  });
}

/**
 * Get tubing state from DOM
 * Calculates cumulative top/shoe depths based on user-entered lengths
 * @returns {Object} - { count: number, tubings: [{size, length, top, shoe}, ...] }
 */
export function gatherTubingInput() {
  const catalog = getTubingCatalog();
  const ucCheckbox = document.getElementById('use_upper_completion');

  // If upper completion checkbox is unchecked, return empty data
  if (ucCheckbox && !ucCheckbox.checked) {
    return { count: 0, tubings: [] };
  }

  // Get count from active button (1, 2, or 3 tubings)
  const activeBtn = document.querySelector('.tubing-count-btn.active');
  const count = activeBtn ? parseInt(activeBtn.dataset.count, 10) : 1;

  const tubings = [];
  let cumulativeDepth = 0; // Track top of next tubing

  for (let i = 0; i < count; i++) {
    const sizeSelect = document.getElementById(`tubing_size_${i}`);
    const lengthInput = document.getElementById(`tubing_length_${i}`);

    if (!sizeSelect || !lengthInput) continue;

    const selectedIndex = parseInt(sizeSelect.value, 10);
    const sizeName = catalog[selectedIndex]?.name || '';
    const length = parseFloat(lengthInput.value) || 0;
    const top = cumulativeDepth;
    const shoe = top + length;
    const lPerM = catalog[selectedIndex]?.lPerM;
    const od = catalog[selectedIndex]?.od;
    const id = catalog[selectedIndex]?.id;

    tubings.push({
      size: selectedIndex,
      sizeName,
      top,
      shoe,
      length,
      lPerM,
      od,
      id
    });

    // Next tubing's top = this tubing's shoe
    cumulativeDepth = shoe;
  }

  return { count, tubings };
}

/**
 * Render tubing inputs based on count
 * Shows size selector and length input; top/shoe are calculated automatically
 */
export function renderTubingInputs(count) {
  const catalog = getTubingCatalog();
  const container = document.getElementById('tubing_inputs_container');
  if (!container) return;

  // Preserve existing input values before re-rendering
  const preservedValues = {};
  const existingRows = container.querySelectorAll('.tubing-input-row');
  existingRows.forEach((row, idx) => {
    const lengthInput = row.querySelector('input[id^="tubing_length_"]');
    const sizeSelect = row.querySelector('select[id^="tubing_size_"]');
    if (lengthInput && sizeSelect) {
      preservedValues[idx] = {
        length: lengthInput.value,
        size: sizeSelect.value
      };
    }
  });

  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'input-row tubing-input-row three-cols';

    // Size selector wrapper (label + select stacked vertically)
    const sizeWrapper = document.createElement('div');
    sizeWrapper.className = 'tubing-size-wrapper';

    const sizeLabel = document.createElement('label');
    sizeLabel.htmlFor = `tubing_size_${i}`;
    sizeLabel.textContent = `Tubing ${i + 1}`;

    const sizeSelect = document.createElement('select');
    sizeSelect.id = `tubing_size_${i}`;
    sizeSelect.className = 'tubing-size-select';
    sizeSelect.setAttribute('aria-label', `Tubing size ${i + 1}`);

    for (let idx = 0; idx < catalog.length; idx++) {
      const tubing = catalog[idx];
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = tubing.name;
      sizeSelect.appendChild(option);
    }

    let defaultIndex = i === 0 ? 1 : 0; // Default first tubing to larger size
    if (preservedValues[i] && preservedValues[i].size) {
      defaultIndex = preservedValues[i].size;
    }
    sizeSelect.value = String(defaultIndex);

    sizeWrapper.appendChild(sizeLabel);
    sizeWrapper.appendChild(sizeSelect);

    // Length input wrapper (label + input stacked vertically)
    const lengthWrapper = document.createElement('div');
    lengthWrapper.className = 'tubing-length-wrapper';

    // Length input
    const lengthLabel = document.createElement('label');
    lengthLabel.htmlFor = `tubing_length_${i}`;
    lengthLabel.textContent = 'Length (m):';

    const lengthInput = document.createElement('input');
    lengthInput.id = `tubing_length_${i}`;
    lengthInput.type = 'number';
    lengthInput.className = 'tubing-length-input';
    lengthInput.step = '1';
    lengthInput.min = '0';
    lengthInput.value = preservedValues[i] ? preservedValues[i].length : '0';
    lengthInput.setAttribute(
      'aria-label',
      `Length of tubing ${i + 1} in meters`
    );

    lengthWrapper.appendChild(lengthLabel);
    lengthWrapper.appendChild(lengthInput);

    // Top depth display wrapper (label + input stacked vertically)
    const topWrapper = document.createElement('div');
    topWrapper.className = 'tubing-top-wrapper';

    // Top depth display (read-only, calculated)
    const topLabel = document.createElement('label');
    topLabel.htmlFor = `tubing_top_${i}`;
    topLabel.textContent = 'Top (m):';

    const topDisplay = document.createElement('input');
    topDisplay.id = `tubing_top_${i}`;
    topDisplay.type = 'number';
    topDisplay.className = 'tubing-top-display';
    topDisplay.readOnly = true;
    topDisplay.classList.add('readonly-input');
    topDisplay.value = '0';
    topDisplay.setAttribute(
      'aria-label',
      `Top depth of tubing ${i + 1} (calculated) in meters`
    );

    topWrapper.appendChild(topLabel);
    topWrapper.appendChild(topDisplay);

    // Append to row
    row.appendChild(sizeWrapper);
    row.appendChild(topWrapper);
    row.appendChild(lengthWrapper);

    container.appendChild(row);
  }

  // Calculate and display top depths after all rows are created
  updateTubingDepthDisplays();
}
