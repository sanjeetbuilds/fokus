"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The per-skill drill-down was retired during the round-4 rewrite and
 * the round-5 Track surface doesn't reintroduce it. Old bookmarks land
 * back on Track rather than a 404.
 */
export default function LegacySkillRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/map");
  }, [router]);
  return null;
}
