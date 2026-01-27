import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import ResultCard from "../../components/calculators/shared/ResultCard";
import { calculateStrokesToBump } from "../../utils/cementCalculations";

const CementCalculator = () => {
  const [cementVolumeM3, setCementVolumeM3] = useState(30);
  const [strokeVolumeM3, setStrokeVolumeM3] = useState(0.05);

  const strokes = useMemo(
    () => calculateStrokesToBump(cementVolumeM3, strokeVolumeM3),
    [cementVolumeM3, strokeVolumeM3],
  );

  return (
    <CalculatorLayout
      title="Cement Calculator"
      description="Estimate cement displacement strokes."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="cement-volume">Cement Volume (m³)</Label>
          <Input
            id="cement-volume"
            type="number"
            value={cementVolumeM3}
            onChange={(e) => setCementVolumeM3(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="stroke-volume">Stroke Volume (m³)</Label>
          <Input
            id="stroke-volume"
            type="number"
            step="0.01"
            value={strokeVolumeM3}
            onChange={(e) => setStrokeVolumeM3(Number(e.target.value))}
          />
        </div>
      </div>
      <ResultCard title="Strokes to Bump" value={strokes.toFixed(1)} />
    </CalculatorLayout>
  );
};

export default CementCalculator;
