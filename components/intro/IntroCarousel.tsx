"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import Button from "@/components/ui/Button";

const SWIPE_DISTANCE_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 240;

export interface IntroCarouselProps {
  /** One node per slide. Length determines slide count. */
  slides: ReactNode[];
  /** Called when the user taps "Begin" on the final slide or "Skip" earlier. */
  onComplete: () => void;
  /** Optional label for the final CTA. Defaults to "Begin". */
  finishLabel?: string;
  /**
   * Whether the carousel itself should be the page's main scroll/layout root.
   * When true (default) it renders as <main>; pass false to nest inside an
   * existing layout shell.
   */
  asMain?: boolean;
}

/**
 * Reusable intro carousel chrome — dots + skip + drag + arrow keys + final CTA.
 * Used by the production /intro page and the two /dev/intro-* variants so
 * they all share identical interaction behavior; only the slide *content*
 * differs.
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

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (isLast) onComplete();
        else next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key === "Enter" && isLast) {
        event.preventDefault();
        onComplete();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onComplete, isLast]);

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
      {/* Top bar: dots + skip */}
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <ul className="-mx-1 flex items-center" aria-label="Progress">
          {slides.map((_, i) => (
            <li key={i}>
              {/*
                Hit area is a full 44px (Apple HIG + WCAG target-size);
                the visible dot is the small span inside. Without this
                wrapping, Lighthouse flags pagination dots as undersized
                tap targets.
              */}
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
                    i === index ? "w-6 bg-accent" : "w-2 bg-line"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>

        {!isLast ? (
          <button
            type="button"
            onClick={onComplete}
            className="text-callout text-ink-tertiary transition-colors duration-fast ease-out hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-2 py-1"
          >
            Skip
          </button>
        ) : (
          <span aria-hidden className="px-2 py-1" />
        )}
      </div>

      {/* Slide */}
      <section
        className="relative flex flex-1 items-center justify-center px-6 py-8 overflow-hidden"
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
            className="w-full max-w-[560px] cursor-grab active:cursor-grabbing select-none"
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${count}`}
          >
            {slides[index]}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Bottom CTA on final slide */}
      <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-4">
        {isLast ? (
          <Button onClick={onComplete} fullWidth size="lg">
            {finishLabel}
          </Button>
        ) : (
          <div className="h-14" aria-hidden />
        )}
      </div>
    </Wrapper>
  );
}
