export const OD = {
  conductor: { 17.8: 18.625, 28: 30, 27: 30 },
  riser: { 17.5: 20, 8.5: 9.5 },
  surface: { 18.73: 20, 17.8: 18.625 },
  intermediate: { 12.415: 13.375, 12.375: 13.625 },
  production: { 6.276: 7, 8.921: 9.625, 8.535: 8.508 },
  tieback: { 8.535: 9.625, 8.921: 9.625, 9.66: 11.5 },
  reservoir: { 6.184: 7, 6.276: 7, 4.778: 5.5 },
  small_liner: { 4.276: 5, 3.958: 4.5 },
  upper_completion: { 4.892: 5.5, 3.958: 4.5 }
};

export const TJ = {
  upper_completion: { 4.892: 6.098, 3.958: 4.967 },
  // TJ entry for 4 1/2" 12.6# L-80 tubing (Nom ID 3.958)
  small_liner: { 3.958: 4.967 }
};

// Human-friendly labels used by dropdowns. Add new labels here as needed.
export const SIZE_LABELS = {
  small_liner: {
    3.958: '4 1/2" 12.6# L-80'
  },
  upper_completion: {
    3.958: '4 1/2" 12.6# L-80'
  }
};

export const DRIFT = {
  conductor: { 28: 27.813, 27: 26.755 },
  surface: { 17.8: 17.168, 18.73: 18.5 },
  intermediate: { 12.415: 12.259, 12.375: 12.26 },
  production: { 8.535: 8.508, 8.681: 8.525 },
  reservoir: { 6.184: 6.102, 4.778: 4.653 },
  small_liner: { 4.276: 4.151, 3.958: 3.833 }
};

export const MINIMUM_HOLE_CLEANING_VELOCITY = 0.8;
