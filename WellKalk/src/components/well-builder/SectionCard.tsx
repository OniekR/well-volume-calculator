import { AlertTriangle, Trash2 } from "lucide-react";
import { WellSection } from "../../types/well.types";
import Button from "../ui/Button";

interface SectionCardProps {
  section: WellSection;
  showWarning?: boolean;
  onDelete: () => void;
}

const SectionCard = ({ section, showWarning, onDelete }: SectionCardProps) => {
  return (
    <div className="rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">{section.name}</h4>
            <span className="text-xs text-[var(--eq-text-muted)]">
              {section.type}
            </span>
          </div>
          <p className="text-xs text-[var(--eq-text-muted)] mt-2">
            Top MD: {section.topMd} m • Shoe MD: {section.shoeMd} m
          </p>
          <p className="text-xs text-[var(--eq-text-muted)] mt-1">
            OD: {section.outerDiameterIn} in • Drift: {section.driftIn} in
          </p>
          {showWarning && (
            <p className="mt-2 flex items-center gap-2 text-xs text-[var(--eq-warning)]">
              <AlertTriangle size={14} /> This section may conflict with
              previous drift.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="danger" onClick={onDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SectionCard;
