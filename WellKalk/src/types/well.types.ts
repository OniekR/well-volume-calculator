export type RiserType = "drilling" | "production" | "marine" | "none";

export type WellSectionType =
  | "riser"
  | "conductor"
  | "surface"
  | "intermediate"
  | "production"
  | "reservoir"
  | "small"
  | "openHole";

export interface CasingProfile {
  label: string;
  outerDiameterIn: number;
  innerDiameterIn: number;
  driftIn: number;
  weightPerFt: number;
  grade: string;
}

export interface WellSection {
  id: string;
  type: WellSectionType;
  name: string;
  topMd: number;
  shoeMd: number;
  outerDiameterIn: number;
  innerDiameterIn: number;
  driftIn: number;
  weightPerFt: number;
  grade: string;
  isLiner?: boolean;
}

export interface WellDesign {
  id: string;
  name: string;
  airGapM: number;
  waterDepthM: number;
  riserDepthM?: number;
  sections: WellSection[];
  createdAt: string;
  updatedAt: string;
}