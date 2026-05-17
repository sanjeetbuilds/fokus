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
  // The accent-tinted shadow makes the primary CTA feel a touch lifted on
  // the cream background without resorting to a heavier shadow on the page.
  primary:
    "bg-accent text-white shadow-[0_6px_16px_-4px_rgba(58,79,204,0.32)] hover:bg-accent-pressed",
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
      // Inline border-radius pins to --radius-md (12px) so no class merging,
      // cache, or specificity issue can ever round the button into a pill.
      style={{ borderRadius: "var(--radius-md)", ...style }}
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
