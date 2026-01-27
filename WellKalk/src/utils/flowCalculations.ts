import { lpmToM3s } from "./unitConversions";

const INCH_TO_M = 0.0254;

export const calculateAnnularVelocity = (
  flowRateLpm: number,
  outerDiameterIn: number,
  innerDiameterIn: number,
) => {
  const area =
    Math.PI * Math.pow((outerDiameterIn * INCH_TO_M) / 2, 2) -
    Math.PI * Math.pow((innerDiameterIn * INCH_TO_M) / 2, 2);
  if (area <= 0) return 0;
  return lpmToM3s(flowRateLpm) / area;
};