"use client";

import { IconCheck, IconMail } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import Wordmark from "@/components/shared/Wordmark";

const INK = "#252630";
const MUTED = "#8E8D9B";
const TERTIARY = "#C2C0CB";
const GREEN_BG = "#E8F9EE";
const GREEN_FG = "#207838";

/**
 * "Check your inbox" surface. Layout shape matches the welcome flow:
 * header / content block (margin-top 48) / spacer / bottom footer.
 *
 * Icon: 80x80 wrapper, 80x80 same-size blob at rgba(green,0.15),
 * 56x56 solid #E8F9EE circle on top with a 24px IconMail in #207838.
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
      <div
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

        {/* Content block, anchored 48 below header, centred horizontally */}
        <div
          style={{
            marginTop: 48,
            flex: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Icon zone: 80 wrapper, 80 same-size blob, 56 solid circle */}
          <div
            style={{
              position: "relative",
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(93,200,122,0.15)",
                zIndex: 0,
              }}
            />
            <span
              aria-hidden
              style={{
                position: "relative",
                zIndex: 1,
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: GREEN_BG,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: GREEN_FG,
              }}
            >
              <IconMail size={24} stroke={2} aria-hidden />
            </span>
          </div>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: GREEN_BG,
              color: GREEN_FG,
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 11px",
              borderRadius: 999,
              marginBottom: 12,
            }}
          >
            <IconCheck size={11} stroke={2.5} aria-hidden />
            Link sent
          </span>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: INK,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            Check your inbox.
          </h1>
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.55,
              maxWidth: 280,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Tap the link we just sent to{" "}
            <span style={{ color: INK, fontWeight: 700 }}>
              {email || "your inbox"}
            </span>
            . It works on this device.
          </p>

          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            style={{
              marginTop: 16,
              display: "inline-flex",
              background: "transparent",
              color: INK,
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
              paddingBottom: 1,
              border: "none",
              borderBottom: `1px solid ${INK}`,
              cursor: "pointer",
              fontFamily:
                "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
            }}
            className="hover:opacity-80 transition-opacity"
          >
            Use a different email
          </button>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: 24 }} />

        {/* Bottom footer */}
        <p
          style={{
            flex: 0,
            fontSize: 12,
            fontWeight: 400,
            color: TERTIARY,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Didn&apos;t get it? Check spam or try again in 60 seconds.
        </p>
      </div>
    </main>
  );
}
