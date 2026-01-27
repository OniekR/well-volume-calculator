import { VolumeRow } from "../types/calculator.types";

const INCH_TO_M = 0.0254;

export const calculateCylinderVolume = (
  diameterIn: number,
  lengthM: number,
) => {
  const radiusM = (diameterIn * INCH_TO_M) / 2;
  return Math.PI * radiusM * radiusM * lengthM;
};

export const buildSectionVolumes = (rows: VolumeRow[]) => {
  return rows.map((row) => ({
    ...row,
    volumeM3: calculateCylinderVolume(row.diameterIn, row.lengthM),
  }));
};