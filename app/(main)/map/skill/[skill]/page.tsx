"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Round-4 collapses the 8-skill drill-down — the new Compass surface
 * shows 4 traits instead. This legacy path redirects to /compass.
 */
export default function LegacySkillRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/compass");
  }, [router]);
  return null;
}
