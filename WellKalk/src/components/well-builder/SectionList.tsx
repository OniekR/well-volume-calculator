import { WellSection } from "../../types/well.types";
import SectionCard from "./SectionCard";

interface SectionListProps {
  sections: WellSection[];
  warnings: string[];
  onDelete: (id: string) => void;
}

const SectionList = ({ sections, warnings, onDelete }: SectionListProps) => {
  if (sections.length === 0) {
    return (
      <p className="text-sm text-[var(--eq-text-muted)]">
        No sections added yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          showWarning={warnings.some((w) => w.includes(section.name))}
          onDelete={() => onDelete(section.id)}
        />
      ))}
    </div>
  );
};

export default SectionList;
