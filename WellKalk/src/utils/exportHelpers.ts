import * as XLSX from "xlsx";
import { WellDesign } from "../types/well.types";

export const exportWellToExcel = (well: WellDesign) => {
  const rows = well.sections.map((section) => ({
    Name: section.name,
    TopMD: section.topMd,
    ShoeMD: section.shoeMd,
    OuterDiameterIn: section.outerDiameterIn,
    InnerDiameterIn: section.innerDiameterIn,
    DriftIn: section.driftIn,
    Grade: section.grade,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Well Sections");
  XLSX.writeFile(workbook, `${well.name.replace(/\s+/g, "_")}_well.xlsx`);
};