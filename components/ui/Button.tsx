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
  // Brand CTA. Ink #252630 on white surfaces; pressed state via
  // active:scale below.
  primary:
    "bg-ink text-white hover:opacity-90",
  secondary:
    "border border-line bg-bg-elevated text-ink hover:border-ink-secondary",
  tertiary:
    "bg-transparent text-ink hover:opacity-70",
  destructive:
    "bg-danger text-white hover:opacity-90",
};

const SIZE: Record<Size, string> = {
  // sm / md / lg map to the reference's pill heights. md is the
  // canonical CTA height (54px → 27 radius for the pill); sm is a
  // half-step lighter for inline actions.
  sm: "h-9 px-3 text-callout font-bold gap-1.5",
  md: "h-[54px] px-5 text-[16px] font-bold gap-2",
  lg: "h-14 px-6 text-[17px] font-bold gap-2",
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
        "inline-flex select-none items-center justify-center font-bold",
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
