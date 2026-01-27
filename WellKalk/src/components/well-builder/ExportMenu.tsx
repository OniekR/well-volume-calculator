import Button from "../ui/Button";
import { WellDesign } from "../../types/well.types";
import { exportWellToExcel } from "../../utils/exportHelpers";

interface ExportMenuProps {
  well: WellDesign;
}

const ExportMenu = ({ well }: ExportMenuProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => exportWellToExcel(well)}>
        Export to Excel
      </Button>
    </div>
  );
};

export default ExportMenu;