export const calculateStrokesToBump = (
  cementVolumeM3: number,
  strokeVolumeM3: number,
) => {
  if (strokeVolumeM3 <= 0) return 0;
  return cementVolumeM3 / strokeVolumeM3;
};