import { useMemo } from "react";
import { useWellData } from "../hooks/useWellData";
import WellSectionForm from "../components/well-builder/WellSectionForm";
import SectionList from "../components/well-builder/SectionList";
import { validateSections } from "../utils/wellValidation";

const WellBuilderPage = () => {
  const { activeWell, updateSections } = useWellData();

  const warnings = useMemo(
    () => validateSections(activeWell?.sections ?? []),
    [activeWell?.sections],
  );

  if (!activeWell) {
    return (
      <p className="text-[var(--eq-text-muted)]">No active well selected.</p>
    );
  }

  const handleAdd = (section: (typeof activeWell.sections)[number]) => {
    updateSections([...activeWell.sections, section]);
  };

  const handleDelete = (id: string) => {
    updateSections(activeWell.sections.filter((section) => section.id !== id));
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Sections</h3>
          <p className="text-sm text-[var(--eq-text-muted)] mt-2">Create and manage well sections.</p>
        </div>
        <WellSectionForm onAdd={handleAdd} />
        <div>
          <h4 className="text-sm font-semibold mb-3">Added Sections</h4>
          <SectionList sections={activeWell.sections} warnings={warnings} onDelete={handleDelete} />
        </div>
      </div>
      <div className="rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface)] p-4">
        <p className="text-sm text-[var(--eq-text-muted)]">Use the well visualization panel to inspect depths and sizes.</p>
      </div>
    </section>
  );
};

export default WellBuilderPage;