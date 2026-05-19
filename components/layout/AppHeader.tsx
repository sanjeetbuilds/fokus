"use client";

import { useRouter } from "next/navigation";

/**
 * Round-4 app header: "Fokus" wordmark on the left, 4-dot grid Menu
 * button on the right that routes to /profile/settings. Sits flush at
 * the top of every main tab.
 */
export default function AppHeader() {
  const router = useRouter();
  return (
    <header className="flex items-center justify-between px-6 pt-1">
      <span
        className="text-[18px] font-extrabold text-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
        Fokus
      </span>
      <button
        type="button"
        onClick={() => router.push("/profile/settings")}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-secondary transition-colors hover:text-ink"
        aria-label="Menu"
      >
        <span
          aria-hidden
          className="grid grid-cols-2 gap-[3px]"
          style={{ width: 11, height: 11 }}
        >
          <span className="block h-1 w-1 rounded-[2px] bg-ink-secondary" />
          <span className="block h-1 w-1 rounded-[2px] bg-ink-secondary" />
          <span className="block h-1 w-1 rounded-[2px] bg-ink-secondary" />
          <span className="block h-1 w-1 rounded-[2px] bg-ink-secondary" />
        </span>
        Menu
      </button>
    </header>
  );
}
