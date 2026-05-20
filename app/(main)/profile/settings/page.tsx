"use client";

import { ChevronLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import ChildProfileForm from "@/components/onboarding/ChildProfileForm";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Sheet from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import {
  exportAllData,
  exportFilename,
  getChild,
  getCurrentParent,
  updateParent,
  wipeAllData,
} from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";
import type { Child, Parent } from "@/types";

const THEME_CHOICES: { value: string; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const DEFAULT_REMINDER = "20:00";

type DeleteStage = "warn" | "confirm";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const resetStore = useAppStore((s) => s.reset);
  const activeChildId = useAppStore((s) => s.activeChildId);

  const [parent, setParent] = useState<Parent | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>(DEFAULT_REMINDER);
  const [deleteSheet, setDeleteSheet] = useState<DeleteStage | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  // Load parent + reminder prefs
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const p = await getCurrentParent();
        if (cancelled) return;
        if (p) {
          setParent(p);
          if (p.preferences.reminderTime) {
            setReminderEnabled(true);
            setReminderTime(p.preferences.reminderTime);
          } else {
            setReminderEnabled(false);
            setReminderTime(DEFAULT_REMINDER);
          }
        }
      } catch (err) {
        console.error("[/settings] load parent:", err);
      }
      if (activeChildId) {
        try {
          const c = await getChild(activeChildId);
          if (!cancelled) setChild(c ?? null);
        } catch (err) {
          console.error("[/settings] load child:", err);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChildId]);

  // Persist reminder choice. We DON'T schedule a real notification yet;
  // that gets wired up via a service worker / Notification API in the PWA
  // pass (Prompt 10). For now this is storage-only; the user can set their
  // preferred time and we'll honor it once the worker exists.
  const saveReminder = useCallback(
    async (enabled: boolean, time: string) => {
      if (!parent) return;
      try {
        await updateParent(parent.id, {
          preferences: {
            ...parent.preferences,
            reminderTime: enabled ? time : undefined,
          },
        });
        setParent({
          ...parent,
          preferences: {
            ...parent.preferences,
            reminderTime: enabled ? time : undefined,
          },
        });
      } catch (err) {
        console.error("[/settings] save reminder:", err);
        toast("Couldn't save reminder.", { tone: "danger" });
      }
    },
    [parent, toast],
  );

  const onToggleReminder = useCallback(() => {
    const next = !reminderEnabled;
    setReminderEnabled(next);
    void saveReminder(next, reminderTime);
  }, [reminderEnabled, reminderTime, saveReminder]);

  const onChangeReminderTime = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const t = event.target.value || DEFAULT_REMINDER;
      setReminderTime(t);
      if (reminderEnabled) void saveReminder(true, t);
    },
    [reminderEnabled, saveReminder],
  );

  const onExport = useCallback(async () => {
    try {
      const blob = await exportAllData();
      const filename = exportFilename();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoke after a tick so the browser has time to start the download.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast(`Exported ${filename}.`);
    } catch (err) {
      console.error("[/settings] export:", err);
      toast("Couldn't export. See console.", { tone: "danger" });
    }
  }, [toast]);

  const onConfirmDeleteAll = useCallback(async () => {
    if (busyDelete) return;
    setBusyDelete(true);
    try {
      await wipeAllData();
      resetStore();
      router.replace("/intro");
    } catch (err) {
      console.error("[/settings] wipe:", err);
      toast("Couldn't delete. See console.", { tone: "danger" });
      setBusyDelete(false);
    }
  }, [busyDelete, resetStore, router, toast]);

  const closeDeleteSheet = useCallback(() => {
    if (busyDelete) return;
    setDeleteSheet(null);
  }, [busyDelete]);

  const themeValue = useMemo(() => theme ?? "system", [theme]);

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-[640px] flex-col px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+48px)]">
      <div className="-mx-2 mb-4 flex h-9 items-center">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-callout text-accent transition-colors duration-fast ease-out hover:text-accent-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
          <span>Back</span>
        </button>
      </div>

      <header>
        <h1
          className="text-[50px] font-extrabold text-ink"
          style={{ letterSpacing: "-0.035em", lineHeight: 1.05 }}
        >
          Settings
        </h1>
      </header>

      {child ? (
        <section className="mt-10">
          <p
            className="mb-2 text-[12px] font-extrabold uppercase"
            style={{ color: "var(--ink-tertiary)", letterSpacing: "0.06em" }}
          >
            Tell us more about {child.name}
          </p>
          <p
            className="mb-4 text-[13px] text-ink-tertiary"
            style={{ lineHeight: 1.55 }}
          >
            The more Fokus knows, the better the daily picks. Edits save as you
            tap; nothing leaves the device.
          </p>
          <ChildProfileForm child={child} />
        </section>
      ) : null}

      {/* Theme */}
      <section className="mt-10">
        <p className="text-caption uppercase tracking-[0.12em] font-extrabold text-ink-tertiary">
          Theme
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {THEME_CHOICES.map((c) => (
            <Chip
              key={c.value}
              selected={themeValue === c.value}
              onClick={() => setTheme(c.value)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* Reminder */}
      <section className="mt-10">
        <p className="text-caption uppercase tracking-[0.12em] font-extrabold text-ink-tertiary">
          Daily reminder
        </p>
        <Card className="mt-3 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-callout text-ink">Remind me each day</p>
              <p className="text-footnote text-ink-tertiary">
                We&apos;ll save your preferred time. Real notifications turn on
                once we ship the PWA worker.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reminderEnabled}
              onClick={onToggleReminder}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                reminderEnabled ? "bg-accent" : "bg-line"
              }`}
            >
              <span
                aria-hidden
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-fast ease-out ${
                  reminderEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="reminder-time"
              className="text-footnote text-ink-secondary"
            >
              Time
            </label>
            <input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={onChangeReminderTime}
              disabled={!reminderEnabled}
              className="h-10 rounded-md bg-bg-elevated px-3 text-callout text-ink border border-transparent focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
        </Card>
      </section>

      {/* Data */}
      <section className="mt-10">
        <p className="text-caption uppercase tracking-[0.12em] font-extrabold text-ink-tertiary">
          Data
        </p>
        <div className="mt-3 flex flex-col gap-3">
          <Button variant="secondary" onClick={onExport} fullWidth size="md">
            Export your data
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteSheet("warn")}
            fullWidth
            size="md"
          >
            Delete all data
          </Button>
        </div>
      </section>

      {/* About */}
      <section className="mt-10">
        <p className="text-caption uppercase tracking-[0.12em] font-extrabold text-ink-tertiary">
          About
        </p>
        <Card className="mt-3">
          <p className="text-body text-ink">Version 1.0</p>
          <p className="mt-2 text-footnote text-ink-secondary">
            Made for parents who care about the 70% schools miss.
          </p>
        </Card>
      </section>

      {/* Delete all data sheet: two stages */}
      <Sheet
        open={deleteSheet !== null}
        onClose={closeDeleteSheet}
        title={
          deleteSheet === "confirm"
            ? "Are you absolutely sure?"
            : "Delete everything?"
        }
      >
        {deleteSheet === "warn" ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-ink-secondary">
              This removes everything: your account, your children&apos;s
              profiles, and every session you&apos;ve logged. There&apos;s no
              undo.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={closeDeleteSheet}
                disabled={busyDelete}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="md"
                className="flex-1"
                onClick={() => setDeleteSheet("confirm")}
                disabled={busyDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : deleteSheet === "confirm" ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-danger">
              Last chance. Tap &ldquo;Yes, delete everything&rdquo; to wipe the
              device.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={closeDeleteSheet}
                disabled={busyDelete}
              >
                Keep my data
              </Button>
              <Button
                variant="destructive"
                size="md"
                className="flex-1"
                onClick={onConfirmDeleteAll}
                disabled={busyDelete}
              >
                {busyDelete ? "Deleting…" : "Yes, delete everything"}
              </Button>
            </div>
          </div>
        ) : null}
      </Sheet>
    </main>
  );
}
