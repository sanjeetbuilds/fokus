"use client";

/**
 * App header: "Fokus" wordmark on the left, clean right edge. Sits
 * flush at the top of every main tab. The Menu button (which routed
 * to the deleted /profile/settings) is gone — there are only the
 * four tabs in the bottom nav.
 */
export default function AppHeader() {
  return (
    <header className="flex items-center justify-between px-6 pt-1">
      <span
        className="text-[18px] font-extrabold text-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
        Fokus
      </span>
    </header>
  );
}
