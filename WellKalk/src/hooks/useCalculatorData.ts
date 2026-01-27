import { useWellData } from "./useWellData";

export const useCalculatorData = () => {
  const { activeWell } = useWellData();

  const getTopSection = () => activeWell?.sections[0];

  return {
    activeWell,
    getTopSection,
  };
};