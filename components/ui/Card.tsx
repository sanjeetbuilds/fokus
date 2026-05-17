"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "default" | "interactive";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "default",
    className,
    onClick,
    onKeyDown,
    children,
    role,
    tabIndex,
    ...rest
  },
  ref,
) {
  const interactive = variant === "interactive";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!interactive || !onClick || event.defaultPrevented) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event as unknown as MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div
      ref={ref}
      role={role ?? (interactive ? "button" : undefined)}
      tabIndex={tabIndex ?? (interactive ? 0 : undefined)}
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : onKeyDown}
      className={cn(
        "rounded-lg bg-bg-elevated p-4",
        // Subtle 1px line so the white surface still has an edge against
        // the cream page background.
        "border border-line-subtle",
        interactive &&
          "cursor-pointer transition-all duration-fast ease-out hover:shadow-md active:scale-[0.99] active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
