"use client";

import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { getSupabaseBrowser } from "@/lib/supabase/client";

const INK = "#252630";
const ACCENT = "#9CA5FF";
const MUTED = "#8E8D9B";
const TERTIARY = "#C2C0CB";
const TINT_FILL = "#F7F7F5";
const INPUT_BORDER = "#EEEEED";

/**
 * Email entry. Pixel-precise per the approved mockup.
 */
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [deletedFlash, setDeletedFlash] = useState(false);
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
  const valid = isValidEmail(trimmed);
  const canSubmit = valid && state !== "sending";

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
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
  };

  return (
    <main style={SHELL_STYLE}>
      <form onSubmit={onSubmit} style={CONTAINER_STYLE}>
        <Wordmark />

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

        <div style={{ marginTop: 32, flexShrink: 0 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.025em",
              lineHeight: 1.12,
            }}
          >
            What&apos;s your
            <br />
            email?
          </div>
          <div
            style={{
              fontSize: 14,
              color: MUTED,
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            We&apos;ll send a link to sign you in.
            <br />
            No password needed.
          </div>
        </div>

        <div style={{ marginTop: 24, flexShrink: 0 }}>
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
              border: `1.5px solid ${focused ? ACCENT : INPUT_BORDER}`,
              borderRadius: 14,
              padding: 16,
              // 16px minimum so iOS Safari doesn't auto-zoom the viewport.
              fontSize: 16,
              fontWeight: 400,
              color: INK,
              outline: "none",
              transition:
                "border-color 150ms ease, background 150ms ease",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          />
          {errorMessage ? (
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                fontWeight: 400,
                color: "#B85738",
                lineHeight: 1.4,
              }}
            >
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div style={{ flex: 1 }} />

        <PrimaryButton
          label={state === "sending" ? "Sending…" : "Send my link"}
          disabled={!canSubmit}
        />

        <div
          style={{
            fontSize: 11,
            color: TERTIARY,
            textAlign: "center",
            marginTop: 10,
            lineHeight: 1.4,
            flexShrink: 0,
          }}
        >
          Your child&apos;s data stays private.
          <br />
          Only you can see it.
        </div>
      </form>
    </main>
  );
}

// ============================================================
// Local shared chrome (kept in this file so each screen owns its
// exact mockup-matching surface; no shared global to drift from)
// ============================================================

const SHELL_STYLE: CSSProperties = {
  position: "relative",
  minHeight: "100dvh",
  background: "#FFFFFF",
  color: INK,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  overflow: "hidden",
};

const CONTAINER_STYLE: CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: "max(48px, env(safe-area-inset-top))",
  paddingBottom: "max(24px, env(safe-area-inset-bottom))",
  background: "#FFFFFF",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  overflow: "hidden",
};

function Wordmark() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontSize: 15,
        fontWeight: 800,
        color: INK,
        letterSpacing: "-0.035em",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      fokus
      <span
        aria-hidden
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: ACCENT,
          marginLeft: 1.5,
          transform: "translateY(-1px)",
          display: "inline-block",
        }}
      />
    </div>
  );
}

function PrimaryButton({
  label,
  disabled,
}: {
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        background: INK,
        opacity: disabled ? 0.35 : 1,
        borderRadius: 999,
        padding: 15,
        textAlign: "center",
        fontSize: 14,
        fontWeight: 700,
        color: "#FFFFFF",
        flexShrink: 0,
        letterSpacing: "-0.01em",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      className="transition-opacity active:opacity-90"
    >
      {label}
    </button>
  );
}

// Simple email shape check; Supabase still validates server-side.
function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
