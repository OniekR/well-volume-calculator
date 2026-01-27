import { WellSection } from "../types/well.types";

export interface WellSlice {
  id: string;
  label: string;
  depthTop: number;
  depthBottom: number;
  diameter: number;
  color: string;
}

export const buildSlices = (sections: WellSection[]): WellSlice[] => {
  return sections.map((section) => ({
    id: section.id,
    label: section.name,
    depthTop: section.topMd,
    depthBottom: section.shoeMd,
    diameter: section.outerDiameterIn,
    color: section.type === "production" ? "var(--eq-tubing-green)" : "#90a4b4",
  }));
};