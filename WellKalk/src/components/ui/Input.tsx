import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = ({ hasError, className, ...props }: InputProps) => {
  return (
    <input
      className={clsx(
        "w-full rounded-2xl border px-3 py-2 text-sm focus:outline-none",
        hasError ? "border-[var(--eq-danger)]" : "border-[var(--eq-border)]",
        className,
      )}
      {...props}
    />
  );
};

export default Input;
