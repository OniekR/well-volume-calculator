/**
 * Convert inches to meters.
 * @param {number|string} inches
 * @returns {number} meters
 */
function inchesToMeters(inches) {
  const n = Number(inches);
  return isFinite(n) ? n * 0.0254 : 0;
}

/**
 * Calculate steel cross-sectional area (m²) for a pipe given OD in inches and lPerM.
 * Steel area = OD_area - ID_area
 * Where ID_area = lPerM / 1000 (lPerM is already the ID cross-sectional area in m²)
 *
 * @param {number|string} odInches outer diameter in inches
 * @param {number|string} lPerM liters per meter (ID cross-sectional area as volume per meter)
 * @returns {number} steel area in square meters
 */
function calculatePipeSteelAreaFromLPerM(odInches, lPerM) {
  const odMeters = inchesToMeters(odInches);
  if (!isFinite(odMeters) || odMeters <= 0) return 0;

  const lPerMNum = Number(lPerM);
  if (!isFinite(lPerMNum) || lPerMNum <= 0) return 0;

  const odRadius = odMeters / 2;
  const odArea = Math.PI * Math.pow(odRadius, 2);
  const idArea = lPerMNum / 1000; // lPerM is already ID volume per meter in m³, so area in m²

  return Math.max(0, odArea - idArea);
}

/**
 * Calculate steel volume (m³) for a pipe given length, OD in inches, and lPerM.
 * This is the preferred method when lPerM is available but explicit ID is not.
 *
 * @param {number|string} lengthMeters length in meters
 * @param {number|string} odInches outer diameter in inches
 * @param {number|string} lPerM liters per meter (ID volume per meter)
 * @returns {number} steel volume in cubic meters
 */
function calculatePipeSteelVolumeFromLPerM(lengthMeters, odInches, lPerM) {
  const L = Number(lengthMeters);
  if (!isFinite(L) || L <= 0) return 0;

  const area = calculatePipeSteelAreaFromLPerM(odInches, lPerM);
  return area * L;
}

/**
 * Calculate steel cross-sectional area (m²) for a pipe given OD and ID in inches.
 * Steel area = π * (OD_radius² - ID_radius²)
 *
 * @param {number|string} odInches outer diameter in inches
 * @param {number|string} idInches inner diameter in inches
 * @returns {number} steel area in square meters
 */
function calculatePipeSteelArea(odInches, idInches) {
  const odMeters = inchesToMeters(odInches);
  const idMeters = inchesToMeters(idInches);
  if (!isFinite(odMeters) || !isFinite(idMeters) || odMeters <= idMeters) {
    return 0;
  }
  const odRadius = odMeters / 2;
  const idRadius = idMeters / 2;
  return Math.PI * (Math.pow(odRadius, 2) - Math.pow(idRadius, 2));
}

/**
 * Calculate steel volume (m³) for a pipe given length (m) and diameters (inches).
 * Steel volume = steel area × length
 *
 * Validates all inputs; returns 0 for invalid inputs.
 *
 * @param {number|string} lengthMeters length in meters
 * @param {number|string} odInches outer diameter in inches
 * @param {number|string} idInches inner diameter in inches
 * @returns {number} steel volume in cubic meters
 */
export function calculatePipeSteelVolume(lengthMeters, odInches, idInches) {
  const L = Number(lengthMeters);
  const od = Number(odInches);
  const id = Number(idInches);

  // Validate all inputs
  if (!isFinite(L) || L <= 0) return 0;
  if (!isFinite(od) || !isFinite(id)) return 0;

  const area = calculatePipeSteelArea(od, id);
  return area * L;
}

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
  const subtractEod = opts.subtractEod !== false; // Default to true

  // Check if upper completion is active (support multiple tubing segments)
  const ucSegments = casingsInput
    .filter((c) => c.role === 'upper_completion' && c.use)
    .map((c) => ({
      ...c,
      top: typeof c.top !== 'undefined' ? c.top : 0
    }))
    .sort((a, b) => a.top - b.top);
  const ucActive = ucSegments.length > 0;
  const ucTopVal = ucActive ? Math.min(...ucSegments.map((s) => s.top)) : 0;
  const ucBottomVal = ucActive
    ? Math.max(...ucSegments.map((s) => s.depth || 0))
    : 0;

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
  let plugBelowVolumeTubing = 0; // Below-POI volume for tubing mode (no DP EOD subtraction)
  let dpEodDisplacementBelowPOI = 0; // Track DP EOD displacement separately
  let plugAboveTubing = 0;
  let plugBelowTubing = 0;
  let plugAboveAnnulus = 0;
  let plugBelowAnnulus = 0;
  let plugAboveTubingOpenCasing = 0;
  let plugBelowTubingOpenCasing = 0; // Volume of hole below the tubing shoe
  let casingVolumeBelowTubingShoe = 0; // Total casing volume below the tubing shoe
  let plugAboveDrillpipe = 0;
  let plugBelowDrillpipe = 0;
  let plugAboveDrillpipeAnnulus = 0;
  let plugBelowDrillpipeAnnulus = 0;
  let plugAboveDrillpipeOpenCasing = 0;
  let plugBelowDrillpipeOpenCasing = 0;

  // Track how much tubing steel volume has already been subtracted from below-POI
  // calculations (so we don't double-subtract when applying fallbacks later).
  let ucSteelSubtractedBelow = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const segStart = points[i];
    const segEnd = points[i + 1];
    const segLength = segEnd - segStart;
    if (segLength <= 0) continue;

    const covering = casingsInput.filter((c) => {
      if (!c.use) return false;
      if (c.role === 'upper_completion') return false;
      if (c.depth <= segStart) return false;
      const topVal = typeof c.top !== 'undefined' ? c.top : 0;
      if (topVal >= segEnd) return false;
      if (c.role === 'conductor' && surfaceInUse) return false;
      if (c.role === 'surface' && intermediateInUse) return false;
      return true;
    });

    // If no outer casing covers this sub-segment, we still need to account for
    // upper-completion (tubing) volumes that may overlap this depth range
    // (e.g. UC exists inside an open hole). Compute UC-specific contributions
    // for this segment and add them directly when there is no covering casing.
    if (
      plugEnabled &&
      !isNaN(plugDepthVal) &&
      typeof plugDepthVal !== 'undefined' &&
      ucActive &&
      covering.length === 0
    ) {
      // Find containing casing (if any) to compute annulus area
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

      let casingIdArea = 0;
      if (containing.length > 0 && containing[0].id) {
        const casingIdRadius = (containing[0].id / 2) * 0.0254;
        casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
      }

      // Compute UC overlaps for this segment and add tubing/annulus/steel
      // quantities directly to the appropriate POI accumulators. We don't
      // modify per-casing totals here because there is no owning casing.
      ucSegments.forEach((ucSeg) => {
        const segUcTop = typeof ucSeg.top !== 'undefined' ? ucSeg.top : 0;
        const segUcBottom = ucSeg.depth;
        const overlapStart = Math.max(segStart, segUcTop);
        const overlapEnd = Math.min(segEnd, segUcBottom);
        if (overlapStart >= overlapEnd) return;

        const overlapLen = overlapEnd - overlapStart;
        const ucIdArea = ucSeg.id
          ? Math.PI * Math.pow((ucSeg.id / 2) * 0.0254, 2)
          : 0;
        const ucOdRadius = ucSeg.od ? (ucSeg.od / 2) * 0.0254 : 0;
        const ucOdArea = ucOdRadius > 0 ? Math.PI * Math.pow(ucOdRadius, 2) : 0;
        const tubingSteelArea = Math.max(0, ucOdArea - ucIdArea);
        const annulusArea = Math.max(0, casingIdArea - ucOdArea);

        if (segEnd <= plugDepthVal) {
          plugAboveTubing += ucIdArea * overlapLen;
          plugAboveAnnulus += annulusArea * overlapLen;
        } else if (segStart >= plugDepthVal) {
          plugBelowTubing += ucIdArea * overlapLen;
          plugBelowAnnulus += annulusArea * overlapLen;
          ucSteelSubtractedBelow += tubingSteelArea * overlapLen;
        } else {
          const aboveOverlapLen = Math.max(
            0,
            Math.min(plugDepthVal, overlapEnd) - overlapStart
          );
          const belowOverlapLen = Math.max(
            0,
            overlapEnd - Math.max(plugDepthVal, overlapStart)
          );

          plugAboveTubing += ucIdArea * aboveOverlapLen;
          plugBelowTubing += ucIdArea * belowOverlapLen;
          plugAboveAnnulus += annulusArea * aboveOverlapLen;
          plugBelowAnnulus += annulusArea * belowOverlapLen;
          ucSteelSubtractedBelow += tubingSteelArea * belowOverlapLen;
        }
      });
    }

    if (covering.length === 0) continue;

    covering.sort((a, b) => {
      const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
      const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);

      // Categorize casings: main wellbore vs supplemental
      const mainWellboreRoles = [
        'conductor',
        'surface',
        'intermediate',
        'production',
        'tieback'
      ];
      const aIsMain = mainWellboreRoles.includes(a.role);
      const bIsMain = mainWellboreRoles.includes(b.role);

      // If one is main wellbore and one is supplemental:
      if (aIsMain && !bIsMain) {
        // a is main, b is supplemental
        // In overlapping zones, the innermost (smallest ID) casing should claim the volume.
        // This reflects physical reality: supplemental casings (like reservoir liners)
        // are separate installations that occupy the inner space of the wellbore.
        // Wider outer casings should never claim volume from the innermost installation.
        const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
        const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
        if (bi < ai) {
          return 1; // Supplemental (innermost) wins
        }
        // Main wellbore is innermost: main wins
        return -1;
      }
      if (!aIsMain && bIsMain) {
        // a is supplemental, b is main
        // In overlapping zones, the innermost (smallest ID) casing should claim the volume.
        const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
        const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
        if (ai < bi) {
          return -1; // Supplemental (innermost) wins
        }
        // Main wellbore is innermost: main wins
        return 1;
      }

      // Within same category, smallest ID (innermost) wins
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
      let hasUcOverlap = false;
      let tubingAbove = 0;
      let tubingBelow = 0;
      let annulusAbove = 0;
      let annulusBelow = 0;
      let steelAbove = 0;
      let steelBelow = 0;

      if (ucActive) {
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

        let casingIdArea = 0;
        if (containing.length > 0 && containing[0].id) {
          const casingIdRadius = (containing[0].id / 2) * 0.0254;
          casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
        }

        ucSegments.forEach((ucSeg) => {
          const segUcTop = typeof ucSeg.top !== 'undefined' ? ucSeg.top : 0;
          const segUcBottom = ucSeg.depth;
          const overlapStart = Math.max(segStart, segUcTop);
          const overlapEnd = Math.min(segEnd, segUcBottom);
          if (overlapStart >= overlapEnd) return;

          hasUcOverlap = true;
          const overlapLen = overlapEnd - overlapStart;

          const ucIdArea = ucSeg.id
            ? Math.PI * Math.pow((ucSeg.id / 2) * 0.0254, 2)
            : 0;
          const ucOdRadius = ucSeg.od ? (ucSeg.od / 2) * 0.0254 : 0;
          const ucOdArea =
            ucOdRadius > 0 ? Math.PI * Math.pow(ucOdRadius, 2) : 0;
          const tubingSteelArea = Math.max(0, ucOdArea - ucIdArea);
          const annulusArea = Math.max(0, casingIdArea - ucOdArea);

          if (segEnd <= plugDepthVal) {
            tubingAbove += ucIdArea * overlapLen;
            annulusAbove += annulusArea * overlapLen;
            steelAbove += tubingSteelArea * overlapLen;
          } else if (segStart >= plugDepthVal) {
            tubingBelow += ucIdArea * overlapLen;
            annulusBelow += annulusArea * overlapLen;
            steelBelow += tubingSteelArea * overlapLen;
          } else {
            const aboveOverlapLen = Math.max(
              0,
              Math.min(plugDepthVal, overlapEnd) - overlapStart
            );
            const belowOverlapLen = Math.max(
              0,
              overlapEnd - Math.max(plugDepthVal, overlapStart)
            );

            tubingAbove += ucIdArea * aboveOverlapLen;
            tubingBelow += ucIdArea * belowOverlapLen;
            annulusAbove += annulusArea * aboveOverlapLen;
            annulusBelow += annulusArea * belowOverlapLen;
            steelAbove += tubingSteelArea * aboveOverlapLen;
            steelBelow += tubingSteelArea * belowOverlapLen;
          }
        });
      }

      if (segEnd <= plugDepthVal) {
        plugAboveVolume += segVol - steelAbove;
        if (hasUcOverlap) {
          plugAboveTubing += tubingAbove;
          plugAboveAnnulus += annulusAbove;
        }
      } else if (segStart >= plugDepthVal) {
        plugBelowVolume += segVol - steelBelow;
        if (hasUcOverlap) {
          plugBelowTubing += tubingBelow;
          plugBelowAnnulus += annulusBelow;
          ucSteelSubtractedBelow += steelBelow;
        }
      } else {
        const aboveLen = Math.max(0, plugDepthVal - segStart);
        const belowLen = Math.max(0, segEnd - plugDepthVal);
        const volAbove = area * aboveLen;
        const volBelow = area * belowLen;
        plugAboveVolume += volAbove - steelAbove;
        plugBelowVolume += volBelow - steelBelow;

        if (hasUcOverlap) {
          plugAboveTubing += tubingAbove;
          plugBelowTubing += tubingBelow;
          plugAboveAnnulus += annulusAbove;
          plugBelowAnnulus += annulusBelow;
          ucSteelSubtractedBelow += steelBelow;
        }
      }
    }
  }

  // Calculate tubing open casing volume: casing volume between tubing shoe and POI
  // (when tubing is entirely above POI)
  if (
    plugEnabled &&
    ucActive &&
    !isNaN(plugDepthVal) &&
    typeof plugDepthVal !== 'undefined' &&
    ucBottomVal < plugDepthVal
  ) {
    // Tubing is entirely above POI, calculate open casing between tubing shoe and POI
    const openCasingStart = ucBottomVal;
    const openCasingEnd = plugDepthVal;

    // Find casing volume in this range (excluding UC steel and annulus)
    // Go through points between tubing shoe and POI
    const ocPointsSet = new Set([openCasingStart, openCasingEnd]);
    casingsInput.forEach((c) => {
      const topVal = typeof c.top !== 'undefined' ? c.top : 0;
      if (topVal > openCasingStart && topVal < openCasingEnd)
        ocPointsSet.add(topVal);
      if (c.depth > openCasingStart && c.depth < openCasingEnd)
        ocPointsSet.add(c.depth);
    });
    const ocPoints = Array.from(ocPointsSet).sort((a, b) => a - b);

    for (let i = 0; i < ocPoints.length - 1; i++) {
      const segStart = ocPoints[i];
      const segEnd = ocPoints[i + 1];
      const segLength = segEnd - segStart;
      if (segLength <= 0) continue;

      // Find covering casings
      const covering = casingsInput.filter((c) => {
        if (!c.use) return false;
        if (c.depth <= segStart) return false;
        const topVal = typeof c.top !== 'undefined' ? c.top : 0;
        if (topVal >= segEnd) return false;
        if (c.role === 'conductor' && surfaceInUse) return false;
        if (c.role === 'surface' && intermediateInUse) return false;
        return true;
      });

      if (covering.length > 0) {
        // Sort by ID to find innermost
        covering.sort((a, b) => {
          const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
          const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
          return ai - bi;
        });
        const owner = covering[0];

        // Calculate open casing volume (total casing area - annulus for UC)
        // In this depth range, tubing is absent, so we get pure casing volume
        const area = perCasingMap[owner.role].perMeter_m3;
        const segVol = area * segLength;

        plugAboveTubingOpenCasing += segVol;
      }
    }
  }

  // Calculate volume below tubing shoe: casing volume from tubing shoe to well bottom
  // (showing what casing volume exists below where the tubing ends)
  if (ucActive && ucBottomVal > 0) {
    const belowTubingStart = ucBottomVal;
    const belowTubingEnd = Math.max(...casingsInput.map((c) => c.depth || 0));

    if (belowTubingEnd > belowTubingStart) {
      // Find casing volume below tubing shoe
      const btPointsSet = new Set([belowTubingStart, belowTubingEnd]);
      casingsInput.forEach((c) => {
        const topVal = typeof c.top !== 'undefined' ? c.top : 0;
        if (topVal > belowTubingStart && topVal < belowTubingEnd)
          btPointsSet.add(topVal);
        if (c.depth > belowTubingStart && c.depth < belowTubingEnd)
          btPointsSet.add(c.depth);
      });
      const btPoints = Array.from(btPointsSet).sort((a, b) => a - b);

      for (let i = 0; i < btPoints.length - 1; i++) {
        const segStart = btPoints[i];
        const segEnd = btPoints[i + 1];
        const segLength = segEnd - segStart;
        if (segLength <= 0) continue;

        // Find covering casings
        const covering = casingsInput.filter((c) => {
          if (!c.use) return false;
          if (c.depth <= segStart) return false;
          const topVal = typeof c.top !== 'undefined' ? c.top : 0;
          if (topVal >= segEnd) return false;
          if (c.role === 'conductor' && surfaceInUse) return false;
          if (c.role === 'surface' && intermediateInUse) return false;
          if (c.role === 'upper_completion') return false; // Exclude UC itself
          return true;
        });

        if (covering.length > 0) {
          // Sort by ID to find innermost
          covering.sort((a, b) => {
            const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
            const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
            return ai - bi;
          });
          const owner = covering[0];
          const area = perCasingMap[owner.role].perMeter_m3;
          const segVol = area * segLength;
          plugBelowTubingOpenCasing += segVol;
        }
      }
    }
  }

  // Calculate total casing volume below tubing shoe
  // Use innermost casing for each depth segment (do not sum overlapping casing annuli)
  if (ucActive && ucBottomVal > 0) {
    // Determine bottom-most depth among casings
    const belowTubingStart = ucBottomVal;
    const belowTubingEnd = Math.max(...casingsInput.map((c) => c.depth || 0));

    if (belowTubingEnd > belowTubingStart) {
      // Collect all transition points between start and end
      const btPointsSet = new Set([belowTubingStart, belowTubingEnd]);
      casingsInput.forEach((c) => {
        if (!c.use) return;
        if (c.role === 'upper_completion') return;
        const topVal = typeof c.top !== 'undefined' ? c.top : 0;
        if (topVal > belowTubingStart && topVal < belowTubingEnd)
          btPointsSet.add(topVal);
        if (c.depth > belowTubingStart && c.depth < belowTubingEnd)
          btPointsSet.add(c.depth);
      });

      const btPoints = Array.from(btPointsSet).sort((a, b) => a - b);

      for (let i = 0; i < btPoints.length - 1; i++) {
        const segStart = btPoints[i];
        const segEnd = btPoints[i + 1];
        const segLength = segEnd - segStart;
        if (segLength <= 0) continue;

        // Find covering casings for this sub-segment
        const covering = casingsInput.filter((c) => {
          if (!c.use) return false;
          if (c.depth <= segStart) return false;
          const topVal = typeof c.top !== 'undefined' ? c.top : 0;
          if (topVal >= segEnd) return false;
          if (c.role === 'conductor' && surfaceInUse) return false;
          if (c.role === 'surface' && intermediateInUse) return false;
          if (c.role === 'upper_completion') return false; // Exclude UC itself
          return true;
        });

        if (covering.length === 0) continue;

        // Innermost casing (smallest ID) owns this segment
        covering.sort((a, b) => {
          const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
          const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
          return ai - bi;
        });

        const owner = covering[0];
        const area = perCasingMap[owner.role].perMeter_m3;
        const segVol = area * segLength;
        casingVolumeBelowTubingShoe += segVol;
      }
    }
  }

  // If drill pipe is present, subtract open-ended displacement (EOD) volumes
  // from the per-casing volumes so the hole volume table reflects fluid displaced
  // by the drill pipe string. Only subtract from the casing that "owns" each segment
  // (the innermost casing in that depth range).
  if (drillPipeInput && drillPipeInput.mode === 'drillpipe') {
    let cumDepth = 0;
    (drillPipeInput.pipes || []).forEach((dp) => {
      const dpTop = cumDepth;
      const dpBottom = cumDepth + (dp.length || 0);
      cumDepth = dpBottom;
      const eodLPerM = typeof dp.eod !== 'undefined' ? dp.eod : 0;

      if (eodLPerM > 0) {
        // For each depth in the DP segment, find which casing owns that segment
        // and subtract EOD from that casing only (not from all intersecting casings)

        // Get depth points within this DP segment
        const dpPointsSet = new Set([dpTop, dpBottom]);
        casingsInput.forEach((c) => {
          if (c.depth > dpTop && c.depth < dpBottom) dpPointsSet.add(c.depth);
          const topVal = typeof c.top !== 'undefined' ? c.top : 0;
          if (topVal > dpTop && topVal < dpBottom) dpPointsSet.add(topVal);
        });
        const dpPoints = Array.from(dpPointsSet).sort((a, b) => a - b);

        // For each sub-segment, find the owning casing and subtract EOD from it
        for (let i = 0; i < dpPoints.length - 1; i++) {
          const segStart = dpPoints[i];
          const segEnd = dpPoints[i + 1];
          const segLength = segEnd - segStart;
          if (segLength <= 0) continue;

          // Find casings covering this segment
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

          // Find the innermost (smallest ID) casing - this one owns the segment
          covering.sort((a, b) => {
            const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
            const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
            return ai - bi;
          });
          const owner = covering[0];

          // Subtract EOD only from the owning casing (if enabled)
          if (subtractEod) {
            const eodVolInSegment = (eodLPerM / 1000) * segLength;
            if (perCasingMap[owner.role]) {
              perCasingMap[owner.role].volume = Math.max(
                0,
                perCasingMap[owner.role].volume - eodVolInSegment
              );
              totalVolume = Math.max(0, totalVolume - eodVolInSegment);
            }
          }
        }
      }
    });
  }

  // Calculate drill pipe point of interest volumes if in drill pipe mode and PoI is set
  if (
    plugEnabled &&
    !isNaN(plugDepthVal) &&
    typeof plugDepthVal !== 'undefined' &&
    drillPipeInput &&
    drillPipeInput.mode === 'drillpipe'
  ) {
    // For drill pipe mode POI, we need to track:
    // 1. Volume above/below POI in drill pipe ID
    // 2. Volume above/below POI in annulus
    // 3. Volume above/below POI in open casing (casing volume - DP - annulus)

    let cumDepth = 0;
    let totalDpLength = 0;
    let dpBottom = 0;

    // Calculate total DP depth and volumes
    const dpSegments = [];
    (drillPipeInput.pipes || []).forEach((dp) => {
      const dpTop = cumDepth;
      // Use minimum length of 0.01m if length is 0 (for annulus calculation)
      const dpLen = dp.length ? dp.length : 0.01;
      dpBottom = cumDepth + dpLen;

      const dpLPerM = typeof dp.lPerM !== 'undefined' ? dp.lPerM : 0;
      const dpIdVol = (dpLPerM / 1000) * dpLen;

      dpSegments.push({
        top: dpTop,
        bottom: dpBottom,
        length: dpLen,
        lPerM: dpLPerM,
        idVol: dpIdVol,
        od: dp.od,
        eod: dp.eod
      });

      totalDpLength += dpLen;
      cumDepth = dpBottom;
    });

    if (totalDpLength > 0) {
      // Calculate annulus volume for the DP string
      // Split DP segments by casing transitions to get accurate annulus for each depth range
      let totalAnnulusVol = 0;
      dpSegments.forEach((dpSeg) => {
        // Collect all casing transition points within this DP segment
        const dpPointsSet = new Set([dpSeg.top, dpSeg.bottom]);
        casingsInput.forEach((c) => {
          const topVal = typeof c.top !== 'undefined' ? c.top : 0;
          // Add transition points where casings start/end within DP segment
          if (topVal > dpSeg.top && topVal < dpSeg.bottom) {
            dpPointsSet.add(topVal);
          }
          if (c.depth > dpSeg.top && c.depth < dpSeg.bottom) {
            dpPointsSet.add(c.depth);
          }
        });

        const dpPoints = Array.from(dpPointsSet).sort((a, b) => a - b);

        // For each sub-segment between transition points
        for (let i = 0; i < dpPoints.length - 1; i++) {
          const segStart = dpPoints[i];
          const segEnd = dpPoints[i + 1];
          const segLength = segEnd - segStart;
          if (segLength <= 0) continue;

          // Find covering casings for this sub-segment
          const covering = casingsInput.filter((c) => {
            if (!c.use) return false;
            if (c.depth <= segStart) return false;
            const topVal = typeof c.top !== 'undefined' ? c.top : 0;
            if (topVal >= segEnd) return false;
            if (c.role === 'conductor' && surfaceInUse) return false;
            if (c.role === 'surface' && intermediateInUse) return false;
            return true;
          });

          if (covering.length > 0) {
            // Sort by ID to find innermost
            covering.sort((a, b) => {
              const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
              const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
              return ai - bi;
            });
            const owningCasing = covering[0];

            if (owningCasing.id && dpSeg.od) {
              const casingIdRadius = (owningCasing.id / 2) * 0.0254;
              const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
              const dpOdRadius = (dpSeg.od / 2) * 0.0254;
              const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);
              const annulusArea = Math.max(0, casingIdArea - dpOdArea);
              const annulusVol = annulusArea * segLength;
              totalAnnulusVol += annulusVol;
            }
          }
        }
      });

      // Split DP and annulus volumes by POI
      if (dpBottom <= plugDepthVal) {
        // Entire DP string is above POI
        plugAboveDrillpipe = dpSegments.reduce(
          (sum, seg) => sum + seg.idVol,
          0
        );
        plugAboveDrillpipeAnnulus = totalAnnulusVol;
        plugBelowDrillpipe = 0;
        plugBelowDrillpipeAnnulus = 0;
      } else if (0 >= plugDepthVal) {
        // Entire DP string is below POI (unusual)
        plugAboveDrillpipe = 0;
        plugAboveDrillpipeAnnulus = 0;
        plugBelowDrillpipe = dpSegments.reduce(
          (sum, seg) => sum + seg.idVol,
          0
        );
        plugBelowDrillpipeAnnulus = totalAnnulusVol;
      } else {
        // DP crosses POI - recalculate both ID volume and annulus for each portion

        // Calculate DP ID volumes by segment portions above/below POI
        let dpIdAbovePOI = 0;
        let dpIdBelowPOI = 0;
        let annulusAbovePOI = 0;
        let annulusBelowPOI = 0;

        dpSegments.forEach((dpSeg) => {
          // Collect all casing transition points within this DP segment
          const dpPointsSet = new Set([dpSeg.top, dpSeg.bottom]);
          casingsInput.forEach((c) => {
            const topVal = typeof c.top !== 'undefined' ? c.top : 0;
            if (topVal > dpSeg.top && topVal < dpSeg.bottom) {
              dpPointsSet.add(topVal);
            }
            if (c.depth > dpSeg.top && c.depth < dpSeg.bottom) {
              dpPointsSet.add(c.depth);
            }
          });
          // Add POI as a transition point
          if (plugDepthVal > dpSeg.top && plugDepthVal < dpSeg.bottom) {
            dpPointsSet.add(plugDepthVal);
          }

          const dpPoints = Array.from(dpPointsSet).sort((a, b) => a - b);

          // For each sub-segment between transition points
          for (let i = 0; i < dpPoints.length - 1; i++) {
            const segStart = dpPoints[i];
            const segEnd = dpPoints[i + 1];
            const segLength = segEnd - segStart;
            if (segLength <= 0) continue;

            // Calculate DP ID volume for this sub-segment
            const segIdVol = (dpSeg.lPerM / 1000) * segLength;

            // Find covering casings for annulus calculation
            const covering = casingsInput.filter((c) => {
              if (!c.use) return false;
              if (c.depth <= segStart) return false;
              const topVal = typeof c.top !== 'undefined' ? c.top : 0;
              if (topVal >= segEnd) return false;
              if (c.role === 'conductor' && surfaceInUse) return false;
              if (c.role === 'surface' && intermediateInUse) return false;
              return true;
            });

            let segAnnulusVol = 0;
            if (covering.length > 0) {
              // Sort by ID to find innermost
              covering.sort((a, b) => {
                const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
                const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
                return ai - bi;
              });
              const owningCasing = covering[0];

              if (owningCasing.id && dpSeg.od) {
                const casingIdRadius = (owningCasing.id / 2) * 0.0254;
                const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
                const dpOdRadius = (dpSeg.od / 2) * 0.0254;
                const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);
                const annulusArea = Math.max(0, casingIdArea - dpOdArea);
                segAnnulusVol = annulusArea * segLength;
              }
            }

            // Split by POI
            if (segEnd <= plugDepthVal) {
              dpIdAbovePOI += segIdVol;
              annulusAbovePOI += segAnnulusVol;
            } else if (segStart >= plugDepthVal) {
              dpIdBelowPOI += segIdVol;
              annulusBelowPOI += segAnnulusVol;
            } else {
              // Sub-segment crosses POI
              const lenAbove = plugDepthVal - segStart;
              const lenBelow = segEnd - plugDepthVal;
              dpIdAbovePOI += (dpSeg.lPerM / 1000) * lenAbove;
              dpIdBelowPOI += (dpSeg.lPerM / 1000) * lenBelow;

              if (covering.length > 0) {
                covering.sort((a, b) => {
                  const ai = isNaN(Number(a.id)) ? Infinity : Number(a.id);
                  const bi = isNaN(Number(b.id)) ? Infinity : Number(b.id);
                  return ai - bi;
                });
                const owningCasing = covering[0];
                if (owningCasing.id && dpSeg.od) {
                  const casingIdRadius = (owningCasing.id / 2) * 0.0254;
                  const casingIdArea = Math.PI * Math.pow(casingIdRadius, 2);
                  const dpOdRadius = (dpSeg.od / 2) * 0.0254;
                  const dpOdArea = Math.PI * Math.pow(dpOdRadius, 2);
                  const annulusArea = Math.max(0, casingIdArea - dpOdArea);
                  annulusAbovePOI += annulusArea * lenAbove;
                  annulusBelowPOI += annulusArea * lenBelow;
                }
              }
            }
          }
        });

        plugAboveDrillpipe = dpIdAbovePOI;
        plugBelowDrillpipe = dpIdBelowPOI;
        plugAboveDrillpipeAnnulus = annulusAbovePOI;
        plugBelowDrillpipeAnnulus = annulusBelowPOI;
      }

      // Calculate open casing volume (casing volume not occupied by DP or annulus)
      // This is the volume in the casing below the DP, or between casing layers
      const openCasingAboveLen = Math.max(
        0,
        Math.min(plugDepthVal, dpBottom) - 0
      );
      const openCasingBelowLen = Math.max(0, plugDepthVal - dpBottom);

      // Get the casing volume from the hole volume table for the relevant depth range
      let openCasingVolAbove = 0;
      let openCasingVolBelow = 0;

      // Find which casing contains the DP
      for (const casing of casingsInput) {
        if (casing.use && casing.depth > dpBottom) {
          const casingTop = typeof casing.top !== 'undefined' ? casing.top : 0;
          if (casingTop <= dpBottom) {
            // Calculate open casing volume: total casing volume - DP volume - annulus volume
            // for the depth ranges relevant to POI
            const casingPerMeter =
              Math.PI * Math.pow((casing.id / 2) * 0.0254, 2);

            if (dpBottom > plugDepthVal) {
              // DP crosses POI - calculate open casing volume between POI and dpBottom
              const openCasingLen = plugDepthVal - 0; // from top of well to POI
              if (openCasingLen > 0) {
                const totalCasingVol = casingPerMeter * openCasingLen;
                // Use the portion of DP ID volume that is above POI
                const dpVolAbove = plugAboveDrillpipe;
                // Use the annulus volume above POI
                const annulusVolAbove = plugAboveDrillpipeAnnulus;
                openCasingVolAbove = Math.max(
                  0,
                  totalCasingVol - dpVolAbove - annulusVolAbove
                );
              }
              // Volume below POI (from POI to bottom of well or casing)
              // This is calculated in the well breakdown, not here
            } else {
              // All DP above POI
              if (openCasingAboveLen > 0) {
                const totalCasingVolAbove = casingPerMeter * openCasingAboveLen;
                const dpVolAbove = dpSegments.reduce(
                  (sum, seg) => sum + seg.idVol,
                  0
                );
                const annulusVolAbove = totalAnnulusVol;
                openCasingVolAbove = Math.max(
                  0,
                  totalCasingVolAbove - dpVolAbove - annulusVolAbove
                );
              }

              if (openCasingBelowLen > 0) {
                // For the volume below DP but above POI, use the same casing
                const totalCasingVolBelow = casingPerMeter * openCasingBelowLen;
                openCasingVolBelow = Math.max(0, totalCasingVolBelow);
              }
            }
            break;
          }
        }
      }

      // Track open casing volumes separately for POI display
      // These represent the volume between drill pipe (0-dpBottom) and POI
      if (dpBottom <= plugDepthVal) {
        // All DP above POI, open casing volume extends below DP toward POI
        plugAboveDrillpipeOpenCasing = openCasingVolBelow;
        plugBelowDrillpipeOpenCasing = 0;
      } else {
        // DP extends below POI - no open casing volume between DP and POI
        plugAboveDrillpipeOpenCasing = 0;
        plugBelowDrillpipeOpenCasing = 0;
      }

      // Add open casing volume to the overall totals
      if (dpBottom <= plugDepthVal) {
        // All DP above POI, open casing volume extends below DP toward POI
        if (openCasingVolBelow > 0) {
          plugAboveVolume += openCasingVolBelow;
        }
      } else {
        // DP extends below POI - add open casing volume above POI if any
        if (openCasingVolAbove > 0) {
          plugAboveVolume += openCasingVolAbove;
        }

        // When DP crosses POI, subtract EOD displacement for each DP segment below POI
        // Total vol below POI = Total casing volume below POI - Σ(length_below_POI * DP_eod)
        let eodDisplacementBelowPOI = 0;
        dpSegments.forEach((dpSeg) => {
          // Calculate how much of this DP segment is below POI
          if (dpSeg.bottom > plugDepthVal) {
            const lengthBelowPOI =
              dpSeg.bottom - Math.max(dpSeg.top, plugDepthVal);
            if (lengthBelowPOI > 0) {
              let segmentEodDisplacement = 0;

              if (dpSeg.eod) {
                // EOD is in L/m, convert to m³
                segmentEodDisplacement = (dpSeg.eod / 1000) * lengthBelowPOI;
              } else if (dpSeg.od && dpSeg.lPerM) {
                // Fallback: calculate steel displacement from OD and lPerM (preferred method)
                // Use lPerM directly as ID cross-sectional area
                segmentEodDisplacement = calculatePipeSteelVolumeFromLPerM(
                  lengthBelowPOI,
                  dpSeg.od,
                  dpSeg.lPerM
                );
              } else if (dpSeg.od && dpSeg.id) {
                // Fallback 2: calculate steel displacement from OD and ID (in inches)
                segmentEodDisplacement = calculatePipeSteelVolume(
                  lengthBelowPOI,
                  dpSeg.od,
                  dpSeg.id
                );
              }

              eodDisplacementBelowPOI += segmentEodDisplacement;
            }
          }
        });

        dpEodDisplacementBelowPOI = eodDisplacementBelowPOI; // Save for later use
        plugBelowVolume = Math.max(
          0,
          plugBelowVolume - eodDisplacementBelowPOI
        );
      }
    }
  }

  // Subtract tubing (UC) steel displacement below POI if tubing crosses POI.
  // Prefer explicit closed-end (EOD) value if provided, otherwise use OD/ID
  // geometry to compute steel displacement. Only subtract the amount NOT
  // already subtracted during segment loop processing to avoid double subtraction.
  if (
    plugEnabled &&
    ucActive &&
    !isNaN(plugDepthVal) &&
    typeof plugDepthVal !== 'undefined' &&
    ucBottomVal > plugDepthVal
  ) {
    let totalUcSteelBelow = 0;

    ucSegments.forEach((ucSeg) => {
      const segTop = typeof ucSeg.top !== 'undefined' ? ucSeg.top : 0;
      const segBottom = ucSeg.depth || 0;
      const lengthBelow = segBottom - Math.max(segTop, plugDepthVal);
      if (lengthBelow <= 0) return;

      if (subtractEod && typeof ucSeg.eod !== 'undefined' && ucSeg.eod > 0) {
        totalUcSteelBelow += (ucSeg.eod / 1000) * lengthBelow;
      } else if (ucSeg.od && ucSeg.id) {
        const tubingSteelArea = Math.max(
          0,
          calculatePipeSteelArea(ucSeg.od, ucSeg.id)
        );
        totalUcSteelBelow += tubingSteelArea * lengthBelow;
      }
    });

    const remainingToSubtract = Math.max(
      0,
      totalUcSteelBelow - ucSteelSubtractedBelow
    );

    if (remainingToSubtract > 0) {
      plugBelowVolume = Math.max(0, plugBelowVolume - remainingToSubtract);
    }
  }

  // Save tubing-mode value AFTER UC steel subtraction
  // This ensures tubing total reflects UC configuration correctly
  // For DP mode: if DP crossed POI, plugBelowVolume has DP EOD subtracted but we want pre-DP value
  // For tubing mode: plugBelowVolume has UC steel subtracted, which is what we want
  if (drillPipeInput && drillPipeInput.mode === 'drillpipe') {
    // In DP mode: add back the DP EOD to get tubing value (without DP but with UC steel)
    plugBelowVolumeTubing = plugBelowVolume + dpEodDisplacementBelowPOI;
  } else {
    // Not in DP mode: plugBelowVolume is the tubing value (with UC steel subtracted)
    plugBelowVolumeTubing = plugBelowVolume;
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

  // Calculate total DP depth if in drill pipe mode
  let dpTotalDepth = 0;
  if (drillPipeInput?.mode === 'drillpipe' && drillPipeInput?.pipes) {
    dpTotalDepth = drillPipeInput.pipes.reduce(
      (sum, dp) => sum + (dp.length || 0),
      0
    );
  }

  return {
    totalVolume,
    perCasingVolumes,
    casingsToDraw,
    plugAboveVolume,
    plugBelowVolume,
    plugBelowVolumeTubing,
    plugAboveTubing,
    plugBelowTubing,
    plugAboveAnnulus,
    plugBelowAnnulus,
    plugAboveTubingOpenCasing,
    plugBelowTubingOpenCasing,
    casingVolumeBelowTubingShoe,
    plugAboveDrillpipe,
    plugBelowDrillpipe,
    plugAboveDrillpipeAnnulus,
    plugBelowDrillpipeAnnulus,
    plugAboveDrillpipeOpenCasing,
    plugBelowDrillpipeOpenCasing,
    ucActive,
    dpMode: drillPipeInput?.mode === 'drillpipe',
    dpTotalDepth,
    plugDepthVal: opts?.plugDepthVal
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
  const ucSegments = casingsInput
    .filter((c) => c.role === 'upper_completion' && c.use)
    .map((c) => ({
      ...c,
      top: typeof c.top !== 'undefined' ? Number(c.top) : 0,
      depth: typeof c.depth !== 'undefined' ? Number(c.depth) : NaN
    }))
    .filter((c) => isFinite(c.top) && isFinite(c.depth));

  if (!ucSegments.length) {
    return {
      used: false,
      sections: [],
      ucIdVolume: 0,
      annulusVolume: 0,
      ucIdLength: 0,
      annulusLength: 0
    };
  }

  // Build fine-grained segments across all UC sections
  const rawSegments = [];
  ucSegments.forEach((ucSeg) => {
    const ucTopVal = ucSeg.top;
    const ucBottomVal = ucSeg.depth;
    if (!isFinite(ucTopVal) || !isFinite(ucBottomVal)) return;
    if (ucBottomVal <= ucTopVal) return;

    const ucIdArea = ucSeg.id
      ? Math.PI * Math.pow((ucSeg.id / 2) * 0.0254, 2)
      : 0;
    const ucOdRadius = ucSeg.od ? (ucSeg.od / 2) * 0.0254 : 0;
    const ucOdArea = ucOdRadius > 0 ? Math.PI * Math.pow(ucOdRadius, 2) : 0;

    const pointsSet = new Set([ucTopVal, ucBottomVal]);
    casingsInput.forEach((c) => {
      if (c.role === 'upper_completion') return;
      if (!c.use) return;
      if (c.depth <= ucTopVal || c.top >= ucBottomVal) return;
      if (
        typeof c.top !== 'undefined' &&
        isFinite(Number(c.top)) &&
        Number(c.top) > ucTopVal &&
        Number(c.top) < ucBottomVal
      ) {
        pointsSet.add(Number(c.top));
      }
      if (
        isFinite(Number(c.depth)) &&
        Number(c.depth) > ucTopVal &&
        Number(c.depth) < ucBottomVal
      ) {
        pointsSet.add(Number(c.depth));
      }
    });

    const points = Array.from(pointsSet)
      .filter((p) => isFinite(p))
      .sort((a, b) => a - b);

    for (let i = 0; i < points.length - 1; i++) {
      const segStart = points[i];
      const segEnd = points[i + 1];
      const segLength = segEnd - segStart;
      if (segLength <= 0) continue;

      const ucIdVol = ucIdArea * segLength;

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
        const casingIdRadius = (containingCasing.id / 2) * 0.0254;
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
  });

  if (!rawSegments.length) {
    return {
      used: false,
      sections: [],
      ucIdVolume: 0,
      annulusVolume: 0,
      ucIdLength: 0,
      annulusLength: 0
    };
  }

  rawSegments.sort((a, b) => a.start - b.start);

  // Merge consecutive raw segments that share the same containerKey
  const merged = [];
  for (const seg of rawSegments) {
    const last = merged.length ? merged[merged.length - 1] : null;
    if (
      last &&
      last.containerKey === seg.containerKey &&
      last.end === seg.start
    ) {
      last.end = seg.end;
      last.length += seg.length;
      last.ucIdVol += seg.ucIdVol;
      last.annulusVol += seg.annulusVol;
    } else {
      merged.push({ ...seg });
    }
  }

  const sections = merged.map((m) => ({
    depth: `${(isFinite(m.start) ? m.start : 0).toFixed(1)}-${(isFinite(m.end)
      ? m.end
      : 0
    ).toFixed(1)}`,
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
