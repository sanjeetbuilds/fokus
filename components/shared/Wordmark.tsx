import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "hero";

export interface WordmarkProps {
  size?: Size;
  /** Hide the small dot mark before the F. Default: shown. */
  noDot?: boolean;
  className?: string;
  /**
   * Override the colour scheme. Default `brand` is the canonical wordmark:
   * ink letterforms with a single accent-blue dot. Reads as a proper
   * brand mark instead of plain text. `inverse` for accent-bg surfaces.
   */
  tone?: "brand" | "inverse";
}

const SIZES: Record<Size, { text: string; dot: string; gap: string; offset: string }> = {
  // sm: top of every main screen header
  sm: {
    text: "text-[19px] font-extrabold uppercase tracking-[0.04em]",
    dot: "h-1.5 w-1.5",
    gap: "gap-2",
    offset: "translate-y-[-1px]",
  },
  // md: onboarding final / install splash
  md: {
    text: "text-[24px] font-extrabold uppercase tracking-[0.04em]",
    dot: "h-2 w-2",
    gap: "gap-2.5",
    offset: "translate-y-[-2px]",
  },
  // hero: marketing-scale (kept for the /dev/identity preview)
  hero: {
    text: "text-[64px] font-extrabold uppercase tracking-[0.02em] leading-none",
    dot: "h-3 w-3",
    gap: "gap-4",
    offset: "translate-y-[-4px]",
  },
};

const TONE_CLASS: Record<NonNullable<WordmarkProps["tone"]>, { text: string; dot: string }> = {
  brand: { text: "text-ink", dot: "bg-accent" },
  inverse: { text: "text-white", dot: "bg-white" },
};

/**
 * Fokus wordmark: Inter 800, uppercase, ink letterforms with a single
 * accent-blue dot offset to the cap-height baseline.
 */
export default function Wordmark({
  size = "sm",
  noDot = false,
  className,
  tone = "brand",
}: WordmarkProps) {
  const s = SIZES[size];
  const t = TONE_CLASS[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center select-none",
        s.gap,
        t.text,
        className,
      )}
      aria-label="Fokus"
    >
      {!noDot ? (
        <span
          aria-hidden
          className={cn("inline-block rounded-full", s.dot, s.offset, t.dot)}
        />
      ) : null}
      <span>Fokus</span>
    </span>
  );
}
