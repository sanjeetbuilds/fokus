"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: SheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 cursor-default bg-bg-overlay"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "absolute inset-x-0 bottom-0 mx-auto max-h-[85vh] w-full max-w-[540px]",
              "flex flex-col overflow-hidden rounded-t-xl bg-bg-elevated shadow-lg",
              "pb-[env(safe-area-inset-bottom)]",
              className,
            )}
          >
            <div className="flex shrink-0 justify-center pt-2 pb-3">
              <span
                aria-hidden
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: "#E5E3DA",
                }}
              />
            </div>
            {title ? (
              <div className="shrink-0 border-b border-line-subtle px-5 pb-3">
                <h2 className="text-title-3 text-ink">{title}</h2>
              </div>
            ) : null}
            <div className="grow overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
