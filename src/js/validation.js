import { TJ } from './constants.js';

/**
 * Returns the TJ value for upper completion given a size id
 */
export function getUpperCompletionTJ(sizeId) {
  if (!sizeId) return undefined;
  const m = TJ.upper_completion || {};
  return m[sizeId] !== undefined ? m[sizeId] : undefined;
}

/**
 * Validate whether the Upper completion fits inside containing casings based on their drift values.
 * casings: array of casing objects with properties: role, top, depth, use, drift
 * returns array of objects describing failures: { role, drift, tj }
 */
export function validateUpperCompletionFit(casings) {
  const ucSegments = casings.filter(
    (c) => c.role === 'upper_completion' && c.use
  );
  if (!ucSegments.length) return [];

  const failures = [];
  ucSegments.forEach((uc) => {
    const tj = getUpperCompletionTJ(uc.id);
    if (typeof tj === 'undefined') return;

    const containerCasings = casings.filter((c) => {
      if (!c.use) return false;
      if (c.role === 'open_hole') return false;
      const topVal = typeof uc.top !== 'undefined' ? uc.top : 0;
      const ucDepth = uc.depth;
      if (typeof c.depth === 'undefined' || isNaN(c.depth)) return false;
      const cTop = typeof c.top !== 'undefined' ? c.top : 0;
      return cTop <= topVal && c.depth >= ucDepth;
    });

    containerCasings.forEach((c) => {
      if (
        typeof c.drift !== 'undefined' &&
        c.drift !== null &&
        !isNaN(c.drift)
      ) {
        if (tj > c.drift) failures.push({ role: c.role, drift: c.drift, tj });
      }
    });
  });

  return failures;
}
