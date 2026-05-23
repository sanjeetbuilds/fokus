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
 * "Check your inbox" surface. Per the approved mockup:
 *
 * - Container padding 50/20/20, white bg.
 * - Brand bar with 24px bottom margin.
 * - flex:1 spacer.
 * - Centred icon zone (120 height): 80 rgba(green,0.2) blob behind a
 *   60 solid #E8F9EE circle holding a 24px green IconMail.
 * - "Link sent" pill (10/600 #207838 on #E8F9EE) with a 10px check.
 * - 20/800 headline "Check your inbox."
 * - 11/400/#8E8D9B subtext with the email bolded in #252630.
 * - "Use a different email" underlined helper, 11/600/#252630.
 * - flex:1 spacer.
 * - Footer 10/#C2C0CB/1.5 "Didn't get it…" line.
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
        minHeight: "100svh",
        background: "#FFFFFF",
        color: INK,
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
        <div style={{ marginBottom: 24 }}>
          <Wordmark size="sm" />
        </div>

        <span aria-hidden style={{ flex: 1, minHeight: 0 }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Icon zone */}
          <div
            style={{
              position: "relative",
              height: 120,
              width: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(93,200,122,0.20)",
                zIndex: 1,
              }}
            />
            <span
              aria-hidden
              style={{
                position: "relative",
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: GREEN_BG,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: GREEN_FG,
                zIndex: 2,
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
              fontSize: 10,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 999,
              marginBottom: 10,
            }}
          >
            <IconCheck size={10} stroke={2.5} aria-hidden />
            Link sent
          </span>

          <h1
            style={{
              fontSize: 20,
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
              marginTop: 10,
              fontSize: 11,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.55,
              maxWidth: 210,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Tap the link in the email we just sent to{" "}
            <span style={{ color: INK, fontWeight: 700 }}>
              {email || "your inbox"}
            </span>
            . It works on this device.
          </p>

          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignSelf: "center",
              background: "transparent",
              color: INK,
              fontSize: 11,
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

        <span aria-hidden style={{ flex: 1, minHeight: 0 }} />

        <p
          style={{
            fontSize: 10,
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
