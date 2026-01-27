import { createContext, ReactNode, useMemo } from "react";
import { WellDesign, WellSection } from "../types/well.types";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface WellContextValue {
  wells: WellDesign[];
  activeWellId: string | null;
  activeWell: WellDesign | null;
  setActiveWell: (id: string) => void;
  saveWell: (well: WellDesign) => void;
  deleteWell: (id: string) => void;
  updateSections: (sections: WellSection[]) => void;
}

export const WellContext = createContext<WellContextValue | undefined>(
  undefined,
);

interface WellProviderProps {
  children: ReactNode;
}

const createDefaultWell = (): WellDesign => ({
  id: crypto.randomUUID(),
  name: "New Well",
  airGapM: 30,
  waterDepthM: 300,
  riserDepthM: 330,
  sections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const WellProvider = ({ children }: WellProviderProps) => {
  const [wells, setWells] = useLocalStorage<WellDesign[]>("wells", [
    createDefaultWell(),
  ]);
  const [activeWellId, setActiveWellId] = useLocalStorage<string | null>(
    "activeWellId",
    wells[0]?.id ?? null,
  );

  const activeWell = useMemo(
    () => wells.find((well) => well.id === activeWellId) ?? null,
    [wells, activeWellId],
  );

  const setActiveWell = (id: string) => {
    setActiveWellId(id);
  };

  const saveWell = (well: WellDesign) => {
    setWells((prev) => {
      const exists = prev.find((item) => item.id === well.id);
      if (exists) {
        return prev.map((item) =>
          item.id === well.id ? { ...well, updatedAt: new Date().toISOString() } : item,
        );
      }
      return [...prev, { ...well, updatedAt: new Date().toISOString() }];
    });
  };

  const deleteWell = (id: string) => {
    setWells((prev) => prev.filter((item) => item.id !== id));
    if (activeWellId === id) {
      setActiveWellId(wells[0]?.id ?? null);
    }
  };

  const updateSections = (sections: WellSection[]) => {
    if (!activeWell) return;
    saveWell({ ...activeWell, sections });
  };

  const value = {
    wells,
    activeWellId,
    activeWell,
    setActiveWell,
    saveWell,
    deleteWell,
    updateSections,
  };

  return <WellContext.Provider value={value}>{children}</WellContext.Provider>;
};