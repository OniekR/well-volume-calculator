import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const Button = ({ variant = "primary", className, ...props }: ButtonProps) => {
  return (
    <button
      className={clsx(
        "rounded-2xl px-4 py-2 text-sm font-medium transition",
        variant === "primary" &&
          "bg-[var(--eq-primary)] text-white hover:bg-[var(--eq-primary-strong)]",
        variant === "secondary" &&
          "bg-transparent border border-[var(--eq-border)] text-[var(--eq-text)] hover:bg-[var(--eq-border)]",
        variant === "danger" && "bg-[var(--eq-danger)] text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
};

export default Button;
