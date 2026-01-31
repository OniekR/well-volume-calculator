/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initDraw,
  disposeDraw,
  resizeCanvasForDPR,
  scheduleDraw,
  drawSchematic,
  __TEST_flush_draw
} from '../draw.js';

describe('draw.js', () => {
  let ctxMock;
  let fakeCanvas;

  beforeEach(() => {
    ctxMock = {
      clearRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
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
      textAlign: null,
      textBaseline: null,
      measureText: vi.fn(() => ({ width: 20 })),
      setTransform: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      strokeRect: vi.fn(),
      setLineDash: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn()
    };

    fakeCanvas = {
      nodeType: 1,
      getContext: vi.fn(() => ctxMock),
      getBoundingClientRect: vi.fn(() => ({ width: 400, height: 600 })),
      width: 0,
      height: 0,
      style: {}
    };

    globalThis.window.devicePixelRatio = 1;
    vi.useFakeTimers();
  });

  afterEach(() => {
    disposeDraw();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initDraw()', () => {
    it('initializes with canvas element', () => {
      expect(() => initDraw(fakeCanvas)).not.toThrow();
    });

    it('gets 2d context from canvas', () => {
      initDraw(fakeCanvas);
      expect(fakeCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('handles null canvas gracefully', () => {
      expect(() => initDraw(null)).not.toThrow();
    });

    it('handles undefined canvas gracefully', () => {
      expect(() => initDraw(undefined)).not.toThrow();
    });
  });

  describe('disposeDraw()', () => {
    it('disposes without error when not initialized', () => {
      expect(() => disposeDraw()).not.toThrow();
    });

    it('disposes after initialization', () => {
      initDraw(fakeCanvas);
      expect(() => disposeDraw()).not.toThrow();
    });

    it('can be called multiple times', () => {
      initDraw(fakeCanvas);
      disposeDraw();
      expect(() => disposeDraw()).not.toThrow();
    });
  });

  describe('resizeCanvasForDPR()', () => {
    it('resizes canvas based on bounding rect', () => {
      initDraw(fakeCanvas);
      resizeCanvasForDPR();
      expect(fakeCanvas.width).toBe(400);
      expect(fakeCanvas.height).toBe(600);
    });

    it('accounts for device pixel ratio', () => {
      globalThis.window.devicePixelRatio = 2;
      initDraw(fakeCanvas);
      resizeCanvasForDPR();
      expect(fakeCanvas.width).toBe(800);
      expect(fakeCanvas.height).toBe(1200);
    });

    it('handles non-initialized state gracefully', () => {
      expect(() => resizeCanvasForDPR()).not.toThrow();
    });
  });

  describe('scheduleDraw()', () => {
    const mockCasings = [
      {
        role: 'surface',
        name: 'Surface Casing',
        od: 13.375,
        id: 12.415,
        top: 0,
        shoe: 500,
        depth: 500,
        prevDepth: 0,
        index: 0,
        z: 0,
        hidden: false
      },
      {
        role: 'production',
        name: 'Production Casing',
        od: 7,
        id: 6.184,
        top: 0,
        shoe: 3000,
        depth: 3000,
        prevDepth: 500,
        index: 1,
        z: 1,
        hidden: false
      }
    ];

    it('schedules draw without immediate execution', () => {
      initDraw(fakeCanvas);
      scheduleDraw(mockCasings, {});
      expect(ctxMock.clearRect).not.toHaveBeenCalled();
    });

    it('executes draw after flush', () => {
      initDraw(fakeCanvas);
      scheduleDraw(mockCasings, {});
      __TEST_flush_draw();
      expect(ctxMock.clearRect).toHaveBeenCalled();
    });

    it('handles empty casings array', () => {
      initDraw(fakeCanvas);
      scheduleDraw([], {});
      __TEST_flush_draw();
      expect(ctxMock.clearRect).toHaveBeenCalled();
    });

    it('handles options parameter', () => {
      initDraw(fakeCanvas);
      const opts = {
        plugDepth: 1500,
        showWater: true,
        waterDepth: 2000,
        presetName: 'Test Well'
      };
      expect(() => {
        scheduleDraw(mockCasings, opts);
        __TEST_flush_draw();
      }).not.toThrow();
    });
  });

  describe('drawSchematic()', () => {
    const mockCasings = [
      {
        role: 'surface',
        name: 'Surface',
        od: 13.375,
        id: 12.415,
        top: 0,
        shoe: 500,
        depth: 500,
        prevDepth: 0,
        index: 0,
        z: 0,
        hidden: false
      }
    ];

    it('clears canvas before drawing', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, {});
      expect(ctxMock.clearRect).toHaveBeenCalled();
    });

    it('draws casings', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, {});
      expect(ctxMock.fillRect).toHaveBeenCalled();
    });

    it('handles hidden casings', () => {
      initDraw(fakeCanvas);
      const hiddenCasings = [{ ...mockCasings[0], hidden: true }];
      expect(() => drawSchematic(hiddenCasings, {})).not.toThrow();
    });

    it('draws plug line when plugDepth provided', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, { plugDepth: 250 });
      expect(ctxMock.beginPath).toHaveBeenCalled();
      expect(ctxMock.stroke).toHaveBeenCalled();
    });

    it('draws water level when showWater is true', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, { showWater: true, waterDepth: 300 });
      expect(ctxMock.fillRect).toHaveBeenCalled();
    });

    it('draws preset label when presetName provided', () => {
      initDraw(fakeCanvas);
      drawSchematic(mockCasings, { presetName: 'Test Well' });
      expect(ctxMock.fillText).toHaveBeenCalled();
    });

    it('handles non-initialized state gracefully', () => {
      expect(() => drawSchematic(mockCasings, {})).not.toThrow();
    });

    it('draws upper completion when UC data provided', () => {
      initDraw(fakeCanvas);
      const opts = {
        upperCompletion: {
          top: 0,
          shoe: 4000,
          id: 4.892
        }
      };
      expect(() => drawSchematic(mockCasings, opts)).not.toThrow();
    });

    it('draws tubing when tubing data provided', () => {
      initDraw(fakeCanvas);
      const opts = {
        tubing: {
          tubings: [{ top: 0, shoe: 3500, od: 4.5, id: 3.958 }]
        }
      };
      expect(() => drawSchematic(mockCasings, opts)).not.toThrow();
    });

    it('draws drillpipe when drillpipe data provided', () => {
      initDraw(fakeCanvas);
      const opts = {
        drillpipe: {
          top: 0,
          shoe: 3000,
          od: 5,
          id: 4.276
        }
      };
      expect(() => drawSchematic(mockCasings, opts)).not.toThrow();
    });
  });
});
