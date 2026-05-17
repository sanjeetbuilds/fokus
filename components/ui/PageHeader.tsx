"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  eyebrow,
  onBack,
  backLabel = "Back",
  rightAction,
  className,
}: PageHeaderProps) {
  const hasTopRow = Boolean(onBack || rightAction);

  return (
    <header className={cn("px-5 pt-5", className)}>
      {hasTopRow ? (
        <div className="-mx-2 mb-4 flex h-9 items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
              <span>{backLabel}</span>
            </button>
          ) : (
            <span aria-hidden />
          )}
          {rightAction ? (
            <div className="inline-flex items-center">{rightAction}</div>
          ) : null}
        </div>
      ) : null}
      {eyebrow ? (
        <p className="text-footnote uppercase tracking-[0.08em] text-ink-tertiary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-1 text-display text-ink">{title}</h1>
    </header>
  );
}
