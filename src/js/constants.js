export const OD = {
  conductor: { 28: 30, 27: 30 },
  riser: { 17.5: 20, 8.8: 9.5 },
  surface: { 18.73: 20, 17.8: 18.625 },
  intermediate: { 12.415: 13.375, 12.375: 13.625, 12.347: 13.375 },
  production: { 8.535: 8.508, 8.681: 9.625, 9.66: 11.5 },
  tieback: { 8.535: 9.625, 8.681: 9.625, 9.66: 11.5 },
  reservoir: { 6.184: 7, 4.778: 5.5 },
  small_liner: { 4.276: 5, 3.958: 4.5 },
  upper_completion: { 4.892: 5.5, 3.958: 4.5 },
  open_hole: { 17.5: 17.5, 16: 16, 12.25: 12.25, 8.5: 8.5, 6: 6 }
};

export const TJ = {
  upper_completion: { 4.892: 6.098, 3.958: 4.967 },
  // TJ entry for 4 1/2" 12.6# L-80 tubing (Nom ID 3.958)
  small_liner: { 3.958: 4.967 }
};

// Human-friendly labels used by dropdowns. Add new labels here as needed.
export const SIZE_LABELS = {
  conductor: {
    28: '30" 309.7# X-52',
    27: '30" 457# X-56'
  },
  surface: {
    17.8: '18 5/8" 84.5# X-56',
    18.73: '20" 133# K-55'
  },
  intermediate: {
    12.415: '13 3/8" 68# L-80',
    12.347: '13 3/8" 72# P-110',
    12.375: '13 5/8" 88.2# SM100MS'
  },
  production: {
    8.535: '9 5/8" 53.5# L-80',
    8.681: '9 5/8" 47# L-80',
    9.66: '10 3/4" 60.7#'
  },
  tieback: {
    8.535: '9 5/8" 53.5# L-80',
    8.681: '9 5/8" 47# L-80',
    9.66: '10 3/4" 60.7#'
  },
  reservoir: {
    6.184: '7" 29# L-80',
    4.778: '5 1/2" 20# L-80'
  },
  small_liner: {
    3.958: '4 1/2" 12.6# L-80',
    4.276: '5" 18# L-80'
  },
  upper_completion: {
    3.958: '4 1/2" 12.6# L-80'
  }
};

export const DRIFT = {
  conductor: { 28: 27.813, 27: 26.755 },
  surface: { 17.8: 17.168, 18.73: 18.5 },
  intermediate: { 12.415: 12.259, 12.375: 12.26, 12.347: 12.258 },
  production: { 8.535: 8.508, 8.681: 8.525 },
  reservoir: { 6.184: 6.102, 4.778: 4.653 },
  small_liner: { 4.276: 4.151, 3.958: 3.833 }
};

export const MINIMUM_HOLE_CLEANING_VELOCITY = 0.8;

/**
 * Fluid compressibility constants (k values) for pressure test calculations.
 * Formula: V_liters = (V_m³ × ΔP_bar) / k
 */
export const FLUID_COMPRESSIBILITY = {
  wbm_brine: 21,
  obm: 18,
  base_oil: 14,
  kfls: 35
};

export const FLUID_COMPRESSIBILITY_LABELS = {
  wbm_brine: 'WBM / Brine',
  obm: 'OBM',
  base_oil: 'Base Oil',
  kfls: 'KFLS'
};

export const PRESSURE_DEFAULTS = {
  lowPressure: 20,
  highPressure: 345,
  maxPressure: 1035
};
