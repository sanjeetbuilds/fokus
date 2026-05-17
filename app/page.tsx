/**
 * Root route. The OnboardingGate (mounted in app/layout.tsx) handles the
 * actual redirect for "/", either to /intro (no parent), /onboarding/child
 * (parent but no kids), or /today (fully onboarded). This page just renders
 * a calm loading state during the half-tick between hydration and redirect.
 */
export default function RootPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center px-5">
      <p className="text-footnote text-ink-tertiary">Loading…</p>
    </main>
  );
}
