export type UnitSystem = "metric" | "imperial";

export interface VolumeRow {
  label: string;
  lengthM: number;
  diameterIn: number;
  volumeM3: number;
}

export interface CementInputs {
  cementVolumeM3: number;
  strokeVolumeM3: number;
  strokesPerBarrel: number;
}

export interface PressureTestInputs {
  totalVolumeM3: number;
  deltaPressureBar: number;
  kFactor: number;
}

export interface FlowInputs {
  flowRateLpm: number;
  outerDiameterIn: number;
  innerDiameterIn: number;
}

export interface StringLiftInputs {
  casingInnerDiameterIn: number;
  drillPipeOuterDiameterIn: number;
  pressureBar: number;
}