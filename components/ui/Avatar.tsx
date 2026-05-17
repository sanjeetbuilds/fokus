import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: Size;
}

const SIZE: Record<Size, string> = {
  sm: "h-8 w-8 text-callout",      // 32px / 16px
  md: "h-11 w-11 text-title-3",    // 44px / 20px
  lg: "h-16 w-16 text-title-1",    // 64px / 28px
};

function initialOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const first = trimmed[0];
  return first ? first.toUpperCase() : "?";
}

export default function Avatar({
  name,
  size = "md",
  className,
  ...rest
}: AvatarProps) {
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-accent-bg font-semibold text-accent-deep",
        SIZE[size],
        className,
      )}
      {...rest}
    >
      <span aria-hidden>{initialOf(name)}</span>
    </div>
  );
}
