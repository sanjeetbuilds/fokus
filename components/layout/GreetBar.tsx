"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import Avatar from "@/components/ui/Avatar";
import { getCurrentParent } from "@/lib/db";

/**
 * Top-of-screen greet bar from the design's `.greet` pattern:
 *   [avatar] Welcome back,
 *           {Parent name}                              [bell]
 *
 * Parent name loads from IndexedDB on mount. Bell is a placeholder for
 * future notifications.
 */
export default function GreetBar() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const p = await getCurrentParent();
        if (!cancelled) setName(p?.name ?? null);
      } catch (err) {
        console.error("[GreetBar] load parent:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center justify-between pt-1">
      <div className="flex items-center gap-2.5">
        <Avatar name={name ?? "Y"} size="md" className="h-10 w-10 text-callout" />
        <div>
          <p className="text-[12px] text-ink-tertiary leading-tight">
            Welcome back,
          </p>
          <p className="text-[17px] font-extrabold leading-tight text-accent-mid">
            {name ?? "there"}
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-label="Notifications"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast ease-out hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Bell size={20} strokeWidth={1.8} aria-hidden />
      </button>
    </div>
  );
}
