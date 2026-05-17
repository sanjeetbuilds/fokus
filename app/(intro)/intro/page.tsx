"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { IntroCarousel } from "@/components/intro/IntroCarousel";
import { INTRO_SCREENS } from "@/lib/content/intro";

/**
 * Baseline intro carousel — plain typography, no illustrations. Compared
 * against two alternates in /dev/intro-compare.
 */
export default function IntroCarouselPage() {
  const router = useRouter();
  const finish = useCallback(() => {
    router.push("/onboarding/parent");
  }, [router]);

  const slides = INTRO_SCREENS.map((screen) => (
    <article
      key={screen.id}
      className="text-center"
      aria-label={`Slide ${screen.id}`}
    >
      <p className="text-body-large text-ink">{screen.body}</p>
    </article>
  ));

  return <IntroCarousel slides={slides} onComplete={finish} />;
}
