"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Round-4 renamed /map → /compass. This page now just bounces; the new
 * Compass surface lives at app/(main)/compass/page.tsx.
 */
export default function LegacyMapRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/compass");
  }, [router]);
  return null;
}
