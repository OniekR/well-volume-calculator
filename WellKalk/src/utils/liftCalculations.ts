const INCH_TO_M = 0.0254;

export const calculateLiftForce = (
  casingIdIn: number,
  drillPipeOdIn: number,
  pressureBar: number,
) => {
  const area =
    Math.PI * Math.pow((casingIdIn * INCH_TO_M) / 2, 2) -
    Math.PI * Math.pow((drillPipeOdIn * INCH_TO_M) / 2, 2);
  const pressurePa = pressureBar * 1e5;
  return pressurePa * area;
};