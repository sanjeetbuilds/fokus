"use client";

import {
  Anchor,
  BookOpen,
  Brain,
  Compass,
  Eye,
  Heart,
  Sparkles,
  Wind,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import Card from "@/components/ui/Card";

import { ACTIVITIES, getActivitiesBySkill } from "@/lib/content/activities";
import { INTRO_SCREENS } from "@/lib/content/intro";
import { SKILL_KEYS, SKILLS } from "@/lib/content/skills";
import type { ActivityRequires, SkillKey } from "@/types";

/**
 * Map iconName strings → actual Lucide components. Keeping this map next
 * to the showcase rather than inside skills.ts keeps the content file
 * pure-data (no React/Lucide imports leak into the engine).
 */
const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>> = {
  Sparkles,
  BookOpen,
  Heart,
  Brain,
  Anchor,
  Wind,
  Eye,
  Compass,
};

const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = {
  1: "Easy",
  2: "Medium",
  3: "Stretch",
};

const REQUIRES_LABEL: Record<ActivityRequires, string> = {
  nothing: "Nothing",
  "paper-pen": "Paper + pen",
  "objects-at-home": "Objects at home",
  outdoors: "Outdoors",
};

export default function ContentDevPage() {
  const total = ACTIVITIES.length;
  const totalExpected = 64;
  const totalOk = total === totalExpected;

  const perSkill: Array<{ skill: SkillKey; count: number; ok: boolean }> =
    SKILL_KEYS.map((skill) => {
      const count = getActivitiesBySkill(skill).length;
      return { skill, count, ok: count === 8 };
    });

  return (
    <main className="mx-auto max-w-[720px] px-5 pb-40">
      <div className="flex items-center justify-between pt-8 pb-6">
        <div>
          <p className="text-footnote uppercase tracking-[0.08em] text-ink-tertiary">
            Internal · Content
          </p>
          <h1 className="mt-1 text-display text-ink">Library</h1>
        </div>
      </div>

      {/* Totals */}
      <section className="mb-10">
        <h2 className="mb-3 text-title-2 text-ink">Counts</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="flex flex-col gap-1">
            <span className="text-caption uppercase tracking-[0.08em] text-ink-tertiary">
              Total activities
            </span>
            <span
              className={`text-title-1 ${
                totalOk ? "text-ink" : "text-danger"
              }`}
            >
              {total} / {totalExpected}
            </span>
          </Card>
          {perSkill.map(({ skill, count, ok }) => (
            <Card key={skill} className="flex flex-col gap-1">
              <span className="text-caption uppercase tracking-[0.08em] text-ink-tertiary">
                {SKILLS[skill].label}
              </span>
              <span
                className={`text-title-1 ${ok ? "text-ink" : "text-danger"}`}
              >
                {count} / 8
              </span>
            </Card>
          ))}
        </div>
        {!totalOk || perSkill.some((p) => !p.ok) ? (
          <p className="mt-3 text-footnote text-danger">
            Counts off. Check activities.ts.
          </p>
        ) : null}
      </section>

      {/* Skills swatch */}
      <section className="mb-10">
        <h2 className="mb-3 text-title-2 text-ink">Skill palette</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SKILL_KEYS.map((key) => {
            const def = SKILLS[key];
            const Icon = ICONS[def.iconName];
            return (
              <Card key={key} className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: def.color }}
                >
                  {Icon ? (
                    <Icon
                      size={22}
                      strokeWidth={1.75}
                      className="text-white"
                      aria-hidden
                    />
                  ) : null}
                </span>
                <div className="min-w-0">
                  <p className="text-headline text-ink">{def.label}</p>
                  <p className="mt-1 text-footnote text-ink-secondary">
                    {def.description}
                  </p>
                  <p className="mt-2 font-mono text-caption text-ink-tertiary">
                    {def.iconName} · {def.color}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Intro screens */}
      <section className="mb-10">
        <h2 className="mb-3 text-title-2 text-ink">Intro carousel</h2>
        <div className="flex flex-col gap-3">
          {INTRO_SCREENS.map((screen) => (
            <Card key={screen.id}>
              <p className="text-caption uppercase tracking-[0.08em] text-ink-tertiary">
                Screen {screen.id}
              </p>
              <p className="mt-2 text-body-large text-ink">{screen.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Activity tables per skill */}
      <section>
        <h2 className="mb-3 text-title-2 text-ink">All 64 activities</h2>
        <div className="flex flex-col gap-8">
          {SKILL_KEYS.map((key) => {
            const def = SKILLS[key];
            const items = getActivitiesBySkill(key);
            const Icon = ICONS[def.iconName];
            return (
              <div key={key}>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    aria-hidden
                    className="inline-flex h-6 w-6 items-center justify-center rounded-sm"
                    style={{ backgroundColor: def.color }}
                  >
                    {Icon ? (
                      <Icon
                        size={14}
                        strokeWidth={2}
                        className="text-white"
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <h3 className="text-title-3 text-ink">{def.label}</h3>
                  <span className="text-footnote text-ink-tertiary">
                    {items.length} activities
                  </span>
                </div>
                <Card className="overflow-hidden p-0">
                  <table className="w-full text-left text-footnote">
                    <thead className="border-b border-line-subtle bg-bg text-caption uppercase tracking-[0.08em] text-ink-tertiary">
                      <tr>
                        <th className="px-4 py-3 font-extrabold">ID</th>
                        <th className="px-4 py-3 font-extrabold">Title</th>
                        <th className="px-4 py-3 font-extrabold">Min</th>
                        <th className="px-4 py-3 font-extrabold">Diff</th>
                        <th className="px-4 py-3 font-extrabold">Ages</th>
                        <th className="px-4 py-3 font-extrabold">Requires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((a) => (
                        <tr
                          key={a.id}
                          className="border-b border-line-subtle last:border-b-0"
                        >
                          <td className="px-4 py-3 font-mono text-ink-tertiary">
                            {a.id}
                          </td>
                          <td className="px-4 py-3 text-ink">{a.title}</td>
                          <td className="px-4 py-3 text-ink-secondary">
                            {a.duration}
                          </td>
                          <td className="px-4 py-3 text-ink-secondary">
                            {DIFFICULTY_LABEL[a.difficulty]}
                          </td>
                          <td className="px-4 py-3 text-ink-secondary">
                            {a.ageRange[0]}-{a.ageRange[1]}
                          </td>
                          <td className="px-4 py-3 text-ink-secondary">
                            {REQUIRES_LABEL[a.requires]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
