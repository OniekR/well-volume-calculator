import { ReactNode } from "react";

interface CalculatorLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const CalculatorLayout = ({
  title,
  description,
  children,
}: CalculatorLayoutProps) => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-[var(--eq-text-muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
};

export default CalculatorLayout;