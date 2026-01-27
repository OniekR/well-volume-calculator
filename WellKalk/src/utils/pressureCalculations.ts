export const calculatePressurizedLiters = (
  volumeM3: number,
  deltaPressureBar: number,
  kFactor: number,
) => {
  if (kFactor <= 0) return 0;
  return ((volumeM3 * deltaPressureBar) / kFactor) * 1000;
};