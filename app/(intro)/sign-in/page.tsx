"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Wordmark from "@/components/shared/Wordmark";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const INK = "#252630";
const ACCENT = "#9CA5FF";
const MUTED = "#8E8D9B";
const TERTIARY = "#C2C0CB";
const TINT_FILL = "#F7F7F5";

/**
 * Email entry. Single-form magic-link sign-in.
 *
 * Layout shape matches the welcome flow:
 *   header  -> margin-top 48 content (headline + subhead + input + hint)
 *   flex:1 spacer
 *   bottom actions (button + privacy line)
 *
 * min-height: 100dvh so the bottom block tracks the iOS keyboard,
 * input font-size 16 so the keyboard doesn't auto-zoom, focus
 * scrolls the input into view so it never sits under the keyboard.
 */
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletedFlash, setDeletedFlash] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem("account_deleted_flash") === "true") {
        window.sessionStorage.removeItem("account_deleted_flash");
        setDeletedFlash(true);
        const t = window.setTimeout(() => setDeletedFlash(false), 3000);
        return () => window.clearTimeout(t);
      }
    } catch {
      /* private browsing; flash just won't fire */
    }
  }, []);

  const trimmed = email.trim();
  const canSubmit = trimmed.length > 0 && state !== "sending";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
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
      router.push(`/auth/check-email?email=${encodeURIComponent(trimmed)}`);
    } catch (err) {
      console.error("[/sign-in] signInWithOtp:", err);
      setErrorMessage("Couldn't send the link. Try again in a moment.");
      setState("error");
    }
  };

  const onInputFocus = () => {
    setFocused(true);
    // Wait a tick for the keyboard to push the layout up, then make
    // sure the input lands in the visible band rather than under the
    // keyboard's frame.
    setTimeout(() => {
      inputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 250);
  };

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "#FFFFFF",
        color: INK,
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop:
            "max(48px, calc(env(safe-area-inset-top, 0px) + 24px))",
          paddingBottom:
            "max(32px, calc(env(safe-area-inset-bottom, 0px) + 16px))",
        }}
      >
        {/* Header */}
        <Wordmark size="sm" />

        {deletedFlash ? (
          <div
            aria-live="polite"
            style={{
              marginTop: 16,
              background: TINT_FILL,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              color: INK,
              lineHeight: 1.45,
            }}
          >
            Account deleted.
          </div>
        ) : null}

        {/* Content block anchored 48px below header */}
        <div style={{ marginTop: 48, flex: 0 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            What&apos;s your email?
          </h1>
          <p
            style={{
              marginBottom: 32,
              fontSize: 15,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.5,
            }}
          >
            We&apos;ll send a quick link to sign you in. No password to
            remember.
          </p>

          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={onInputFocus}
            onBlur={() => setFocused(false)}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            style={{
              width: "100%",
              background: focused ? "#FFFFFF" : TINT_FILL,
              border: `1.5px solid ${focused ? ACCENT : "transparent"}`,
              borderRadius: 16,
              padding: "18px 16px",
              fontSize: 16,
              fontWeight: 500,
              color: INK,
              outline: "none",
              transition:
                "background 150ms ease, border-color 150ms ease",
              fontFamily:
                "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
            }}
          />
          <p
            style={{
              marginTop: 8,
              fontSize: 13,
              fontWeight: 400,
              color: errorMessage ? "#B85738" : TERTIARY,
              lineHeight: 1.4,
            }}
          >
            {errorMessage ?? "We'll send a link to your inbox."}
          </p>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: 24 }} />

        {/* Bottom actions */}
        <div style={{ flex: 0 }}>
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%",
              background: INK,
              color: "#FFFFFF",
              borderRadius: 999,
              padding: 16,
              fontSize: 15,
              fontWeight: 700,
              textAlign: "center",
              border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.3,
              transition: "opacity 150ms ease",
              fontFamily:
                "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
            }}
            className="active:opacity-90"
          >
            {state === "sending" ? "Sending…" : "Send my link"}
          </button>
          <p
            style={{
              marginTop: 12,
              fontSize: 12,
              fontWeight: 400,
              color: TERTIARY,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            Your child&apos;s data stays private. Only you can see it.
          </p>
        </div>
      </form>
    </main>
  );
}
