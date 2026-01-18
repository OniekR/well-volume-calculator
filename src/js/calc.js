// Pure calculation helpers for Keino Volume
const clampNumber = (v) => (isNaN(v) ? undefined : Number(v));

function sizeIdValue(selectId, fallbackValue, getEl) {
  const elFn =
    typeof getEl === "function"
      ? getEl
      : (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);
  const idInput = elFn(`${selectId}_id`);
  if (!idInput) return fallbackValue;
  const v = clampNumber(Number(idInput.value));
  return typeof v !== "undefined" && !isNaN(v) ? v : fallbackValue;
}

function getDeepestShoe(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) return undefined;
  const nums = candidates.filter((v) => typeof v === "number" && !isNaN(v));
  if (nums.length === 0) return undefined;
  return Math.max(...nums);
}

function computeVolumes(casingsInput, options = {}) {
  const plugEnabled = !!options.plugEnabled;
  const plugDepthVal =
    typeof options.plugDepthVal !== "undefined" ? Number(options.plugDepthVal) : undefined;

  const surfaceInUse = !!casingsInput.find((c) => c.role === "surface" && c.use);
  const intermediateInUse = !!casingsInput.find((c) => c.role === "intermediate" && c.use);

  // prepare per-role accumulators
  const perCasingMap = {};
  casingsInput.forEach((c) => {
    perCasingMap[c.role] = {
      role: c.role,
      includedLength: 0,
      volume: 0,
      perMeter_m3: c.id ? Math.PI * Math.pow((c.id / 2) * 0.0254, 2) : 0,
      physicalLength: typeof c.top !== "undefined" ? Math.max(0, c.depth - c.top) : undefined,
      use: !!c.use,
    };
  });

  // build draw list
  const casingsToDraw = [];
  casingsInput.forEach((c) => {
    const drawStart = typeof c.top !== "undefined" ? c.top : 0;
    if (c.use && c.depth > drawStart) {
      casingsToDraw.push({
        role: c.role,
        id: c.id,
        od: c.od,
        depth: c.depth,
        prevDepth: drawStart,
        index: 0,
        z:
          c.role === "conductor"
            ? -1
            : c.role === "small_liner"
              ? 5
              : c.role === "reservoir"
                ? 4
                : c.role === "production" || c.role === "tieback"
                  ? 3
                  : c.role === "intermediate"
                    ? 2
                    : c.role === "surface"
                      ? 1
                      : 0,
      });
    }
  });

  // Build sorted unique points
  const pointsSet = new Set([0]);
  casingsInput.forEach((c) => {
    if (typeof c.top !== "undefined" && !isNaN(c.top)) pointsSet.add(c.top);
    if (!isNaN(c.depth)) pointsSet.add(c.depth);
  });
  const points = Array.from(pointsSet).sort((a, b) => a - b);

  let totalVolume = 0;
  let plugAboveVolume = 0;
  let plugBelowVolume = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i];
    const segEnd = points[i + 1];
    const segLength = segEnd - segStart;
    if (segLength <= 0) continue;

    const covering = casingsInput.filter((c) => {
      if (!c.use) return false;
      if (c.depth <= segStart) return false;
      const topVal = typeof c.top !== "undefined" ? c.top : 0;
      if (topVal >= segEnd) return false;
      if (c.role === "conductor" && surfaceInUse) return false;
      if (c.role === "surface" && intermediateInUse) return false;
      return true;
    });

    if (covering.length === 0) continue;

    covering.sort((a, b) => {
      const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
      const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
      return ai - bi;
    });

    const winner = covering[0];
    const area = perCasingMap[winner.role].perMeter_m3;
    const segVol = area * segLength;

    totalVolume += segVol;
    perCasingMap[winner.role].volume += segVol;
    perCasingMap[winner.role].includedLength += segLength;

    // plug split
    if (plugEnabled && !isNaN(plugDepthVal) && typeof plugDepthVal !== "undefined") {
      if (segEnd <= plugDepthVal) {
        plugAboveVolume += segVol;
      } else if (segStart >= plugDepthVal) {
        plugBelowVolume += segVol;
      } else {
        const aboveLen = Math.max(0, plugDepthVal - segStart);
        const belowLen = Math.max(0, segEnd - plugDepthVal);
        const volAbove = area * aboveLen;
        const volBelow = area * belowLen;
        plugAboveVolume += volAbove;
        plugBelowVolume += volBelow;
      }
    }
  }

  const perCasingVolumes = casingsInput.map((c) => {
    const p = perCasingMap[c.role] || {
      role: c.role,
      includedLength: 0,
      volume: 0,
      perMeter_m3: 0,
      physicalLength: undefined,
    };
    p.use = !!c.use;
    return p;
  });

  return { totalVolume, perCasingVolumes, plugAboveVolume, plugBelowVolume, casingsToDraw };
}

module.exports = { computeVolumes, getDeepestShoe, sizeIdValue };
