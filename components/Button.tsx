import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
}

const VARIANTS: Record<Variant, string> = {
  primary:   "bg-brand text-white hover:bg-brand-hover",
  secondary: "bg-surface border border-border text-ink hover:bg-sunk",
  ghost:     "text-brand hover:bg-brand-soft",
  danger:    "bg-late text-white hover:opacity-90",
};

const SIZES = {
  sm: "h-7 px-3 text-[13px]",
  md: "h-9 px-4 text-[14px]",
};

export default function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 font-body font-medium rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </button>
  );
}
