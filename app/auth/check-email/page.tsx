"use client";

import { IconCheck, IconMail } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type CSSProperties, Suspense } from "react";

const INK = "#252630";
const ACCENT = "#9CA5FF";
const MUTED = "#8E8D9B";
const TERTIARY = "#C2C0CB";
const GREEN_BG = "#E8F9EE";
const GREEN_FG = "#207838";

/**
 * "Check your inbox" surface. Pixel-precise per the approved mockup.
 */
export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailBody />
    </Suspense>
  );
}

function CheckEmailBody() {
  const router = useRouter();
  const params = useSearchParams();
  const email = (params?.get("email") ?? "").trim();

  return (
    <main style={SHELL_STYLE}>
      <div style={CONTAINER_STYLE}>
        <Wordmark />
        <div style={{ flex: 1 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          {/* Icon zone */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 0 16px",
              position: "relative",
              height: 80,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(93,200,122,0.12)",
              }}
            />
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 2,
                background: GREEN_BG,
                flexShrink: 0,
                color: GREEN_FG,
              }}
            >
              <IconMail size={26} stroke={2} aria-hidden />
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: GREEN_BG,
              color: GREEN_FG,
              fontSize: 11,
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 999,
              marginBottom: 14,
            }}
          >
            <IconCheck size={11} stroke={2.5} aria-hidden />
            Link sent
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.025em",
            }}
          >
            Check your inbox.
          </div>

          <div
            style={{
              fontSize: 14,
              color: MUTED,
              marginTop: 8,
              lineHeight: 1.55,
              maxWidth: 260,
            }}
          >
            Tap the link we sent to{" "}
            <span style={{ fontWeight: 700, color: INK }}>
              {email || "your inbox"}
            </span>
            . Open it on this device.
          </div>

          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            style={{
              marginTop: 18,
              fontSize: 13,
              fontWeight: 600,
              color: INK,
              paddingBottom: 2,
              background: "none",
              border: "none",
              borderBottom: `1.5px solid ${INK}`,
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            className="hover:opacity-80 transition-opacity"
          >
            Use a different email
          </button>
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            fontSize: 11,
            color: TERTIARY,
            textAlign: "center",
            lineHeight: 1.5,
            flexShrink: 0,
          }}
        >
          Didn&apos;t get it? Check spam or try again in 60 seconds.
        </div>
      </div>
    </main>
  );
}

// ============================================================
// Local shared chrome
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
