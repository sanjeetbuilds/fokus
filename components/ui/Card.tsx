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
        // White surface with the design's soft lift shadow (no border).
        "rounded-lg bg-bg-elevated p-4 shadow-md",
        interactive &&
          "cursor-pointer transition-all duration-fast ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;
