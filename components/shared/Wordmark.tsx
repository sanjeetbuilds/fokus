import { cn } from "@/lib/utils/cn";

/**
 * The Fokus wordmark.
 *
 * Renders the brand mark as the lowercase word "fokus" followed by a
 * small dot. Same letterforms and spacing everywhere it appears in
 * the app; size and on-dark/on-light variant are the only knobs.
 *
 *   size      sm 14 / md 20 / lg 32 / xl 48 px text
 *   variant   default = #252630 ink + #9CA5FF periwinkle dot
 *             dark    = #FFFFFF text  + #7FE5D4 bright-teal dot
 *
 * noDot is retained for the one screen (activity detail header) that
 * wants the wordmark without the accent; kept as a back-compat prop
 * rather than a documented size variant.
 */
export type WordmarkSize = "sm" | "md" | "lg" | "xl";
export type WordmarkVariant = "default" | "dark";

export interface WordmarkProps {
  size: WordmarkSize;
  variant?: WordmarkVariant;
  noDot?: boolean;
  className?: string;
}

interface SizeSpec {
  fontSize: number;
  dotSize: number;
  dotMargin: number;
  dotOffset: number;
}

const SIZES: Record<WordmarkSize, SizeSpec> = {
  sm: { fontSize: 16, dotSize: 5, dotMargin: 2, dotOffset: -1 },
  md: { fontSize: 20, dotSize: 5, dotMargin: 2, dotOffset: -2 },
  lg: { fontSize: 32, dotSize: 8, dotMargin: 2, dotOffset: -3 },
  xl: { fontSize: 48, dotSize: 12, dotMargin: 2, dotOffset: -3 },
};

const VARIANTS: Record<
  WordmarkVariant,
  { textColor: string; dotColor: string }
> = {
  default: { textColor: "#252630", dotColor: "#9CA5FF" },
  dark: { textColor: "#FFFFFF", dotColor: "#7FE5D4" },
};

export default function Wordmark({
  size,
  variant = "default",
  noDot = false,
  className,
}: WordmarkProps) {
  const s = SIZES[size];
  const v = VARIANTS[variant];

  return (
    <span
      className={cn("inline-flex items-baseline select-none", className)}
      aria-label="Fokus"
      style={{
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        fontSize: s.fontSize,
        letterSpacing: "-0.035em",
        lineHeight: 1,
        color: v.textColor,
      }}
    >
      <span>fokus</span>
      {noDot ? null : (
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: s.dotSize,
            height: s.dotSize,
            borderRadius: "50%",
            background: v.dotColor,
            marginLeft: s.dotMargin,
            transform: `translateY(${s.dotOffset}px)`,
            flexShrink: 0,
          }}
        />
      )}
    </span>
  );
}
