"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "tertiary" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT: Record<Variant, string> = {
  // Forest-green CTA. Soft green-tinted lift on the cream surface; flattens
  // on press via the active:scale below.
  primary:
    "bg-accent text-white shadow-[0_6px_16px_-4px_rgba(42,92,65,0.28)] hover:bg-accent-pressed",
  secondary:
    "border border-line bg-bg-elevated text-ink hover:border-ink-secondary",
  tertiary:
    "bg-transparent text-accent hover:text-accent-pressed",
  destructive:
    "bg-danger text-white hover:opacity-90",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3 text-callout font-medium gap-1.5",
  md: "h-[50px] px-5 text-[16px] font-semibold gap-2",
  lg: "h-14 px-6 text-[17px] font-semibold gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    disabled,
    type = "button",
    style,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      // Pill shape matches the design's 26px radius on a 52px CTA. Inline so
      // class-merging / specificity never reverts it.
      style={{ borderRadius: 9999, ...style }}
      className={cn(
        "inline-flex select-none items-center justify-center font-medium",
        "transition-transform duration-100 ease-out active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT[variant],
        SIZE[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {leftIcon ? (
        <span className="inline-flex shrink-0" aria-hidden>
          {leftIcon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
      {rightIcon ? (
        <span className="inline-flex shrink-0" aria-hidden>
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
});

export default Button;
