"use client";

import { RefreshCcw } from "lucide-react";
import { useEffect } from "react";

import Button from "@/components/ui/Button";

/**
 * Error boundary for everything under (main). Renders when any descendant
 * page throws during render or in an event handler that bubbles up.
 *
 * Per Next 15: the file must be a client component, and receives `error` +
 * a `reset` callback. We log the error so debugging stays possible from
 * the console, and offer two recovery paths: in-place reset (re-render the
 * crashed segment) and full page reload (rebuilds the React tree from
 * scratch, also flushes any bad state in zustand/localStorage that survived
 * reset).
 */
export default function MainSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[(main) error boundary]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[480px] flex-col items-center justify-center px-6 text-center">
      <p className="text-footnote uppercase tracking-[0.08em] text-ink-tertiary">
        Something went wrong
      </p>
      <h1 className="mt-2 text-title-1 text-ink">
        Something didn&apos;t work.
      </h1>
      <p className="mt-3 text-body text-ink-secondary">
        Try refreshing. If it keeps happening, your data is safe — sessions
        are stored on your device.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3">
        <Button
          onClick={() => reset()}
          fullWidth
          size="lg"
          leftIcon={<RefreshCcw size={16} strokeWidth={1.75} aria-hidden />}
        >
          Try again
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
          fullWidth
          size="md"
        >
          Reload the page
        </Button>
      </div>

      {error.digest ? (
        <p className="mt-6 font-mono text-caption text-ink-quaternary">
          ref: {error.digest}
        </p>
      ) : null}
    </main>
  );
}
