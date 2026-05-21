"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Map,
  Plus,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import Sheet from "@/components/ui/Sheet";
import TabBar from "@/components/ui/TabBar";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";

const INTERESTS = [
  "Animals",
  "Space",
  "Vehicles",
  "Dinosaurs",
  "Music",
  "Drawing",
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <header className="mb-4">
        <h2 className="text-title-2 text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-footnote text-ink-tertiary">{description}</p>
        ) : null}
      </header>
      <div className="rounded-lg border border-line-subtle bg-bg p-5">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-line-subtle pb-5 last:border-b-0 last:pb-0">
      {label ? (
        <p className="text-caption uppercase tracking-[0.08em] text-ink-tertiary">
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function UIDevPage() {
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [selected, setSelected] = useState<string[]>(["Animals"]);
  const [errorDemo, setErrorDemo] = useState(false);

  const toggleSelection = (value: string) =>
    setSelected((current) =>
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );

  return (
    <main className="mx-auto max-w-[720px] px-5 pb-40">
      <div className="flex items-center justify-between pt-8 pb-6">
        <div>
          <p className="text-footnote uppercase tracking-[0.08em] text-ink-tertiary">
            Internal · UI Showcase
          </p>
          <h1 className="mt-1 text-display text-ink">Primitives</h1>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {/* ---------- Button ---------- */}
        <Section
          id="button"
          title="Button"
          description="Variants × sizes × states. Tap each one to feel the scale(0.97) feedback."
        >
          <div className="flex flex-col gap-6">
            <Row label="Primary">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button
                rightIcon={<ArrowRight size={18} strokeWidth={1.75} />}
              >
                With icon
              </Button>
              <Button disabled>Disabled</Button>
            </Row>
            <Row label="Secondary">
              <Button variant="secondary" size="sm">
                Small
              </Button>
              <Button variant="secondary">Medium</Button>
              <Button variant="secondary" size="lg">
                Large
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Plus size={18} strokeWidth={1.75} />}
              >
                Add child
              </Button>
              <Button variant="secondary" disabled>
                Disabled
              </Button>
            </Row>
            <Row label="Tertiary">
              <Button variant="tertiary" size="sm">
                Small
              </Button>
              <Button variant="tertiary">Medium</Button>
              <Button variant="tertiary" size="lg">
                Large
              </Button>
              <Button variant="tertiary" disabled>
                Disabled
              </Button>
            </Row>
            <Row label="Destructive">
              <Button variant="destructive">Delete child</Button>
              <Button variant="destructive" size="sm">
                Small
              </Button>
              <Button variant="destructive" disabled>
                Disabled
              </Button>
            </Row>
            <Row label="Full width">
              <div className="w-full">
                <Button fullWidth>Continue</Button>
              </div>
            </Row>
          </div>
        </Section>

        {/* ---------- Card ---------- */}
        <Section
          id="card"
          title="Card"
          description="Default for static content, interactive for tap targets."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="text-title-3 text-ink">Default card</h3>
              <p className="mt-2 text-body text-ink-secondary">
                Sits on bg-elevated, no shadow, sixteen-pixel padding.
              </p>
            </Card>
            <Card
              variant="interactive"
              onClick={() => toast("Card tapped.")}
            >
              <h3 className="text-title-3 text-ink">Interactive card</h3>
              <p className="mt-2 text-body text-ink-secondary">
                Tap to see scale feedback and shadow lift.
              </p>
            </Card>
          </div>
        </Section>

        {/* ---------- Input ---------- */}
        <Section
          id="input"
          title="Input"
          description="50px tall, 16px font (no iOS zoom), accent border on focus."
        >
          <div className="flex flex-col gap-5">
            <Input label="Your name" placeholder="What should we call you?" />
            <Input
              label="Child's name"
              placeholder="Aarav"
              defaultValue="Aarav"
            />
            <Input
              label="With hint"
              placeholder="20:00"
              hint="Reminder time, optional"
            />
            <Input
              label="With error"
              placeholder="Aarav"
              value=""
              onChange={() => undefined}
              error={errorDemo ? "Name is required to continue." : undefined}
            />
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setErrorDemo((v) => !v)}
              >
                {errorDemo ? "Clear error" : "Show error"}
              </Button>
            </div>
            <Input label="Disabled" defaultValue="Aarav" disabled />
          </div>
        </Section>

        {/* ---------- Textarea ---------- */}
        <Section
          id="textarea"
          title="Textarea"
          description="Min 100px, grows up to 240px, then scrolls."
        >
          <div className="flex flex-col gap-5">
            <Textarea
              label="Anything to remember?"
              placeholder="Asked 7 layers deep about why we sleep. Surprising."
            />
            <Textarea
              label="With error"
              error="Note can't be empty when skipped."
              placeholder="Why skipped?"
            />
          </div>
        </Section>

        {/* ---------- Chip ---------- */}
        <Section
          id="chip"
          title="Chip"
          description="Toggle to feel selected vs unselected."
        >
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <Chip
                key={interest}
                selected={selected.includes(interest)}
                onClick={() => toggleSelection(interest)}
                leftIcon={
                  selected.includes(interest) ? (
                    <CheckCircle2 size={16} strokeWidth={1.75} />
                  ) : undefined
                }
              >
                {interest}
              </Chip>
            ))}
            <Chip disabled>Disabled</Chip>
          </div>
          <p className="mt-3 text-footnote text-ink-tertiary">
            Selected: {selected.length ? selected.join(", ") : "none"}
          </p>
        </Section>

        {/* ---------- PageHeader ---------- */}
        <Section
          id="page-header"
          title="PageHeader"
          description="Large title with optional back + right action."
        >
          <div className="flex flex-col gap-6">
            <div className="rounded-md border border-line-subtle bg-bg-elevated pb-5">
              <PageHeader title="Today" />
            </div>
            <div className="rounded-md border border-line-subtle bg-bg-elevated pb-5">
              <PageHeader
                title="Settings"
                onBack={() => toast("Back tapped.")}
                rightAction={
                  <button
                    type="button"
                    onClick={() => toast("Done tapped.")}
                    className="inline-flex h-9 items-center rounded-md px-2 text-callout font-extrabold text-accent hover:text-accent-pressed"
                  >
                    Done
                  </button>
                }
              />
            </div>
            <div className="rounded-md border border-line-subtle bg-bg-elevated pb-5">
              <PageHeader
                eyebrow="Wednesday · 6 Nov"
                title="With Aarav"
                onBack={() => toast("Back tapped.")}
              />
            </div>
          </div>
        </Section>

        {/* ---------- TabBar ---------- */}
        <Section
          id="tab-bar"
          title="TabBar"
          description="Live sample is fixed at the bottom of this page. Tap to switch."
        >
          <p className="text-body text-ink-secondary">
            Currently active: <span className="text-ink">{activeTab}</span>
          </p>
        </Section>

        {/* ---------- Sheet ---------- */}
        <Section
          id="sheet"
          title="Sheet"
          description="Spring slide-up from the bottom. Click backdrop, drag handle, or press Esc to close."
        >
          <Button onClick={() => setSheetOpen(true)}>Open sheet</Button>
        </Section>

        {/* ---------- Avatar ---------- */}
        <Section
          id="avatar"
          title="Avatar"
          description="Three sizes. Empty-name fallback in a separate row."
        >
          <div className="flex items-end gap-8 py-2">
            <div className="flex flex-col items-center gap-2">
              <Avatar size="sm" name="Aarav" />
              <span className="text-caption text-ink-tertiary">sm · 32</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Diya" />
              <span className="text-caption text-ink-tertiary">md · 44</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar size="lg" name="Kabir" />
              <span className="text-caption text-ink-tertiary">lg · 64</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-line-subtle pt-5">
            <Avatar size="sm" name="" />
            <span className="text-footnote text-ink-tertiary">
              Empty-name fallback renders &quot;?&quot;.
            </span>
          </div>
        </Section>

        {/* ---------- EmptyState ---------- */}
        <Section
          id="empty-state"
          title="EmptyState"
          description="Used inside otherwise-empty list views."
        >
          <div className="rounded-md border border-line-subtle bg-bg-elevated">
            <EmptyState
              icon={<Sparkles size={32} strokeWidth={1.75} />}
              title="First moment with Aarav starts here"
              description="When you log your first activity, Aarav's map will build itself."
              cta={<Button>Pick today's moment</Button>}
            />
          </div>
          <div className="mt-4 rounded-md border border-line-subtle bg-bg-elevated">
            <EmptyState
              title="Nothing matches"
              description="Try another filter."
            />
          </div>
        </Section>

        {/* ---------- Toast ---------- */}
        <Section
          id="toast"
          title="Toast"
          description="Auto-dismiss after 3s, click to dismiss early, stacks if multiple."
        >
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => toast("Saved.")}>Show default</Button>
            <Button
              variant="secondary"
              onClick={() => toast("Session saved.", { tone: "success" })}
            >
              Show success
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                toast("Couldn't save. Try again.", { tone: "danger" })
              }
            >
              Show danger
            </Button>
            <Button
              variant="tertiary"
              onClick={() => {
                toast("First");
                setTimeout(() => toast("Second"), 200);
                setTimeout(() => toast("Third"), 400);
              }}
            >
              Stack three
            </Button>
          </div>
        </Section>
      </div>

      {/* Live TabBar sample at the bottom of the page */}
      <TabBar
        activeKey={activeTab}
        onChange={setActiveTab}
        tabs={[
          { key: "today", label: "Today", icon: Compass },
          { key: "library", label: "Library", icon: BookOpen },
          { key: "map", label: "Map", icon: Map },
          { key: "profile", label: "Profile", icon: User },
        ]}
      />

      {/* Sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="How did it go?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-body text-ink-secondary">
            Sample sheet content. Sheets scroll internally if their content
            exceeds 85vh.
          </p>
          <Input
            label="Anything to remember?"
            placeholder="Two long whys and then a giggle."
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              leftIcon={<Settings size={18} strokeWidth={1.75} />}
              onClick={() => {
                setSheetOpen(false);
                toast("Saved.", { tone: "success" });
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Sheet>
    </main>
  );
}
