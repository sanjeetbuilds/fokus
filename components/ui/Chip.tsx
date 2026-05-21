"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface ChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  selected?: boolean;
  leftIcon?: ReactNode;
  size?: "sm" | "md";
}

export default function Chip({
  selected = false,
  leftIcon,
  className,
  children,
  disabled,
  size = "md",
  ...rest
}: ChipProps) {
  const sizing =
    size === "sm"
      ? "h-9 px-3.5 text-[13px]"
      : "h-11 px-5 text-[15px]";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      disabled={disabled}
      className={cn(
        "inline-flex select-none items-center gap-1.5 rounded-full",
        sizing,
        "transition-[background-color,border-color,color,transform] duration-fast ease-out active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border border-transparent bg-accent font-bold text-white shadow-sm"
          : "border border-transparent bg-bg-alt font-bold text-ink-secondary hover:bg-line",
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
    </button>
  );
}
