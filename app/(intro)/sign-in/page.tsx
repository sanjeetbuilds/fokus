"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import Wordmark from "@/components/shared/Wordmark";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const INK = "#252630";
const ACCENT = "#9CA5FF";
const MUTED = "#8E8D9B";
const TERTIARY = "#C2C0CB";
const TINT_FILL = "#F7F7F5";

/**
 * Email entry. Per the approved mockup:
 *
 * - Container padding 50/20/20, white bg.
 * - Brand bar with 24px bottom margin.
 * - Content top-aligned (NOT centred): 20px gap to headline.
 * - Headline 22/800/-0.025em/1.15.
 * - Subtext 11/400/#8E8D9B/1.55, 10px gap.
 * - Input wrap 18px below the subtext. Input #F7F7F5 fill, 12/14
 *   padding, 12px text, focus border #9CA5FF + white bg.
 * - flex:1 spacer pushes the button to the bottom.
 * - Button 10px padding, 11/700/white on #252630, disabled opacity
 *   0.35 (NOT a gray bg).
 * - Footer 9px/#C2C0CB/1.4, 10px gap below button.
 *
 * On submit, navigates to /auth/check-email?email=... so the
 * "link sent" surface is its own dedicated screen.
 */
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletedFlash, setDeletedFlash] = useState(false);
  const [focused, setFocused] = useState(false);

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

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100svh",
        background: "#FFFFFF",
        color: INK,
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100svh",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 50px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {/* Brand bar */}
        <div style={{ marginBottom: 24 }}>
          <Wordmark size="sm" />
        </div>

        {deletedFlash ? (
          <div
            aria-live="polite"
            style={{
              marginBottom: 16,
              background: TINT_FILL,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 12,
              color: INK,
              lineHeight: 1.45,
            }}
          >
            Account deleted.
          </div>
        ) : null}

        {/* Content, top-aligned */}
        <div style={{ marginTop: 20 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            What&apos;s your email?
          </h1>
          <p
            style={{
              marginTop: 10,
              fontSize: 11,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.55,
            }}
          >
            We&apos;ll send a quick link to sign you in. No password to
            remember.
          </p>
        </div>

        {/* Input wrap */}
        <div style={{ marginTop: 18 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            style={{
              width: "100%",
              background: focused ? "#FFFFFF" : TINT_FILL,
              border: `1px solid ${focused ? ACCENT : "transparent"}`,
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 12,
              fontWeight: 500,
              color: INK,
              outline: "none",
              transition:
                "background 150ms ease, border-color 150ms ease",
              fontFamily:
                "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
            }}
          />
          {errorMessage ? (
            <p
              style={{
                marginTop: 8,
                fontSize: 11,
                fontWeight: 400,
                color: "#B85738",
                lineHeight: 1.45,
              }}
            >
              {errorMessage}
            </p>
          ) : null}
        </div>

        {/* Spacer pushes the button to the bottom */}
        <span aria-hidden style={{ flex: 1, minHeight: 16 }} />

        {/* Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            width: "100%",
            background: INK,
            color: "#FFFFFF",
            borderRadius: 999,
            padding: 10,
            fontSize: 11,
            fontWeight: 700,
            textAlign: "center",
            border: "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.35,
            transition: "opacity 150ms ease",
            fontFamily:
              "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
          }}
          className="active:opacity-90"
        >
          {state === "sending" ? "Sending…" : "Send my link"}
        </button>

        {/* Footer */}
        <p
          style={{
            marginTop: 10,
            fontSize: 9,
            fontWeight: 400,
            color: TERTIARY,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Your child&apos;s data stays private. Only you can see it.
        </p>
      </form>
    </main>
  );
}
