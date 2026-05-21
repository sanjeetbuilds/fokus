"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { getParent, updateParent } from "@/lib/db";

const FLAG_KEY = "show_welcome_modal";

/**
 * One-time welcome modal shown on the very first /today open after
 * onboarding. Sunset gradient, three short paragraphs framing the app,
 * a single dark CTA that commits the parent to taking action. No close
 * affordance on purpose — the CTA is the only way out.
 *
 * The modal fires when sessionStorage flag `show_welcome_modal === "true"`
 * is present; on dismiss we both clear the flag and persist
 * parent.preferences.hasSeenWelcomeModal so subsequent sessions never see
 * it again.
 */
export interface WelcomeModalProps {
  childName: string;
  parentId: string | null;
  /** Already-seen flag from the DB; suppresses the modal even if the
   *  sessionStorage flag is somehow stale. */
  alreadySeen: boolean;
}

export default function WelcomeModal({
  childName,
  parentId,
  alreadySeen,
}: WelcomeModalProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (alreadySeen) return;
    if (typeof window === "undefined") return;
    let want = false;
    try {
      want = window.sessionStorage.getItem(FLAG_KEY) === "true";
    } catch {
      /* private browsing — modal just won't fire */
    }
    if (want) setOpen(true);
  }, [alreadySeen]);

  const dismiss = async () => {
    setOpen(false);
    try {
      window.sessionStorage.removeItem(FLAG_KEY);
    } catch {
      /* ignore */
    }
    if (parentId) {
      try {
        // Read current prefs and merge so we don't clobber any other flag
        // set in the same session.
        const current = await getParent(parentId);
        await updateParent(parentId, {
          preferences: {
            ...(current?.preferences ?? { onboarded: true }),
            onboarded: true,
            hasSeenWelcomeModal: true,
          },
        });
      } catch (err) {
        console.error("[WelcomeModal] persist seen:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="welcome-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: "rgba(0,0,0,0.4)" }}
          aria-hidden
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
            style={{
              maxWidth: 380,
              borderRadius: 20,
              padding: "32px 24px",
              background:
                "linear-gradient(180deg, #FFE8D6 0%, #FFB99A 60%, #F8A5B5 100%)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            }}
          >
            {/* Eyebrow (smallest) */}
            <p
              className="text-center"
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#3A2418",
              }}
            >
              Welcome to Fokus
            </p>

            {/* Title (medium) */}
            <h2
              id="welcome-title"
              className="mt-3 text-center"
              style={{
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.005em",
                color: "#3A2418",
              }}
            >
              Here&apos;s how this works.
            </h2>

            {/* Hero line (LARGEST — the thesis of the app) */}
            <p
              className="mt-7 text-center"
              style={{
                fontSize: 26,
                fontWeight: 400,
                lineHeight: 1.3,
                letterSpacing: "-0.015em",
                color: "#2A1F14",
              }}
            >
              One small moment a day with {childName}.
            </p>

            {/* Supporting paragraph block (smaller, denser) */}
            <div
              className="mt-6 flex flex-col gap-2 text-center"
              style={{ color: "#2A1F14" }}
            >
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>
                You do it. You log it. Fokus adjusts tomorrow.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>
                No streaks. No scores. No pressure.
              </p>
            </div>

            {/* Primary CTA — clear action */}
            <button
              type="button"
              onClick={() => void dismiss()}
              className="mt-8 inline-flex h-[50px] w-full items-center justify-center rounded-[8px] text-white"
              style={{
                background: "#2A1F14",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "-0.005em",
              }}
            >
              Show me today&apos;s moment
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
