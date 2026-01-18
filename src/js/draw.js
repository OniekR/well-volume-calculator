// Minimal drawing module for Keino Volume Calculator
// Exports a scheduleDraw function that performs simple, testable rendering.
function scheduleDraw(canvas, ctx, casings = [], opts = {}) {
  try {
    if (!canvas && typeof document !== "undefined")
      canvas = document.getElementById("wellSchematic");
    if (!ctx && canvas && typeof canvas.getContext === "function") ctx = canvas.getContext("2d");
  } catch (e) {
    /* ignore */
  }

  if (!ctx || !canvas) return;

  // clear
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } catch (e) {
    /* ignore */
  }

  // simple water fill if requested
  if (opts.showWater && typeof opts.waterDepth !== "undefined") {
    try {
      ctx.fillStyle = "#cce5ff";
      const h = Math.max(
        0,
        Math.min(canvas.height, Math.round((opts.waterDepth || 0) * 0.001 * canvas.height))
      );
      ctx.fillRect(0, canvas.height - h, canvas.width, h);
    } catch (e) {
      /* ignore */
    }
  }

  // simple casing markers
  if (Array.isArray(casings) && casings.length > 0) {
    casings.forEach((c, i) => {
      try {
        ctx.fillStyle = "#888";
        const ph = Math.max(
          2,
          Math.round(((c.depth || 0) / (opts.maxDepth || 2000)) * canvas.height)
        );
        ctx.fillRect(10 + i * 6, canvas.height - ph, 4, ph);
      } catch (e) {
        /* ignore */
      }
    });
  }
}

module.exports = { scheduleDraw };
