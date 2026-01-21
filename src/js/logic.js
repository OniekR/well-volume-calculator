/**
 * Pure calculation helpers for Well Volume Calculator
 * computeVolumes accepts an array of casing descriptors and options and
 * returns computed volumes and drawing params.
 */
export function computeVolumes(casingsInput, opts = {}) {
  const plugEnabled = !!opts.plugEnabled;
  const plugDepthVal =
    typeof opts.plugDepthVal !== 'undefined' ? opts.plugDepthVal : undefined;
  const surfaceInUse = !!opts.surfaceInUse;
  const intermediateInUse = !!opts.intermediateInUse;
  const drillPipeInput = opts.drillPipe || null; // { mode, count, pipes: [{size, length, lPerM, eod}] }

  // Check if upper completion is active
  const uc = casingsInput.find((c) => c.role === 'upper_completion');
  const ucActive = uc && uc.use;
  const ucTopVal = ucActive && typeof uc.top !== 'undefined' ? uc.top : 0;
  const ucBottomVal = ucActive ? uc.depth : 0;
  const ucIdArea =
    ucActive && uc.id ? Math.PI * Math.pow((uc.id / 2) * 0.0254, 2) : 0;
  const ucOdRadius = ucActive ? (uc.od / 2) * 0.0254 : 0;
  const ucOdArea = ucActive ? Math.PI * Math.pow(ucOdRadius, 2) : 0;

  // prepare draw entries and per-casing map
  const perCasingMap = {};
  const casingsToDraw = [];

  casingsInput.forEach((c) => {
    perCasingMap[c.role] = {
      role: c.role,
      includedLength: 0,
      volume: 0,
      perMeter_m3: c.id ? Math.PI * Math.pow((c.id / 2) * 0.0254, 2) : 0,
      physicalLength:
        typeof c.top !== 'undefined' ? Math.max(0, c.depth - c.top) : undefined,
      use: !!c.use
    };

    const drawStart = typeof c.top !== 'undefined' ? c.top : 0;
    if (c.use && c.depth > drawStart) {
      casingsToDraw.push({
        role: c.role,
        id: c.id,
        od: c.od,
        depth: c.depth,
        prevDepth: drawStart,
        index: 0,
        z:
          c.role === 'conductor'
            ? -1
            : c.role === 'small_liner'
            ? 5
            : c.role === 'upper_completion'
            ? 6
            : c.role === 'reservoir'
            ? 4
            : c.role === 'production' || c.role === 'tieback'
            ? 3
            : c.role === 'intermediate'
            ? 2
            : c.role === 'surface'
            ? 1
            : 0
      });
    }
  });

  const pointsSet = new Set([0]);
  casingsInput.forEach((c) => {
    if (typeof c.top !== 'undefined' && !isNaN(c.top)) pointsSet.add(c.top);
    if (!isNaN(c.depth)) pointsSet.add(c.depth);
  });
  const points = Array.from(pointsSet).sort((a, b) => a - b);

  let totalVolume = 0;
  let plugAboveVolume = 0;
  let plugBelowVolume = 0;
  let plugAboveTubing = 0;
  let plugBelowTubing = 0;
  let plugAboveAnnulus = 0;
  let plugBelowAnnulus = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i];
    const segEnd = points[i + 1];
    const segLength = segEnd - segStart;
    if (segLength <= 0) continue;

    const covering = casingsInput.filter((c) => {
      if (!c.use) return false;
      if (c.depth <= segStart) return false;
      const topVal = typeof c.top !== 'undefined' ? c.top : 0;
      if (topVal >= segEnd) return false;
      if (c.role === 'conductor' && surfaceInUse) return false;
      if (c.role === 'surface' && intermediateInUse) return false;
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

    if (
      plugEnabled &&
      !isNaN(plugDepthVal) &&
      typeof plugDepthVal !== 'undefined'
    ) {
      // Check if this segment is within UC range
      const inUcRange =
        ucActive && segStart >= ucTopVal && segEnd <= ucBottomVal;

      if (inUcRange) {
        // Split volume into tubing and annulus
        const tubingVol = ucIdArea * segLength;

        // Find containing casing for annulus calculation
        const containing = casingsInput
          .filter((c) => c.use && c.role !== 'upper_completion')
          .filter((c) => {
            const cTopVal = typeof c.top !== 'undefined' ? c.top : 0;
            return cTopVal <= segStart && c.depth >= segEnd;
          })
          .sort((a, b) => {
            const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
            const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
            return ai - bi;
          });

        let annulusVol = 0;
        if (containing.length > 0 && containing[0].id) {
          const casingIdRadius = (containing[0].id / 2) * 0.0254;
          const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
          const annulusArea = Math.max(0, casingIdArea - ucOdArea);
          annulusVol = annulusArea * segLength;
        }

        if (segEnd <= plugDepthVal) {
          plugAboveTubing += tubingVol;
          plugAboveAnnulus += annulusVol;
          plugAboveVolume += segVol;
        } else if (segStart >= plugDepthVal) {
          plugBelowTubing += tubingVol;
          plugBelowAnnulus += annulusVol;
          plugBelowVolume += segVol;
        } else {
          const aboveLen = Math.max(0, plugDepthVal - segStart);
          const belowLen = Math.max(0, segEnd - plugDepthVal);

          const tubingAbove = ucIdArea * aboveLen;
          const tubingBelow = ucIdArea * belowLen;

          const annulusAbove = annulusVol * (aboveLen / segLength);
          const annulusBelow = annulusVol * (belowLen / segLength);

          plugAboveTubing += tubingAbove;
          plugBelowTubing += tubingBelow;
          plugAboveAnnulus += annulusAbove;
          plugBelowAnnulus += annulusBelow;

          const volAbove = area * aboveLen;
          const volBelow = area * belowLen;
          plugAboveVolume += volAbove;
          plugBelowVolume += volBelow;
        }
      } else {
        // Normal handling for non-UC segments
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
  }

  // If drill pipe is present, subtract open-ended displacement (EOD) volumes
  // from the per-casing volumes so the hole volume table reflects fluid displaced
  // by the drill pipe string. Split EOD proportionally across all casings the DP passes through.
  if (drillPipeInput && drillPipeInput.mode === 'drillpipe') {
    let cumDepth = 0;
    (drillPipeInput.pipes || []).forEach((dp) => {
      const dpTop = cumDepth;
      const dpBottom = cumDepth + (dp.length || 0);
      cumDepth = dpBottom;
      const eodLPerM = typeof dp.eod !== 'undefined' ? dp.eod : 0;

      if (eodLPerM > 0) {
        // Find ALL casings that this DP segment intersects and split EOD proportionally
        const activeCasings = casingsInput.filter(
          (c) => c.use && c.role !== 'upper_completion'
        );

        activeCasings.forEach((casing) => {
          const casingTopVal =
            typeof casing.top !== 'undefined' ? casing.top : 0;
          const casingBottomVal = casing.depth;

          // Calculate overlap between DP segment and this casing
          const overlapTop = Math.max(dpTop, casingTopVal);
          const overlapBottom = Math.min(dpBottom, casingBottomVal);
          const overlapLength = Math.max(0, overlapBottom - overlapTop);

          if (overlapLength > 0) {
            // Subtract EOD for the portion of DP in this casing
            const eodVolInCasing = (eodLPerM / 1000) * overlapLength;
            if (perCasingMap[casing.role]) {
              perCasingMap[casing.role].volume = Math.max(
                0,
                perCasingMap[casing.role].volume - eodVolInCasing
              );
              totalVolume = Math.max(0, totalVolume - eodVolInCasing);
            }
          }
        });
      }
    });
  }

  const perCasingVolumes = casingsInput.map((c) => {
    const p = perCasingMap[c.role] || {
      role: c.role,
      includedLength: 0,
      volume: 0,
      perMeter_m3: 0,
      physicalLength: undefined
    };
    p.use = !!c.use;
    return p;
  });

  return {
    totalVolume,
    perCasingVolumes,
    casingsToDraw,
    plugAboveVolume,
    plugBelowVolume,
    plugAboveTubing,
    plugBelowTubing,
    plugAboveAnnulus,
    plugBelowAnnulus,
    ucActive
  };
}

/**
 * Calculate upper completion volume breakdown:
 * - UC ID volume (tubing inside volume)
 * - Annulus volume (between casing/liner ID and UC tubing OD)
 *
 * @param {Array} casingsInput - Array of casing descriptors
 * @returns {Object} - UC volume breakdown with ID and annulus volumes (section-wise and totals)
 */
export function computeUpperCompletionBreakdown(casingsInput) {
  // Find the upper completion
  const uc = casingsInput.find((c) => c.role === 'upper_completion');
  if (!uc || !uc.use) {
    return {
      used: false,
      sections: [],
      ucIdVolume: 0,
      annulusVolume: 0,
      ucIdLength: 0,
      annulusLength: 0
    };
  }

  const ucTopVal = typeof uc.top !== 'undefined' ? uc.top : 0;
  const ucBottomVal = uc.depth;
  if (ucBottomVal <= ucTopVal) {
    return {
      used: false,
      sections: [],
      ucIdVolume: 0,
      annulusVolume: 0,
      ucIdLength: 0,
      annulusLength: 0
    };
  }

  // Calculate UC ID area (tubing inside)
  const ucIdArea = uc.id ? Math.PI * Math.pow((uc.id / 2) * 0.0254, 2) : 0;

  // Calculate UC OD area for annulus calculation
  const ucOdRadius = (uc.od / 2) * 0.0254; // Convert to meters
  const ucOdArea = Math.PI * Math.pow(ucOdRadius, 2);

  // Create section points within UC range
  const pointsSet = new Set([ucTopVal, ucBottomVal]);
  casingsInput.forEach((c) => {
    if (c.role === 'upper_completion') return;
    if (!c.use) return;
    if (c.depth <= ucTopVal || c.top >= ucBottomVal) return;
    // Add casing transition points within UC range
    if (
      typeof c.top !== 'undefined' &&
      c.top > ucTopVal &&
      c.top < ucBottomVal
    ) {
      pointsSet.add(c.top);
    }
    if (c.depth > ucTopVal && c.depth < ucBottomVal) {
      pointsSet.add(c.depth);
    }
  });

  const points = Array.from(pointsSet).sort((a, b) => a - b);

  // Build fine-grained segments then merge adjacent segments that have the same
  // containing casing to reduce the number of rows shown to the user.
  const rawSegments = [];
  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i];
    const segEnd = points[i + 1];
    const segLength = segEnd - segStart;
    if (segLength <= 0) continue;

    // UC ID volume for this section
    const ucIdVol = ucIdArea * segLength;

    // Find containing casings for this section and choose the smallest ID (narrowest)
    const containing = casingsInput
      .filter((c) => c.use && c.role !== 'upper_completion')
      .filter((c) => {
        const cTopVal = typeof c.top !== 'undefined' ? c.top : 0;
        return cTopVal <= segStart && c.depth >= segEnd;
      })
      .sort((a, b) => {
        const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
        const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
        return ai - bi;
      });

    const containingCasing = containing.length ? containing[0] : null;

    let annulusVol = 0;
    let containerKey = 'open';
    if (containingCasing && containingCasing.id) {
      containerKey = `${containingCasing.role}|${containingCasing.id}`;
      const casingIdRadius = (containingCasing.id / 2) * 0.0254; // meters
      const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
      const annulusArea = Math.max(0, casingIdArea - ucOdArea);
      annulusVol = annulusArea * segLength;
    }

    rawSegments.push({
      start: segStart,
      end: segEnd,
      length: segLength,
      containerKey,
      ucIdVol,
      annulusVol
    });
  }

  // Merge consecutive raw segments that share the same containerKey
  const merged = [];
  for (const seg of rawSegments) {
    const last = merged.length ? merged[merged.length - 1] : null;
    if (last && last.containerKey === seg.containerKey) {
      last.end = seg.end;
      last.length += seg.length;
      last.ucIdVol += seg.ucIdVol;
      last.annulusVol += seg.annulusVol;
    } else {
      merged.push({ ...seg });
    }
  }

  const sections = merged.map((m) => ({
    depth: `${m.start.toFixed(1)}-${m.end.toFixed(1)}`,
    ucIdVolume: m.ucIdVol,
    annulusVolume: m.annulusVol,
    sectionLength: m.length
  }));

  let totalUcIdVolume = 0;
  let totalAnnulusVolume = 0;
  let totalUcIdLength = 0;
  let totalAnnulusLength = 0;

  sections.forEach((s) => {
    totalUcIdVolume += s.ucIdVolume;
    totalAnnulusVolume += s.annulusVolume;
    totalUcIdLength += s.sectionLength;
    totalAnnulusLength += s.sectionLength;
  });

  return {
    used: true,
    sections,
    ucIdVolume: totalUcIdVolume,
    annulusVolume: totalAnnulusVolume,
    ucIdLength: totalUcIdLength,
    annulusLength: totalAnnulusLength
  };
}
