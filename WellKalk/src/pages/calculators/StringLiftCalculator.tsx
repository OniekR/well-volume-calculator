import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import ResultCard from "../../components/calculators/shared/ResultCard";
import { calculateLiftForce } from "../../utils/liftCalculations";

const StringLiftCalculator = () => {
  const [casingId, setCasingId] = useState(8.6);
  const [pipeOd, setPipeOd] = useState(5);
  const [pressureBar, setPressureBar] = useState(150);

  const force = useMemo(
    () => calculateLiftForce(casingId, pipeOd, pressureBar),
    [casingId, pipeOd, pressureBar],
  );

  return (
    <CalculatorLayout
      title="String Lift Calculator"
      description="Compute lift force from pressure."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="casing-id">Casing ID (in)</Label>
          <Input
            id="casing-id"
            type="number"
            value={casingId}
            onChange={(e) => setCasingId(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="pipe-od">Drill Pipe OD (in)</Label>
          <Input
            id="pipe-od"
            type="number"
            value={pipeOd}
            onChange={(e) => setPipeOd(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="pressure">Pressure (bar)</Label>
          <Input
            id="pressure"
            type="number"
            value={pressureBar}
            onChange={(e) => setPressureBar(Number(e.target.value))}
          />
        </div>
      </div>
      <ResultCard
        title="Lift Force"
        value={`${(force / 1000).toFixed(1)} kN`}
      />
    </CalculatorLayout>
  );
};

export default StringLiftCalculator;
