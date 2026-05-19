"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Round-4 merges parent + child onboarding into a single setup form at
 * /intro. The legacy /onboarding/parent route now just bounces there so
 * any bookmarked link still arrives at the right place.
 */
export default function LegacyParentOnboarding() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/intro");
  }, [router]);
  return null;
}
