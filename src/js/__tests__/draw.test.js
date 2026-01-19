import { describe, test, expect, beforeEach, vi } from 'vitest';
import { initDraw, drawSchematic, resizeCanvasForDPR } from '../draw.js';

describe('draw module', () => {
  let ctxMock;
  let fakeCanvas;

  beforeEach(() => {
    ctxMock = {
      clearRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: () => {} })),
      fillRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      strokeStyle: null,
      lineWidth: null,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      fillStyle: null,
      font: null,
      textBaseline: null,
      measureText: vi.fn(() => ({ width: 20 })),
      setTransform: vi.fn()
    };

    fakeCanvas = {
      nodeType: 1,
      getContext: () => ctxMock,
      getBoundingClientRect: () => ({ width: 200, height: 400 }),
      width: 0,
      height: 0
    };

    // ensure devicePixelRatio stable
    globalThis.window.devicePixelRatio = 1;
  });

  test('drawSchematic clears canvas and draws', () => {
    initDraw(fakeCanvas);
    drawSchematic([], { showWater: false });
    expect(ctxMock.clearRect).toHaveBeenCalled();
  });

  test('drawSchematic renders preset label when provided', () => {
    initDraw(fakeCanvas);
    drawSchematic([], { currentPresetName: 'FOO' });
    // measureText is called to compute label size; fillText draws it
    expect(ctxMock.measureText).toHaveBeenCalled();
    expect(ctxMock.fillText).toHaveBeenCalledWith('FOO', 12, 8);
  });

  test('resizeCanvasForDPR sets width/height and calls setTransform', () => {
    fakeCanvas.getBoundingClientRect = () => ({ width: 100, height: 50 });
    globalThis.window.devicePixelRatio = 2;
    initDraw(fakeCanvas);
    resizeCanvasForDPR();
    expect(fakeCanvas.width).toBe(Math.round(100 * 2));
    expect(fakeCanvas.height).toBe(Math.round(50 * 2));
    expect(ctxMock.setTransform).toHaveBeenCalled();
  });
});
