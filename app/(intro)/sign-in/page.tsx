"use client";

import { useEffect, useState, type FormEvent } from "react";

import Wordmark from "@/components/shared/Wordmark";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Sign-in via Supabase magic link. Single email field; Supabase emails
 * a one-time link, the link routes back to /auth/callback, the callback
 * exchanges the code for a session, and the user lands on /.
 *
 * If a sessionStorage flag from the just-deleted account flow is
 * present, a brief "Account deleted." flash is shown above the form
 * for ~3 seconds, then it self-dismisses.
 */
export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletedFlash, setDeletedFlash] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem("account_deleted_flash") === "true") {
        window.sessionStorage.removeItem("account_deleted_flash");
        setDeletedFlash(true);
        const t = window.setTimeout(() => setDeletedFlash(false), 3000);
        return () => window.clearTimeout(t);
      }
    } catch {
      /* private browsing — flash just won't fire */
    }
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || state === "sending") return;

    setState("sending");
    setErrorMessage(null);

    try {
      const supabase = getSupabaseBrowser();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        setErrorMessage(error.message);
        setState("error");
        return;
      }
      setState("sent");
    } catch (err) {
      console.error("[/sign-in] signInWithOtp:", err);
      setErrorMessage("Couldn't send the link. Try again in a moment.");
      setState("error");
    }
  };

  return (
    <main className="relative flex min-h-[100svh] flex-col bg-bg">
      <header className="flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Wordmark size="sm" />
        <span aria-hidden className="h-9 w-9" />
      </header>

      <div className="flex flex-1 flex-col px-6 pt-[60px]">
        {deletedFlash ? (
          <div
            aria-live="polite"
            className="mb-6 rounded-[10px] px-4 py-3"
            style={{
              background: "#F7F7F5",
              border: "1px solid #E5E3DA",
              fontSize: 14,
              color: "#1A1A1A",
              lineHeight: 1.45,
            }}
          >
            Account deleted.
          </div>
        ) : null}
        <h1
          className="text-ink"
          style={{
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          Sign in.
        </h1>
        <p
          className="mt-2"
          style={{ fontSize: 16, lineHeight: 1.5, color: "#6B6B6B" }}
        >
          We&apos;ll email you a one-time link.
        </p>

        {state === "sent" ? (
          <div className="mt-10">
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1A1A1A",
                lineHeight: 1.4,
              }}
            >
              Check your email.
            </p>
            <p
              className="mt-2"
              style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.5 }}
            >
              We sent a link to {email.trim()}. Open it on this device to
              finish signing in.
            </p>
            <button
              type="button"
              onClick={() => {
                setState("idle");
                setErrorMessage(null);
              }}
              className="mt-6 text-[14px] underline"
              style={{ color: "#6B5B95" }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form className="mt-10 flex flex-col gap-6" onSubmit={onSubmit}>
            <div>
              <p
                className="mb-2"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#8A8A8A",
                }}
              >
                Email
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                className="h-[50px] w-full rounded-[6px] border bg-bg-elevated px-4 text-[18px] text-ink"
                style={{ borderColor: "#E5E3DA", borderWidth: 1 }}
              />
              {errorMessage ? (
                <p
                  className="mt-2"
                  style={{
                    fontSize: 13,
                    color: "#B85738",
                    lineHeight: 1.45,
                  }}
                >
                  {errorMessage}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={state === "sending" || email.trim().length === 0}
              className="h-[56px] w-full rounded-[6px] text-[16px] font-bold text-white transition-opacity disabled:opacity-50"
              style={{ background: "#1A1A1A" }}
            >
              {state === "sending" ? "Sending…" : "Send link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
