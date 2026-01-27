import { useContext } from "react";
import { WellContext } from "../context/WellContext";

export const useWellData = () => {
  const ctx = useContext(WellContext);
  if (!ctx) {
    throw new Error("useWellData must be used within WellProvider");
  }
  return ctx;
};