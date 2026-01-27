import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import ResultCard from "../../components/calculators/shared/ResultCard";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import Button from "../../components/ui/Button";
import { buildSectionVolumes } from "../../utils/volumeCalculations";
import { useCalculatorData } from "../../hooks/useCalculatorData";

const WellVolumeCalculator = () => {
  const [lengthM, setLengthM] = useState(1000);
  const [diameterIn, setDiameterIn] = useState(12.25);

  const rows = useMemo(
    () => buildSectionVolumes([{ label: "Open Hole", lengthM, diameterIn, volumeM3: 0 }]),
    [lengthM, diameterIn],
  );

  const totalVolume = rows.reduce((sum, row) => sum + row.volumeM3, 0);

  const { getTopSection } = useCalculatorData();

  const useTopSection = () => {
    const top = getTopSection();
    if (!top) return;
    setLengthM(top.shoeMd - top.topMd);
    setDiameterIn(top.outerDiameterIn);
  };

  return (
    <CalculatorLayout
      title="Well Volume Calculator"
      description="Compute section volumes and totals."
    >
      <div className="flex items-center justify-end">
        <Button variant="secondary" onClick={useTopSection}>
          Use Well Data
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="length">Length (m)</Label>
          <Input
            id="length"
            type="number"
            value={lengthM}
            onChange={(e) => setLengthM(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="diameter">Diameter (in)</Label>
          <Input
            id="diameter"
            type="number"
            value={diameterIn}
            onChange={(e) => setDiameterIn(Number(e.target.value))}
          />
        </div>
      </div>
      <ResultCard
        title="Total Hole Volume"
        value={`${totalVolume.toFixed(2)} m³`}
      />
    </CalculatorLayout>
  );
};

export default WellVolumeCalculator;
