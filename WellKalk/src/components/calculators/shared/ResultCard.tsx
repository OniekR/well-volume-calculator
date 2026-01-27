import { ReactNode } from "react";

interface ResultCardProps {
  title: string;
  value: string;
  children?: ReactNode;
}

const ResultCard = ({ title, value, children }: ResultCardProps) => {
  return (
    <div className="rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface)] p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--eq-text-muted)]">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {children}
    </div>
  );
};

export default ResultCard;