import { describe, it, expect } from 'vitest';
import {
  convertFlowToM3s,
  diameterInchesToAreaM2,
  computeFlowVelocity
} from '../flow-velocity.js';

const buildFlowInput = (value, unit = 'lpm') => ({
  active: true,
  flowRateValue: value,
  flowRateUnit: unit,
  flowRateM3s: convertFlowToM3s(value, unit),
  depthMode: 'all',
  depthValue: undefined,
  pipeModeOverride: 'auto'
});

describe('flow velocity conversions', () => {
  it('converts L/min to m³/s', () => {
    const m3s = convertFlowToM3s(60, 'lpm');
    expect(m3s).toBeCloseTo(0.001, 6);
  });

  it('converts GPM to m³/s', () => {
    const m3s = convertFlowToM3s(10, 'gpm');
    expect(m3s).toBeCloseTo((10 * 0.003785411784) / 60, 10);
  });

  it('converts m³/h to m³/s', () => {
    const m3s = convertFlowToM3s(3.6, 'm3h');
    expect(m3s).toBeCloseTo(0.001, 6);
  });

  it('converts BPM to m³/s', () => {
    const m3s = convertFlowToM3s(1, 'bpm');
    expect(m3s).toBeCloseTo(0.158987294928 / 60, 10);
  });
});

describe('area calculations', () => {
  it('computes area from diameter in inches', () => {
    const area = diameterInchesToAreaM2(4);
    const expected = Math.PI * Math.pow((4 * 0.0254) / 2, 2);
    expect(area).toBeCloseTo(expected, 8);
  });
});

describe('computeFlowVelocity', () => {
  it('computes pipe and annulus velocity for a single casing', () => {
    const flowInput = buildFlowInput(1000, 'lpm');
    const tubingInput = {
      count: 1,
      tubings: [
        {
          top: 0,
          shoe: 1000,
          id: 4,
          od: 4.5,
          sizeName: '4"'
        }
      ]
    };
    const drillpipeInput = { mode: 'tubing', count: 0, pipes: [] };
    const casingsInput = [
      { role: 'production', id: 10, top: 0, depth: 1000, use: true, od: 12 }
    ];

    const result = computeFlowVelocity(flowInput, {
      casingsInput,
      drillpipeInput,
      tubingInput,
      surfaceInUse: false,
      intermediateInUse: false
    });

    expect(result.valid).toBe(true);
    expect(result.segments).toHaveLength(1);
    const segment = result.segments[0];
    const pipeArea = diameterInchesToAreaM2(4);
    const annulusArea =
      diameterInchesToAreaM2(10) - diameterInchesToAreaM2(4.5);
    expect(segment.pipe.velocityMps).toBeCloseTo(
      result.flowRateM3s / pipeArea,
      6
    );
    expect(segment.annuli[0].velocityMps).toBeCloseTo(
      result.flowRateM3s / annulusArea,
      6
    );
  });

  it('returns invalid when flow rate is zero', () => {
    const flowInput = buildFlowInput(0, 'lpm');
    const result = computeFlowVelocity(flowInput, {
      casingsInput: [],
      drillpipeInput: { mode: 'tubing', count: 0, pipes: [] },
      tubingInput: { count: 0, tubings: [] }
    });
    expect(result.valid).toBe(false);
  });

  it('handles multiple casings in the same depth range', () => {
    const flowInput = buildFlowInput(1500, 'lpm');
    const tubingInput = {
      count: 1,
      tubings: [
        {
          top: 0,
          shoe: 800,
          id: 4.5,
          od: 5,
          sizeName: '4 1/2"'
        }
      ]
    };
    const drillpipeInput = { mode: 'tubing', count: 0, pipes: [] };
    const casingsInput = [
      { role: 'production', id: 9.5, top: 0, depth: 800, use: true, od: 10 },
      { role: 'surface', id: 13.375, top: 0, depth: 800, use: true, od: 14 }
    ];

    const result = computeFlowVelocity(flowInput, {
      casingsInput,
      drillpipeInput,
      tubingInput
    });

    expect(result.valid).toBe(true);
    expect(result.segments[0].annuli.length).toBe(2);
  });
});
