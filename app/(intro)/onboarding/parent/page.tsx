"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createParent } from "@/lib/db";
import { useAppStore } from "@/lib/store/useAppStore";

export default function ParentOnboardingPage() {
  const router = useRouter();
  const setParent = useAppStore((s) => s.setParent);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const trimmed = name.trim();
  const valid = trimmed.length > 0;

  const submit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();
      if (!valid || busy) return;
      setBusy(true);
      try {
        const parent = await createParent(trimmed);
        setParent(parent.id);
        router.replace("/onboarding/child");
      } catch (err) {
        console.error("[/onboarding/parent] createParent:", err);
        toast("Couldn't save — try again.", { tone: "danger" });
        setBusy(false);
      }
    },
    [busy, router, setParent, toast, trimmed, valid],
  );

  return (
    <main className="relative flex min-h-[100svh] flex-col bg-bg">
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+24px)]">
        <h1 className="font-display text-display leading-[1.1] text-ink">
          Welcome.
        </h1>
        <p className="mt-3 text-body-large text-ink-secondary">
          What should we call you?
        </p>
      </div>

      <form
        onSubmit={submit}
        className="flex flex-1 flex-col px-5 pt-10"
        noValidate
      >
        <Input
          label="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          autoComplete="given-name"
          inputMode="text"
          spellCheck={false}
          placeholder="e.g. Priya"
          disabled={busy}
        />

        {/* Sticky bottom CTA */}
        <div className="mt-auto pb-[calc(env(safe-area-inset-bottom)+24px)] pt-8">
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={!valid || busy}
          >
            Continue
          </Button>
        </div>
      </form>
    </main>
  );
}
