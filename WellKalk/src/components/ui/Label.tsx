import { LabelHTMLAttributes } from "react";
import clsx from "clsx";

const Label = ({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={clsx(
        "text-xs font-semibold text-[var(--eq-text-muted)]",
        className,
      )}
      {...props}
    />
  );
};

export default Label;
