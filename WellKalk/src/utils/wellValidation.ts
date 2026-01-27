import { WellSection } from "../types/well.types";

export const validateSections = (sections: WellSection[]) => {
  const issues: string[] = [];
  const sorted = [...sections].sort((a, b) => a.topMd - b.topMd);

  sorted.forEach((section, index) => {
    if (section.shoeMd <= section.topMd) {
      issues.push(`${section.name} shoe depth must be deeper than top MD.`);
    }
    if (index > 0) {
      const previous = sorted[index - 1];
      if (section.outerDiameterIn >= previous.driftIn) {
        issues.push(
          `${section.name} outer diameter (${section.outerDiameterIn} in) must be less than previous drift (${previous.driftIn} in).`,
        );
      }
    }
  });

  return issues;
};
