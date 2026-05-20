"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import Wordmark from "@/components/shared/Wordmark";

const SWIPE_DISTANCE_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 240;

export interface IntroCarouselProps {
  slides: ReactNode[];
  onComplete: () => void;
  /** Label for the final advance; shown as aria-label on the arrow button. */
  finishLabel?: string;
  asMain?: boolean;
}

/**
 * Intro carousel chrome (round-2 identity).
 *
 *   - Wordmark anchors the top-left.
 *   - Progress dots sit just above the bottom action row.
 *   - Bottom row: Skip on the left, a single circular arrow on the right
 *     that advances or, on the final slide, calls onComplete.
 *
 * Each slide is rendered by the caller; content layout (illustration +
 * type) lives on the page that owns the carousel, not here.
 */
export function IntroCarousel({
  slides,
  onComplete,
  finishLabel = "Begin",
  asMain = true,
}: IntroCarouselProps) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const isLast = index === count - 1;

  const go = useCallback(
    (nextIndex: number, dir: 1 | -1) => {
      if (nextIndex < 0 || nextIndex >= count) return;
      setDirection(dir);
      setIndex(nextIndex);
    },
    [count],
  );

  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const prev = useCallback(() => go(index - 1, -1), [go, index]);

  const advance = useCallback(() => {
    if (isLast) onComplete();
    else next();
  }, [isLast, next, onComplete]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        advance();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, prev]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const distance = info.offset.x;
    const velocity = info.velocity.x;
    if (
      distance < -SWIPE_DISTANCE_THRESHOLD ||
      velocity < -SWIPE_VELOCITY_THRESHOLD
    ) {
      next();
    } else if (
      distance > SWIPE_DISTANCE_THRESHOLD ||
      velocity > SWIPE_VELOCITY_THRESHOLD
    ) {
      prev();
    }
  };

  const Wrapper = asMain ? "main" : "div";

  return (
    <Wrapper className="relative flex min-h-[100svh] flex-col bg-bg">
      {/* Top bar: wordmark only */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Wordmark size="sm" />
        <span aria-hidden className="h-9" />
      </div>

      {/* Slide */}
      <section
        className="relative flex flex-1 px-6 pt-8 pb-4 overflow-hidden"
        aria-roledescription="carousel"
        aria-label="Introduction"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={onDragEnd}
            initial={{ opacity: 0, x: direction * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 32 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[560px] mx-auto cursor-grab active:cursor-grabbing select-none"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${count}`}
          >
            {slides[index]}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Progress dots */}
      <ul
        className="-mx-1 flex items-center justify-center px-5 pb-3"
        aria-label="Progress"
      >
        {slides.map((_, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => go(i, i > index ? 1 : -1)}
              aria-label={`Go to slide ${i + 1} of ${count}`}
              aria-current={i === index ? "step" : undefined}
              className="flex h-11 w-7 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span
                aria-hidden
                className={`block h-2 rounded-full transition-all duration-200 ease-out ${
                  i === index ? "w-7 bg-accent" : "w-2 bg-ink-quaternary"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Bottom action row. On non-last slides: Skip on the left, a
          circular arrow on the right. On the last slide: a full-width
          primary CTA. */}
      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-2">
        {isLast ? (
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent text-[16px] font-extrabold text-white transition-transform duration-fast ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            style={{
              boxShadow: "0 6px 16px -4px rgba(42, 92, 65, 0.32)",
            }}
          >
            {finishLabel}
            <ArrowRight size={18} strokeWidth={2.25} aria-hidden />
          </button>
        ) : (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onComplete}
              className="rounded-md px-2 py-2 text-[15px] font-extrabold text-ink-tertiary transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={advance}
              aria-label="Next"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white transition-transform duration-fast ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              style={{
                boxShadow: "0 6px 16px -4px rgba(42, 92, 65, 0.32)",
              }}
            >
              <ArrowRight size={22} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
