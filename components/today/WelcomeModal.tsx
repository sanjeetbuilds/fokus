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
        // Read current prefs and merge so we don't clobber reminderTime
        // or darkMode that may have been set in the same session.
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
            <p
              className="text-center"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#3A2A1A",
              }}
            >
              Welcome to Fokus
            </p>

            <h2
              id="welcome-title"
              className="mt-4 text-center font-display"
              style={{
                fontSize: 24,
                fontWeight: 500,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                color: "#2A1F14",
              }}
            >
              Here&apos;s how this works.
            </h2>

            <div
              className="mt-6 flex flex-col gap-3 text-center"
              style={{ color: "#2A1F14" }}
            >
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                Each day, one small moment with {childName}. Five to twenty
                minutes.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                You do it. You log how it went. Fokus learns and adjusts
                tomorrow.
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                No streaks. No scores. No pressure. That&apos;s the whole
                app.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void dismiss()}
              className="mt-7 inline-flex h-[50px] w-full items-center justify-center rounded-[8px] text-white"
              style={{
                background: "#2A1F14",
                fontSize: 15,
                fontWeight: 600,
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
