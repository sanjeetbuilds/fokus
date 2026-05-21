"use client";

/**
 * App header: "Fokus" wordmark on the left, clean right edge. Sits
 * flush at the top of every main tab. The bottom tab bar (Today,
 * Library, Track, Profile) is the only navigation surface.
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
