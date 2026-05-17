import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  cta?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-5 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 text-ink-tertiary" aria-hidden>
          {icon}
        </div>
      ) : null}
      <h3 className="text-title-3 text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-[280px] text-body text-ink-secondary">
          {description}
        </p>
      ) : null}
      {cta ? <div className="mt-6">{cta}</div> : null}
    </div>
  );
}
