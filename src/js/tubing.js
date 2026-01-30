/**
 * Tubing Module
 * Handles tapered tubing selection, calculation, and UI management
 */

export const TUBING_CATALOG = [
  {
    name: '4 1/2" 12.6# L-80',
    id: 3.958,
    od: 4.5,
    lPerM: 9.728,
    eod: 0
  },
  {
    name: '5 1/2" 17#',
    id: 4.892,
    od: 5.5,
    lPerM: 11.803,
    eod: 0
  }
];

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
    const sizeName = TUBING_CATALOG[selectedIndex]?.name || '';
    const length = parseFloat(lengthInput.value) || 0;
    const top = cumulativeDepth;
    const shoe = top + length;
    const lPerM = TUBING_CATALOG[selectedIndex]?.lPerM;
    const od = TUBING_CATALOG[selectedIndex]?.od;
    const id = TUBING_CATALOG[selectedIndex]?.id;

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

    // Size selector
    const sizeLabel = document.createElement('label');
    sizeLabel.htmlFor = `tubing_size_${i}`;
    sizeLabel.textContent = `Tubing ${i + 1}`;

    const sizeSelect = document.createElement('select');
    sizeSelect.id = `tubing_size_${i}`;
    sizeSelect.className = 'tubing-size-select';
    sizeSelect.setAttribute('aria-label', `Tubing size ${i + 1}`);

    for (let idx = 0; idx < TUBING_CATALOG.length; idx++) {
      const tubing = TUBING_CATALOG[idx];
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

    // Append to row
    row.appendChild(sizeLabel);
    row.appendChild(sizeSelect);
    row.appendChild(lengthLabel);
    row.appendChild(lengthInput);
    row.appendChild(topLabel);
    row.appendChild(topDisplay);

    container.appendChild(row);
  }

  // Calculate and display top depths after all rows are created
  updateTubingDepthDisplays();
}
