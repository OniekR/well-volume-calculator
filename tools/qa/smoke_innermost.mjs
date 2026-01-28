import { computeVolumes } from '../../src/js/logic.js';

const casings = [
  { role: 'riser', id: 20, od: 20.75, depth: 361.5, use: true, top: 0 },
  {
    role: 'intermediate',
    id: 13.5,
    od: 14.375,
    depth: 1719.5,
    use: true,
    top: 361.5
  },
  {
    role: 'production',
    id: 8.681,
    od: 9.625,
    depth: 3277.5,
    use: true,
    top: 2081
  },
  {
    role: 'reservoir',
    id: 6.184,
    od: 7.875,
    depth: 4065,
    use: true,
    top: 3200
  },
  {
    role: 'upper_completion',
    id: 4.892,
    od: 5.5,
    depth: 3200,
    use: true,
    top: 0
  }
];

const result = computeVolumes(casings, {
  plugEnabled: true,
  plugDepthVal: 362,
  surfaceInUse: false,
  intermediateInUse: true,
  drillPipe: { mode: 'tubing', pipes: [] },
  subtractEod: true
});

console.log('casingVolumeBelowTubingShoe:', result.casingVolumeBelowTubingShoe);
console.log(
  'perCasingVolumes:',
  result.perCasingVolumes.map((c) => ({ role: c.role, volume: c.volume }))
);
console.log('plugBelowTubing:', result.plugBelowTubing);
console.log('plugBelowAnnulus:', result.plugBelowAnnulus);
console.log('plugBelowVolumeTubing:', result.plugBelowVolumeTubing);
