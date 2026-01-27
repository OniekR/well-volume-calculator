import { SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const Select = ({ hasError, className, ...props }: SelectProps) => {
  return (
    <select
      className={clsx(
        "w-full rounded-2xl border bg-transparent px-3 py-2 text-sm focus:outline-none",
        hasError ? "border-[var(--eq-danger)]" : "border-[var(--eq-border)]",
        className,
      )}
      {...props}
    />
  );
};

export default Select;
