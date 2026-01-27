import { WellSection } from "../../types/well.types";
import { buildSlices } from "../../utils/wellGeometry";
import WellCanvas from "./WellCanvas";

interface WellVisualizationProps {
  sections: WellSection[];
}

const WellVisualization = ({ sections }: WellVisualizationProps) => {
  const slices = buildSlices(sections);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Well Visualization</h3>
      {sections.length === 0 ? (
        <p className="text-sm text-[var(--eq-text-muted)]">No sections to visualize.</p>
      ) : (
        <WellCanvas slices={slices} />
      )}
    </div>
  );
};

export default WellVisualization;