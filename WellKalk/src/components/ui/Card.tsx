import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const Card = ({ title, children, className }: CardProps) => {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-[var(--eq-border)] bg-[var(--eq-surface-strong)] p-5",
        className,
      )}
    >
      {title && <h3 className="mb-3 text-base font-semibold">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
