import { useMemo, useState } from "react";
import CalculatorLayout from "../../components/calculators/shared/CalculatorLayout";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import ResultCard from "../../components/calculators/shared/ResultCard";
import Button from "../../components/ui/Button";
import { calculateAnnularVelocity } from "../../utils/flowCalculations";
import { useCalculatorData } from "../../hooks/useCalculatorData";

const FluidFlowCalculator = () => {
  const [flowRateLpm, setFlowRateLpm] = useState(1000);
  const [outerDiameterIn, setOuterDiameterIn] = useState(12.25);
  const [innerDiameterIn, setInnerDiameterIn] = useState(5);

  const velocity = useMemo(
    () =>
      calculateAnnularVelocity(flowRateLpm, outerDiameterIn, innerDiameterIn),
    [flowRateLpm, outerDiameterIn, innerDiameterIn],
  );

  const { getTopSection } = useCalculatorData();

  const useTopSection = () => {
    const top = getTopSection();
    if (!top) return;
    setOuterDiameterIn(top.outerDiameterIn);
    setInnerDiameterIn(top.innerDiameterIn);
  };

  return (
    <CalculatorLayout
      title="Fluid Flow Calculator"
      description="Convert flow rate to annular velocity."
    >
      <div className="flex items-center justify-end">
        <Button variant="secondary" onClick={useTopSection}>
          Use Well Data
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="flow">Flow Rate (L/min)</Label>
          <Input
            id="flow"
            type="number"
            value={flowRateLpm}
            onChange={(e) => setFlowRateLpm(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="outer">Outer Diameter (in)</Label>
          <Input
            id="outer"
            type="number"
            value={outerDiameterIn}
            onChange={(e) => setOuterDiameterIn(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="inner">Inner Diameter (in)</Label>
          <Input
            id="inner"
            type="number"
            value={innerDiameterIn}
            onChange={(e) => setInnerDiameterIn(Number(e.target.value))}
          />
        </div>
      </div>
      <ResultCard
        title="Annular Velocity"
        value={`${velocity.toFixed(3)} m/s`}
      />
    </CalculatorLayout>
  );
};

export default FluidFlowCalculator;
