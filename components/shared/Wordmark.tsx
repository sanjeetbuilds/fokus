import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "hero";

export interface WordmarkProps {
  size?: Size;
  /** Hide the small dot mark before the F. Default: shown. */
  noDot?: boolean;
  className?: string;
  /**
   * Override the colour. Defaults to the accent token (themeable). Useful
   * for headers on accent-bg surfaces where you want the wordmark in white.
   */
  tone?: "accent" | "ink" | "inverse";
}

const SIZES: Record<Size, { text: string; dot: string; gap: string; offset: string }> = {
  // sm: in nav rails / detail-screen headers
  sm: {
    text: "text-[18px] font-bold uppercase tracking-[-0.02em]",
    dot: "h-1.5 w-1.5",
    gap: "gap-1.5",
    offset: "translate-y-[-2px]",
  },
  // md: top of /today and other root screens
  md: {
    text: "text-[22px] font-bold uppercase tracking-[-0.02em]",
    dot: "h-2 w-2",
    gap: "gap-1.5",
    offset: "translate-y-[-3px]",
  },
  // hero: marketing-style placement (not currently used in production
  // screens but kept for parity with /dev/identity)
  hero: {
    text: "text-[64px] font-extrabold uppercase tracking-[-0.04em] leading-none",
    dot: "h-3 w-3",
    gap: "gap-3",
    offset: "translate-y-[-6px]",
  },
};

const TONE_CLASS: Record<NonNullable<WordmarkProps["tone"]>, { text: string; dot: string }> = {
  accent: { text: "text-accent", dot: "bg-accent" },
  ink: { text: "text-ink", dot: "bg-ink" },
  inverse: { text: "text-white", dot: "bg-white" },
};

/**
 * Fokus wordmark — bold uppercase letterforms with an optional dot mark
 * sitting just before the F. The dot is offset upward so it visually aligns
 * with the cap-height rather than centring on the baseline (looks heavier
 * without that nudge).
 */
export default function Wordmark({
  size = "sm",
  noDot = false,
  className,
  tone = "accent",
}: WordmarkProps) {
  const s = SIZES[size];
  const t = TONE_CLASS[tone];
  return (
    <span
      className={cn(
        "inline-flex items-baseline select-none",
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
