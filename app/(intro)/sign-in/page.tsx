"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import Wordmark from "@/components/shared/Wordmark";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Sign-in: single email field. Submits to Supabase magic-link OTP,
 * then navigates to /auth/check-email?email=... on success so the
 * "we sent you a link" surface is its own dedicated screen.
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
        color: "#252630",
        fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
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
        <Wordmark size="sm" />

        {deletedFlash ? (
          <div
            aria-live="polite"
            style={{
              marginTop: 16,
              background: "#FBFAF7",
              border: "1px solid #E5E3DA",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 14,
              color: "#252630",
              lineHeight: 1.45,
            }}
          >
            Account deleted.
          </div>
        ) : null}

        <h1
          style={{
            marginTop: 24,
            fontSize: 24,
            fontWeight: 800,
            color: "#252630",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
          }}
        >
          What&apos;s your email?
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 13,
            fontWeight: 400,
            color: "#8E8D9B",
            lineHeight: 1.55,
          }}
        >
          We&apos;ll send a quick link to sign you in. No password to remember.
        </p>

        <form
          onSubmit={onSubmit}
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
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
              background: focused ? "#FFFFFF" : "#F7F7F5",
              border: `1px solid ${focused ? "#9CA5FF" : "transparent"}`,
              borderRadius: 14,
              padding: "14px 16px",
              fontSize: 16,
              fontWeight: 500,
              color: "#252630",
              outline: "none",
              transition: "background 150ms ease-out, border-color 150ms ease-out",
              width: "100%",
            }}
          />
          {errorMessage ? (
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#B85738",
                lineHeight: 1.45,
              }}
            >
              {errorMessage}
            </p>
          ) : null}

          <span aria-hidden style={{ flex: 1, minHeight: 24 }} />

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: "100%",
              background: "#252630",
              color: "#FFFFFF",
              borderRadius: 999,
              padding: 12,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              opacity: canSubmit ? 1 : 0.4,
              transition: "opacity 150ms ease-out",
            }}
            className="active:opacity-90"
          >
            {state === "sending" ? "Sending…" : "Send my link"}
          </button>
          <p
            style={{
              marginTop: 10,
              fontSize: 10,
              fontWeight: 400,
              color: "#C2C0CB",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            Your child&apos;s data stays private.
            <br />
            Only you can see it.
          </p>
        </form>
      </div>
    </main>
  );
}
