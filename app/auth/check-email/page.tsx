"use client";

import { IconCheck, IconMail } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import Wordmark from "@/components/shared/Wordmark";

/**
 * "Check your inbox" surface; reached after the magic-link OTP is
 * dispatched from /sign-in. Shows a calm confirmation with the
 * destination email and a way back to retry with a different one.
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
  const emailParam = params?.get("email") ?? "";
  const email = emailParam.trim();

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

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Icon zone */}
          <div
            style={{
              position: "relative",
              width: 130,
              height: 130,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
                zIndex: 0,
              }}
            />
            <span
              aria-hidden
              style={{
                position: "relative",
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "#E8F9EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#207838",
                zIndex: 2,
              }}
            >
              <IconMail size={24} stroke={2} aria-hidden />
            </span>
          </div>

          <span
            style={{
              marginTop: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "#E8F9EE",
              color: "#207838",
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 11px",
              borderRadius: 999,
            }}
          >
            <IconCheck size={11} stroke={2.5} aria-hidden />
            Link sent
          </span>

          <h1
            style={{
              marginTop: 14,
              fontSize: 22,
              fontWeight: 800,
              color: "#252630",
              letterSpacing: "-0.025em",
              textAlign: "center",
            }}
          >
            Check your inbox.
          </h1>
          <p
            style={{
              marginTop: 10,
              fontSize: 13,
              fontWeight: 400,
              color: "#8E8D9B",
              lineHeight: 1.55,
              textAlign: "center",
              maxWidth: 240,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Tap the link in the email we just sent to{" "}
            <span style={{ color: "#252630", fontWeight: 600 }}>
              {email || "your inbox"}
            </span>
            . It works on this device.
          </p>

          <button
            type="button"
            onClick={() => router.push("/sign-in")}
            style={{
              marginTop: 16,
              background: "transparent",
              color: "#252630",
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: 8,
              border: "none",
              borderBottom: "1px solid #E5E3DA",
              cursor: "pointer",
            }}
            className="hover:bg-[#F7F7F5] transition-colors"
          >
            Use a different email
          </button>
        </div>

        <p
          style={{
            fontSize: 10,
            fontWeight: 400,
            color: "#C2C0CB",
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
