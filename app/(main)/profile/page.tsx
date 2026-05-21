"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

import AppHeader from "@/components/layout/AppHeader";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { db } from "@/lib/db";
import { downloadExport } from "@/lib/export-data";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";
import {
  deleteAccount,
  updateChild,
  type ChildRow,
} from "@/lib/supabase/queries";
import { primeChildCache, useChild } from "@/lib/use-child";
import { ageFromDob } from "@/lib/utils/dates";

type Pronouns = "she" | "he" | "they";

const PRONOUNS_OPTIONS: { value: Pronouns; label: string }[] = [
  { value: "she", label: "She / her" },
  { value: "he", label: "He / him" },
  { value: "they", label: "They / them" },
];

/**
 * Profile: identity + about + your-data + sign out.
 *
 *   Profile                                 Inter 28 / 800
 *
 *   ┌─ Child card ────────────────────┐
 *   │ [96x96 avatar]                  │
 *   │ {name}                          │  Inter 24 / 800
 *   │ Age {n} · {pronouns}            │  Inter 14 / muted
 *   │ Edit details                    │  text button, ink
 *   └─────────────────────────────────┘
 *
 *   ────────────────────────────────── (hair)
 *
 *   ABOUT
 *   Made by a parent, for parents.
 *
 *   YOUR DATA
 *   Your child's info stays on your account.
 *   We don't sell anything. You can delete
 *   everything anytime.
 *
 *   ────────────────────────────────── (hair)
 *
 *   Sign out
 *
 * Edit sheet (bottom modal): name, dob, pronouns (radio cards). Save
 * writes via updateChild, primes the useChild cache, closes the sheet.
 */
export default function ProfilePage() {
  const { child, refetch } = useChild();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const onExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await downloadExport();
    } catch (err) {
      console.error("[/profile] export:", err);
      toast("Couldn't export. Try again.", { tone: "danger" });
    } finally {
      setExporting(false);
    }
  }, [exporting, toast]);

  const onSignOut = useCallback(async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast("Couldn't sign out. Try again.", { tone: "danger" });
        setSigningOut(false);
      }
      // AuthGate's onAuthStateChange handles the SIGNED_OUT redirect.
    } catch (err) {
      console.error("[/profile] signOut:", err);
      toast("Couldn't sign out. Try again.", { tone: "danger" });
      setSigningOut(false);
    }
  }, [signingOut, toast]);

  const onConfirmDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      // 1. Photo cleanup. Prompt 3 wires the actual bucket; for now
      //    the call is defensive — if photo_url exists it'll resolve
      //    to {parentId}/{childId}.jpg under child-photos. Swallow
      //    storage errors so a missing bucket / missing file doesn't
      //    block account deletion.
      if (child?.photo_url) {
        try {
          const supabase = getSupabaseBrowser();
          await supabase.storage
            .from("child-photos")
            .remove([`${child.parent_id}/${child.id}.jpg`]);
        } catch (err) {
          console.warn("[/profile] photo cleanup skipped:", err);
        }
      }

      // 2. Delete the auth.users row. cascade removes profiles +
      //    child + activity_log via the foreign keys established in
      //    migrations 001 and 002.
      await deleteAccount();

      // 3. Clear the Dexie cache so a future sign-in starts fresh.
      try {
        await db.delete();
      } catch (err) {
        console.warn("[/profile] dexie clear skipped:", err);
      }

      // 4. Flash for /sign-in to render once.
      try {
        window.sessionStorage.setItem(
          "account_deleted_flash",
          "true",
        );
      } catch {
        /* private browsing — flash just won't fire */
      }

      // 5. Sign out. AuthGate's SIGNED_OUT handler redirects to
      //    /sign-in where the flash is consumed.
      await signOut();
    } catch (err) {
      console.error("[/profile] deleteAccount:", err);
      toast("Couldn't delete. Try again.", { tone: "danger" });
      setDeleting(false);
    }
  }, [child, deleting, toast]);

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col bg-bg pb-[calc(env(safe-area-inset-bottom)+96px)] pt-[calc(env(safe-area-inset-top)+8px)]">
      <AppHeader />

      <div className="px-6 pt-1">
        <h1
          className="text-ink"
          style={{
            paddingTop: 6,
            fontSize: 38,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            marginBottom: 28,
          }}
        >
          Profile
        </h1>

        {child ? (
          <ChildCard child={child} onEdit={() => setEditOpen(true)} />
        ) : (
          <p className="text-footnote text-ink-tertiary">Loading…</p>
        )}

        <Divider />

        <Section title="About">
          <p style={bodyStyle}>Made by a parent, for parents.</p>
        </Section>

        <Section title="Your data">
          <p style={bodyStyle}>
            Your child&apos;s info stays on your account. We don&apos;t
            sell anything. You can delete everything anytime.
          </p>
        </Section>

        <Divider />

        <button
          type="button"
          onClick={() => void onExport()}
          disabled={exporting}
          className="w-full text-left transition-opacity disabled:opacity-50"
          style={{
            padding: "16px 20px",
            fontSize: 16,
            color: "#1A1A1A",
            background: "transparent",
            border: "none",
          }}
        >
          {exporting ? "Preparing…" : "Export my data"}
        </button>
        <p
          style={{
            padding: "0 20px 12px",
            fontSize: 12,
            color: "#8A8A8A",
            lineHeight: 1.45,
          }}
        >
          Download everything we have about you, as a file.
        </p>

        <button
          type="button"
          onClick={() => void onSignOut()}
          disabled={signingOut}
          className="w-full text-left transition-opacity disabled:opacity-50"
          style={{
            padding: "16px 20px",
            fontSize: 16,
            color: "#1A1A1A",
            background: "transparent",
            border: "none",
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>

        <button
          type="button"
          onClick={() => setConfirmDeleteOpen(true)}
          className="w-full text-left transition-opacity"
          style={{
            marginTop: 24,
            padding: "12px 20px",
            fontSize: 14,
            color: "#C44",
            background: "transparent",
            border: "none",
          }}
        >
          Delete account
        </button>
      </div>

      <DeleteAccountModal
        open={confirmDeleteOpen}
        deleting={deleting}
        onCancel={() => {
          if (deleting) return;
          setConfirmDeleteOpen(false);
        }}
        onConfirm={() => void onConfirmDelete()}
      />

      <EditDetailsSheet
        open={editOpen}
        child={child}
        onClose={() => setEditOpen(false)}
        onSaved={async (row) => {
          primeChildCache(row);
          setEditOpen(false);
          await refetch();
        }}
      />
    </main>
  );
}

// ---------- Child card ----------

function ChildCard({
  child,
  onEdit,
}: {
  child: ChildRow;
  onEdit: () => void;
}) {
  const info = ageFromDob(child.dob);
  const age = info?.years ?? 0;
  const initial = child.name.trim().charAt(0).toUpperCase() || "•";
  const pronouns = pronounsLabel(child.pronouns);

  return (
    <div>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit child photo"
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{
          width: 96,
          height: 96,
          background: child.photo_url ? "transparent" : "#1A1A1A",
          backgroundImage: child.photo_url
            ? `url(${child.photo_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#FFFFFF",
          fontSize: 36,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: "none",
        }}
      >
        {child.photo_url ? null : initial}
      </button>

      <p
        className="text-ink"
        style={{
          marginTop: 16,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1.15,
        }}
      >
        {child.name}
      </p>
      <p
        style={{
          marginTop: 4,
          fontSize: 14,
          color: "#6B6B6B",
          lineHeight: 1.4,
        }}
      >
        Age {age} · {pronouns}
      </p>
      <button
        type="button"
        onClick={onEdit}
        className="transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
        style={{
          marginTop: 12,
          fontSize: 14,
          fontWeight: 700,
          color: "#1A1A1A",
          background: "transparent",
          border: "none",
          padding: 0,
        }}
      >
        Edit details
      </button>
    </div>
  );
}

// ---------- Sections + helpers ----------

const bodyStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#1A1A1A",
  lineHeight: 1.5,
};

function Divider() {
  return (
    <hr
      style={{
        marginTop: 28,
        marginBottom: 28,
        border: 0,
        borderTop: "1px solid #E5E3DA",
      }}
    />
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 24 }}>
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#8A8A8A",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 8,
        }}
      >
        {title}
      </p>
      {children}
    </section>
  );
}

function pronounsLabel(p: "he" | "she" | "they"): string {
  switch (p) {
    case "he":
      return "he/him";
    case "she":
      return "she/her";
    case "they":
      return "they/them";
  }
}

// ---------- Edit sheet ----------

function EditDetailsSheet({
  open,
  child,
  onClose,
  onSaved,
}: {
  open: boolean;
  child: ChildRow | null;
  onClose: () => void;
  onSaved: (row: ChildRow) => void | Promise<void>;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Edit details">
      {child ? (
        <EditDetailsForm
          child={child}
          onCancel={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Sheet>
  );
}

function EditDetailsForm({
  child,
  onCancel,
  onSaved,
}: {
  child: ChildRow;
  onCancel: () => void;
  onSaved: (row: ChildRow) => void | Promise<void>;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(child.name);
  const [dob, setDob] = useState(child.dob);
  const [pronouns, setPronouns] = useState<Pronouns>(child.pronouns);
  const [saving, setSaving] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const minDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 20);
    return d.toISOString().slice(0, 10);
  }, []);

  const trimmed = name.trim();
  const dirty =
    trimmed !== child.name || dob !== child.dob || pronouns !== child.pronouns;
  const canSave = trimmed.length > 0 && dob.length > 0 && dirty && !saving;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const row = await updateChild({
        name: trimmed,
        dob,
        pronouns,
      });
      await onSaved(row);
    } catch (err) {
      console.error("[/profile] updateChild:", err);
      toast("Couldn't save. Try again.", { tone: "danger" });
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Field label="Name">
        <input
          className="h-[50px] w-full rounded-[6px] px-4 text-[16px] text-ink"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E3DA",
          }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>

      <Field label="Birthday">
        <input
          type="date"
          value={dob}
          min={minDob}
          max={today}
          onChange={(e) => setDob(e.target.value)}
          className="h-[50px] w-full rounded-[6px] px-4 text-[16px] text-ink"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E3DA",
          }}
        />
      </Field>

      <Field label="Pronouns">
        <div className="flex flex-col gap-2">
          {PRONOUNS_OPTIONS.map((opt) => {
            const on = pronouns === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPronouns(opt.value)}
                className="rounded-[10px] px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                style={{
                  background: on ? "#1A1A1A" : "#FFFFFF",
                  border: `1px solid ${on ? "#1A1A1A" : "#E5E3DA"}`,
                  color: on ? "#FFFFFF" : "#1A1A1A",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="mt-2 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={!canSave}
          className="h-[52px] w-full rounded-[8px] text-white transition-opacity disabled:opacity-50"
          style={{
            background: "#1A1A1A",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="w-full text-center transition-opacity disabled:opacity-50"
          style={{
            fontSize: 14,
            color: "#6B6B6B",
            background: "transparent",
            border: "none",
            padding: "8px 0",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#8A8A8A",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

// ---------- Delete account modal ----------

function DeleteAccountModal({
  open,
  deleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="delete-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => {
            if (!deleting) onCancel();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full"
            style={{
              maxWidth: 380,
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "24px 20px 20px",
            }}
          >
            <h2
              id="delete-title"
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#1A1A1A",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              Delete your account?
            </h2>
            <p
              style={{
                marginTop: 12,
                fontSize: 15,
                color: "#1A1A1A",
                lineHeight: 1.5,
              }}
            >
              This removes your account, your child&apos;s profile, all
              activity history, and the photo. This cannot be undone.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                className="w-full transition-opacity disabled:opacity-60"
                style={{
                  background: "#C44",
                  color: "#FFFFFF",
                  padding: "14px",
                  borderRadius: 999,
                  border: "none",
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={deleting}
                className="w-full transition-opacity disabled:opacity-50"
                style={{
                  background: "transparent",
                  color: "#6B6B6B",
                  padding: "10px",
                  border: "none",
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
