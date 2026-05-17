"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface RadioCardProps {
  selected: boolean;
  onSelect: () => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** Optional name shown in screen reader announcements as the radio group name. */
  groupLabel?: string;
  className?: string;
}

/**
 * A large, full-width radio control rendered as a card. Used in onboarding
 * (English confidence) and the log-session screen (six response options).
 *
 * Built as a <button role="radio"> rather than a real <input type="radio">
 * because the card surface needs hover/active states the bare radio can't
 * give us. Grouping is the caller's responsibility; wrap a set in a
 * <div role="radiogroup" aria-label="...">.
 */
export default function RadioCard({
  selected,
  onSelect,
  label,
  description,
  disabled,
  className,
}: RadioCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-lg border p-4 transition-[transform,background-color,border-color] duration-fast ease-out",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-accent bg-accent-bg"
          : "border-line bg-bg-elevated hover:border-line",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            selected ? "border-accent" : "border-line",
          )}
        >
          {selected ? (
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          ) : null}
        </span>
        <span className="text-headline text-ink">{label}</span>
      </div>
      {description ? (
        <p className="mt-2 pl-8 text-footnote text-ink-secondary">
          {description}
        </p>
      ) : null}
    </button>
  );
}
