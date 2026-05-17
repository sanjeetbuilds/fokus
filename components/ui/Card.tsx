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
        "bg-bg-elevated rounded-lg p-4",
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
