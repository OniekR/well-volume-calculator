import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import ResultCard from "../../components/calculators/shared/ResultCard";
import { calculatePressurizedLiters } from "../../utils/pressureCalculations";
import Button from "../../components/ui/Button";
import { useCalculatorData } from "../../hooks/useCalculatorData";
import calculateCylinderVolume from "../../utils/volumeCalculations";

const kOptions = [
  { label: "Brine/WBM", value: 21 },
  { label: "OBM", value: 18 },
  { label: "Baseoil", value: 14 },
  { label: "KFLS", value: 35 },
];

const PressureTestCalculator = () => {
  const [volumeM3, setVolumeM3] = useState(12);
  const [deltaPressureBar, setDeltaPressureBar] = useState(50);
  const [kFactor, setKFactor] = useState(21);

  const liters = useMemo(
    () => calculatePressurizedLiters(volumeM3, deltaPressureBar, kFactor),
    [volumeM3, deltaPressureBar, kFactor],
  );

  const { getTopSection } = useCalculatorData();

  const useTopSection = () => {
    const top = getTopSection();
    if (!top) return;
    const length = top.shoeMd - top.topMd;
    const vol = calculateCylinderVolume(top.outerDiameterIn, length);
    setVolumeM3(Number(vol.toFixed(3)));
  };

  return (
    <CalculatorLayout
      title="Pressure Test Calculator"
      description="Compute pressurized fluid volume in liters."
    >
      <div className="flex items-center justify-end">
        <Button variant="secondary" onClick={useTopSection}>
          Use Well Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="volume">Volume (m³)</Label>
          <Input
            id="volume"
            type="number"
            value={volumeM3}
            onChange={(e) => setVolumeM3(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="delta">Delta Pressure (bar)</Label>
          <Input
            id="delta"
            type="number"
            value={deltaPressureBar}
            onChange={(e) => setDeltaPressureBar(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {kOptions.map((option) => (
          <Button
            key={option.value}
            variant={kFactor === option.value ? "primary" : "secondary"}
            onClick={() => setKFactor(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <ResultCard title="Required Liters" value={`${liters.toFixed(1)} L`} />
    </CalculatorLayout>
  );
};

export default PressureTestCalculator;
