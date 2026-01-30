let canvasEl = null;
let ctx = null;
let drawScheduled = false;
let lastDrawArgs = null;

export function initDraw(canvas) {
  canvasEl =
    canvas && canvas.nodeType ? canvas : document.getElementById(canvas);
  try {
    ctx = canvasEl && canvasEl.getContext ? canvasEl.getContext('2d') : null;
  } catch (e) {
    ctx = null;
  }
  // initial resize
  resizeCanvasForDPR();
  // attach resize handler
  window.addEventListener('resize', debouncedResize);
}

export function disposeDraw() {
  window.removeEventListener('resize', debouncedResize);
  canvasEl = null;
  ctx = null;
}

export function resizeCanvasForDPR() {
  if (!canvasEl || !ctx) return;
  const rect = canvasEl.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(rect.width * dpr);
  const h = Math.round(rect.height * dpr);
  if (canvasEl.width !== w || canvasEl.height !== h) {
    canvasEl.width = w;
    canvasEl.height = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

const debouncedResize = (() => {
  let t;
  return () => {
    clearTimeout(t);
    t = setTimeout(() => resizeCanvasForDPR(), 120);
  };
})();

export function scheduleDraw(casings, opts = {}) {
  lastDrawArgs = { casings, opts };
  if (drawScheduled) return;
  drawScheduled = true;
  requestAnimationFrame(() => {
    drawScheduled = false;
    const args = lastDrawArgs || { casings: [], opts: {} };
    lastDrawArgs = null;
    drawSchematic(args.casings, args.opts);
  });
}

// Test helper: immediately draw with the last scheduled args, flushing any pending requestAnimationFrame
export function __TEST_flush_draw() {
  if (!lastDrawArgs) return false;
  const args = lastDrawArgs;
  lastDrawArgs = null;
  drawScheduled = false;
  drawSchematic(args.casings, args.opts);
  return true;
}

export function drawSchematic(casings, opts = {}) {
  if (!ctx || !canvasEl) return;
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

  const rect = canvasEl.getBoundingClientRect();

  // background
  const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
  gradient.addColorStop(0, '#87ceeb');
  gradient.addColorStop(0.15, '#e6d5b8');
  gradient.addColorStop(1, '#b8a684');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);

  const tubingMaxDepth =
    opts && opts.tubingSegments && opts.tubingSegments.length
      ? Math.max(
          ...opts.tubingSegments.map((t) => Number(t.shoe || t.length || 0))
        )
      : 0;

  const maxDepth = Math.max(
    opts && !isNaN(opts.waterDepth) ? opts.waterDepth : 0,
    casings.length ? Math.max(...casings.map((c) => c.depth)) : 0,
    tubingMaxDepth
  );

  const maxOD = casings.length ? Math.max(...casings.map((c) => c.od)) : 18.625;
  // If there is no depth information, normally we can abort early.
  // However, always allow rendering when a provided preset label (a UI overlay)
  // or tubing segments are present so tests and user overlays still appear.
  if (maxDepth === 0) {
    const hasLabel =
      typeof opts.currentPresetName === 'string' &&
      opts.currentPresetName.trim() !== '';
    const hasTubing =
      opts && opts.tubingSegments && opts.tubingSegments.length > 0;
    if (!hasLabel && !hasTubing) return;
  }

  const centerX = rect.width / 2;
  const startY = 50;
  const availableHeight = rect.height - 100;
  const scale = availableHeight / maxDepth;

  if (
    opts &&
    opts.showWater &&
    !isNaN(opts.waterDepth) &&
    opts.waterDepth > 0
  ) {
    const waterEndY = opts.waterDepth * scale + startY;
    const waterGrad = ctx.createLinearGradient(0, startY, 0, waterEndY);
    waterGrad.addColorStop(0, '#1E90FF');
    waterGrad.addColorStop(1, '#87CEFA');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, startY, rect.width, waterEndY - startY);
  }

  // Draw plug line if provided
  if (opts && typeof opts.plugDepth !== 'undefined' && !isNaN(opts.plugDepth)) {
    const pd = opts.plugDepth;
    if (pd >= 0 && pd <= maxDepth) {
      const y = pd * scale + startY;
      ctx.save();
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - rect.width * 0.45, y);
      ctx.lineTo(centerX + rect.width * 0.45, y);
      ctx.stroke();
      ctx.fillStyle = '#ff0000';
      ctx.font = `${Math.max(10, Math.round(rect.width * 0.012))}px Arial`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        'Plug @ ' + pd.toFixed(1) + ' m',
        centerX + rect.width * 0.46,
        y
      );
      ctx.restore();
    }
  }

  // draw current preset name (if any) near top-left of canvas
  if (
    typeof opts.currentPresetName === 'string' &&
    opts.currentPresetName.trim() !== ''
  ) {
    ctx.save();
    const themeIsDark =
      document.documentElement.getAttribute('data-theme') === 'dark';
    const fontSize = Math.max(12, Math.round(rect.width * 0.018));
    ctx.font = `600 ${fontSize}px Arial`;
    ctx.textBaseline = 'top';
    const paddingX = 10;
    const paddingY = 6;
    const text = opts.currentPresetName;
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const boxX = 12 - paddingX;
    const boxY = 8 - paddingY;
    const boxW = textW + paddingX * 2;
    const boxH = fontSize + paddingY * 2;
    if (themeIsDark) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = '#111';
    }
    ctx.fillText(text, 12, 8);
    ctx.restore();
  }

  // wellhead
  ctx.fillStyle = '#333';
  ctx.fillRect(centerX - 30, startY - 30, 60, 30);
  ctx.fillStyle = '#666';
  ctx.fillRect(centerX - 25, startY - 40, 50, 15);

  const colors = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460'];

  casings
    .slice()
    .sort(
      (a, b) =>
        (a.z || 0) - (b.z || 0) || a.prevDepth - b.prevDepth || b.od - a.od
    )
    .forEach((casing) => {
      const idx = casing.index % colors.length;
      const startDepth = casing.prevDepth * scale + startY;
      const endDepth = casing.depth * scale + startY;

      if (casing.role === 'open_hole') {
        const width = (casing.od / maxOD) * 80;
        const topY = startDepth;
        const bottomY = endDepth;

        ctx.fillStyle = '#4E342E';
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1;
        ctx.beginPath();

        const jaggedAmp = 2;
        const jaggedStep = 5;

        const leftBase = centerX - width / 2;
        ctx.moveTo(leftBase, topY);
        const steps = Math.ceil((bottomY - topY) / jaggedStep);
        for (let i = 0; i <= steps; i++) {
          const currY = Math.min(topY + i * jaggedStep, bottomY);
          const offset = i % 2 ? -jaggedAmp : jaggedAmp;
          ctx.lineTo(leftBase + offset, currY);
        }

        const rightBase = centerX + width / 2;
        ctx.lineTo(rightBase, bottomY);

        for (let i = steps; i >= 0; i--) {
          const currY = Math.min(topY + i * jaggedStep, bottomY);
          const offset = i % 2 ? jaggedAmp : -jaggedAmp;
          ctx.lineTo(rightBase + offset, currY);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText('Open hole', centerX - 28, (topY + bottomY) / 2);
        return;
      }

      const width = (casing.od / maxOD) * 80;

      ctx.fillStyle = colors[idx];
      ctx.fillRect(
        centerX - width / 2,
        startDepth,
        width,
        endDepth - startDepth
      );

      const innerWidth = (casing.id / maxOD) * 80;
      ctx.fillStyle = '#e6e6e6';
      ctx.fillRect(
        centerX - innerWidth / 2,
        startDepth,
        innerWidth,
        endDepth - startDepth
      );

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - width / 2, startDepth);
      ctx.lineTo(centerX - width / 2, endDepth);
      ctx.moveTo(centerX + width / 2, startDepth);
      ctx.lineTo(centerX + width / 2, endDepth);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(
        casing.depth.toFixed(0) + 'm',
        centerX + width / 2 + 10,
        endDepth
      );
    });

  // Draw drill pipe segments if provided
  if (opts.drillPipeSegments && opts.drillPipeSegments.length > 0) {
    const dpCatalog = [
      { name: '3 1/2"', id: 2.602, od: 3.5 },
      { name: '4"', id: 3.34, od: 4.0 },
      { name: '5"', id: 4.276, od: 5.0 },
      { name: '5 7/8"', id: 5.153, od: 5.875 }
    ];
    const dpColors = ['#DC143C', '#FF6347', '#FFA07A']; // reds for drill pipe

    let cumulativeDepth = 0;
    opts.drillPipeSegments.forEach((pipe, idx) => {
      const sizeData = dpCatalog[pipe.size];
      if (!sizeData) return;

      const startDepth = cumulativeDepth * scale + startY;
      const endDepth = (cumulativeDepth + pipe.length) * scale + startY;
      cumulativeDepth += pipe.length;

      const dpOD = sizeData.od;
      const dpID = sizeData.id;

      const width = (dpOD / maxOD) * 80;
      const innerWidth = (dpID / maxOD) * 80;

      // Draw drill pipe body
      ctx.fillStyle = dpColors[idx % dpColors.length];
      ctx.fillRect(
        centerX - width / 2,
        startDepth,
        width,
        endDepth - startDepth
      );

      // Draw drill pipe inner (hollow)
      ctx.fillStyle = '#e6e6e6';
      ctx.fillRect(
        centerX - innerWidth / 2,
        startDepth,
        innerWidth,
        endDepth - startDepth
      );

      // Draw borders
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - width / 2, startDepth);
      ctx.lineTo(centerX - width / 2, endDepth);
      ctx.moveTo(centerX + width / 2, startDepth);
      ctx.lineTo(centerX + width / 2, endDepth);
      ctx.stroke();

      // Draw label with size and depth
      ctx.fillStyle = '#fff';
      ctx.font = '11px Arial';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        sizeData.name,
        centerX - width / 2 - 40,
        (startDepth + endDepth) / 2
      );
      ctx.fillText(
        pipe.length.toFixed(1) + 'm',
        centerX + width / 2 + 10,
        endDepth - 5
      );
    });
  }

  // Draw tapered tubing segments if provided
  if (opts.tubingSegments && opts.tubingSegments.length > 0) {
    const tubingCatalog = [
      { name: '4 1/2" 12.6#', id: 3.958, od: 4.5 },
      { name: '5 1/2" 17#', id: 4.892, od: 5.5 }
    ];
    const tubingColors = ['#4169E1', '#6495ED']; // blues for tubing

    opts.tubingSegments.forEach((tubing, idx) => {
      const sizeData = tubingCatalog[tubing.size];
      if (!sizeData) return;

      const startDepth = (tubing.top || 0) * scale + startY;
      const endDepth = tubing.shoe * scale + startY;

      const tubingOD = sizeData.od;
      const tubingID = sizeData.id;

      const width = (tubingOD / maxOD) * 80;
      const innerWidth = (tubingID / maxOD) * 80;

      // Draw tubing body
      ctx.fillStyle = tubingColors[idx % tubingColors.length];
      ctx.fillRect(
        centerX - width / 2,
        startDepth,
        width,
        endDepth - startDepth
      );

      // Draw tubing inner (hollow)
      ctx.fillStyle = '#e6e6e6';
      ctx.fillRect(
        centerX - innerWidth / 2,
        startDepth,
        innerWidth,
        endDepth - startDepth
      );

      // Draw borders
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - width / 2, startDepth);
      ctx.lineTo(centerX - width / 2, endDepth);
      ctx.moveTo(centerX + width / 2, startDepth);
      ctx.lineTo(centerX + width / 2, endDepth);
      ctx.stroke();

      // Draw label with size and depth
      ctx.fillStyle = '#fff';
      ctx.font = '11px Arial';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        sizeData.name,
        centerX - width / 2 - 40,
        (startDepth + endDepth) / 2
      );
      ctx.fillText(
        tubing.length.toFixed(1) + 'm',
        centerX + width / 2 + 10,
        endDepth - 5
      );
    });
  }
}
