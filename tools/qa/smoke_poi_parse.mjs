import { JSDOM } from 'jsdom';

const html = `
  <input id="depth_riser" value="361,5">
  <input id="use_riser" type="checkbox" checked>
  <input id="depth_13" value="361,5">
  <input id="use_13" type="checkbox" checked>
  <input id="depth_9" value="1719,5">
  <input id="use_9" type="checkbox" checked>

  <input id="production_size_id" value="8.681">
  <input id="depth_7" value="3277,5">
  <input id="use_7" type="checkbox" checked>
  <input id="reservoir_size_id" value="7">
  <input id="depth_5" value="4065">
  <input id="use_5" type="checkbox" checked>
  <input id="depth_uc" value="3228,2">
  <input id="use_upper_completion" type="checkbox" checked>

  <input id="plug_depth" value="362">
  <input id="use_plug" type="checkbox" checked>
`;

const dom = new JSDOM(html);
global.window = dom.window;
global.document = dom.window.document;

// Import after setting up global document
import { gatherInputs } from '../../src/js/inputs.js';
import { computeVolumes } from '../../src/js/logic.js';

const inputs = gatherInputs();
console.log(
  'Gathered casings:',
  inputs.casingsInput.map((c) => ({
    role: c.role,
    depth: c.depth,
    top: c.top,
    use: c.use
  }))
);

const result = computeVolumes(inputs.casingsInput, {
  plugEnabled: inputs.plugEnabled,
  plugDepthVal: inputs.plugDepthVal,
  surfaceInUse: inputs.surfaceInUse,
  intermediateInUse: inputs.intermediateInUse,
  drillPipe: { mode: 'tubing', pipes: [] },
  subtractEod: true
});

console.log('casingVolumeBelowTubingShoe:', result.casingVolumeBelowTubingShoe);
console.log('plugBelowTubing:', result.plugBelowTubing);
console.log('plugBelowAnnulus:', result.plugBelowAnnulus);
console.log('plugBelowVolume:', result.plugBelowVolume);
console.log('plugBelowVolumeTubing:', result.plugBelowVolumeTubing);
