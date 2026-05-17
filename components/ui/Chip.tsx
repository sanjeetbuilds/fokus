"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface ChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  selected?: boolean;
  leftIcon?: ReactNode;
}

export default function Chip({
  selected = false,
  leftIcon,
  className,
  children,
  disabled,
  ...rest
}: ChipProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 select-none items-center gap-1.5 rounded-full px-[14px] text-callout",
        "transition-[background-color,border-color,color,transform] duration-fast ease-out active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:pointer-events-none disabled:opacity-50",
        selected
          ? "border border-transparent bg-accent text-white"
          : "border border-line bg-transparent text-ink hover:bg-bg-elevated",
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
