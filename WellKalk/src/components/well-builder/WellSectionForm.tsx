import { useMemo, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import Select from "../ui/Select";
import { WellSection, WellSectionType } from "../../types/well.types";

const sectionOptions: { label: string; value: WellSectionType }[] = [
  { label: "Riser", value: "riser" },
  { label: "Conductor", value: "conductor" },
  { label: "Surface Casing", value: "surface" },
  { label: "Intermediate Casing", value: "intermediate" },
  { label: "Production Casing/Liner", value: "production" },
  { label: "Reservoir Liner", value: "reservoir" },
  { label: "Small Liner", value: "small" },
  { label: "Open Hole", value: "openHole" },
];

const casingProfiles = [
  {
    label: "30 in",
    outerDiameterIn: 30,
    innerDiameterIn: 28,
    driftIn: 27.5,
    weightPerFt: 200,
    grade: "K-55",
  },
  {
    label: "20 in",
    outerDiameterIn: 20,
    innerDiameterIn: 18,
    driftIn: 17.5,
    weightPerFt: 133,
    grade: "K-55",
  },
  {
    label: "18 5/8 in",
    outerDiameterIn: 18.625,
    innerDiameterIn: 17.5,
    driftIn: 17.0,
    weightPerFt: 120,
    grade: "L-80",
  },
  {
    label: "13 3/8 in",
    outerDiameterIn: 13.375,
    innerDiameterIn: 12.3,
    driftIn: 12.0,
    weightPerFt: 80,
    grade: "L-80",
  },
  {
    label: "9 5/8 in",
    outerDiameterIn: 9.625,
    innerDiameterIn: 8.8,
    driftIn: 8.6,
    weightPerFt: 53.5,
    grade: "L-80",
  },
  {
    label: "7 in",
    outerDiameterIn: 7,
    innerDiameterIn: 6.2,
    driftIn: 6.0,
    weightPerFt: 38,
    grade: "P-110",
  },
  {
    label: "4 1/2 in",
    outerDiameterIn: 4.5,
    innerDiameterIn: 4.0,
    driftIn: 3.9,
    weightPerFt: 24,
    grade: "P-110",
  },
  {
    label: "17 1/2 in",
    outerDiameterIn: 17.5,
    innerDiameterIn: 17.5,
    driftIn: 17.5,
    weightPerFt: 0,
    grade: "Open",
  },
  {
    label: "16 in",
    outerDiameterIn: 16,
    innerDiameterIn: 16,
    driftIn: 16,
    weightPerFt: 0,
    grade: "Open",
  },
  {
    label: "12 1/4 in",
    outerDiameterIn: 12.25,
    innerDiameterIn: 12.25,
    driftIn: 12.25,
    weightPerFt: 0,
    grade: "Open",
  },
  {
    label: "8 1/2 in",
    outerDiameterIn: 8.5,
    innerDiameterIn: 8.5,
    driftIn: 8.5,
    weightPerFt: 0,
    grade: "Open",
  },
  {
    label: "6 in",
    outerDiameterIn: 6,
    innerDiameterIn: 6,
    driftIn: 6,
    weightPerFt: 0,
    grade: "Open",
  },
];

interface WellSectionFormProps {
  onAdd: (section: WellSection) => void;
}

const WellSectionForm = ({ onAdd }: WellSectionFormProps) => {
  const [type, setType] = useState<WellSectionType>("riser");
  const [topMd, setTopMd] = useState(0);
  const [shoeMd, setShoeMd] = useState(100);
  const [profileIndex, setProfileIndex] = useState(0);

  const profile = useMemo(() => casingProfiles[profileIndex], [profileIndex]);

  const handleAdd = () => {
    const section: WellSection = {
      id: crypto.randomUUID(),
      type,
      name:
        sectionOptions.find((option) => option.value === type)?.label ??
        "Section",
      topMd,
      shoeMd,
      outerDiameterIn: profile.outerDiameterIn,
      innerDiameterIn: profile.innerDiameterIn,
      driftIn: profile.driftIn,
      weightPerFt: profile.weightPerFt,
      grade: profile.grade,
    };
    onAdd(section);
  };

  return (
    <div className="grid gap-4 rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface)] p-4">
      <div>
        <Label htmlFor="section-type">Section Type</Label>
        <Select
          id="section-type"
          value={type}
          onChange={(e) => setType(e.target.value as WellSectionType)}
        >
          {sectionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="top-md">Top MD</Label>
          <Input
            id="top-md"
            type="number"
            value={topMd}
            onChange={(e) => setTopMd(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="shoe-md">Shoe MD</Label>
          <Input
            id="shoe-md"
            type="number"
            value={shoeMd}
            onChange={(e) => setShoeMd(Number(e.target.value))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="profile">Outer Diameter</Label>
        <Select
          id="profile"
          value={profileIndex}
          onChange={(e) => setProfileIndex(Number(e.target.value))}
        >
          {casingProfiles.map((p, i) => (
            <option key={p.label} value={i}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>
      <Button onClick={handleAdd}>Add Section</Button>
    </div>
  );
};

export default WellSectionForm;
