import { ReactNode } from "react";
import clsx from "clsx";

interface BadgeProps {
  tone?: "neutral" | "success" | "warning";
  children: ReactNode;
}

const Badge = ({ tone = "neutral", children }: BadgeProps) => {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-1 text-xs font-medium",
        tone === "neutral" &&
          "bg-[var(--eq-border)] text-[var(--eq-text-muted)]",
        tone === "success" && "bg-[var(--eq-success)] text-white",
        tone === "warning" && "bg-[var(--eq-warning)] text-white",
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
