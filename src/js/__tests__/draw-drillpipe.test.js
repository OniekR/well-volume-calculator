import { describe, test, expect, beforeEach, vi } from 'vitest';
import { initDraw, drawSchematic } from '../draw.js';

describe('draw drill pipe segments', () => {
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

    globalThis.window.devicePixelRatio = 1;
  });

  test('drawSchematic draws drill pipe segments including 5" size', () => {
    initDraw(fakeCanvas);
    // Pass a single dp segment using the new 5" size index (2)
    const dpSegments = [{ size: 2, length: 10 }];
    drawSchematic([], { drillPipeSegments: dpSegments });

    // Ensure fillRect called for body and inner
    expect(ctxMock.fillRect).toHaveBeenCalled();
  });
});
