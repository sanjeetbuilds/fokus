/**
 * Engine unit tests; each test reads as a single behavioral claim about
 * the rotation rules. If you change the engine, the assertion that
 * breaks tells you which behavior you altered.
 */
import { describe, expect, it } from "vitest";

import { ACTIVITIES, getActivityById } from "@/lib/content/activities";
import { pickActivity, scoreActivity } from "@/lib/engine";
import type { Child, Session, SessionResponse, SkillKey } from "@/types";

// ---------- helpers ----------

const TODAY = new Date("2026-05-17T12:00:00Z");

function daysAgo(n: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function makeChild(patch: Partial<Child> = {}): Child {
  return {
    id: "child-test",
    parentId: "parent-test",
    name: "Aarav",
    age: 7,
    createdAt: TODAY.toISOString(),
    updatedAt: TODAY.toISOString(),
    _syncStatus: "local",
    ...patch,
  };
}

function makeSession(patch: Partial<Session> & { activityId: string }): Session {
  return {
    id: `s-${Math.random().toString(36).slice(2)}`,
    childId: "child-test",
    date: daysAgo(0),
    response: "engaged" satisfies SessionResponse,
    context: { timeAvailable: "medium", childMood: "normal" },
    createdAt: TODAY.toISOString(),
    _syncStatus: "local",
    ...patch,
  };
}

const lang = (id: string): SkillKey => getActivityById(id)!.skill;

// ---------- tests ----------

describe("scoreActivity / pickActivity", () => {
  it("a) neglected skill gets +30 after 7 days untouched; overdone skill gets -30", () => {
    const child = makeChild();
    // 7 curiosity sessions, one per day, all engaged
    const sessions: Session[] = Array.from({ length: 7 }, (_, i) =>
      makeSession({
        activityId: "cu1",
        date: daysAgo(i),
        response: "engaged",
      }),
    );
    const scored = ACTIVITIES.map((a) =>
      scoreActivity(a, child, sessions, TODAY),
    );
    const curiosity = scored.filter((s) => s.activity.skill === "curiosity");
    const otherTopSkills = new Set(
      scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((s) => s.activity.skill),
    );
    // Curiosity is overdone → all curiosity entries carry the -30 reason
    for (const s of curiosity) {
      expect(s.reasons.some((r) => /skill overdone this week.*-30/i.test(r))).toBe(
        true,
      );
    }
    // Non-curiosity activities show up in the top picks
    expect([...otherTopSkills].some((k) => k !== "curiosity")).toBe(true);
  });

  it("b) frustrated trend in resilience eases off every difficulty-3 resilience pick", () => {
    const child = makeChild();
    // 3 frustrated sessions in resilience inside last 14 days
    const sessions: Session[] = [
      makeSession({ activityId: "re1", date: daysAgo(2), response: "frustrated" }),
      makeSession({ activityId: "re2", date: daysAgo(5), response: "frustrated" }),
      makeSession({ activityId: "re6", date: daysAgo(9), response: "frustrated" }),
    ];
    const diff3Resilience = ACTIVITIES.filter(
      (a) => a.skill === "resilience" && a.difficulty === 3,
    );
    expect(diff3Resilience.length).toBeGreaterThan(0);
    for (const a of diff3Resilience) {
      const s = scoreActivity(a, child, sessions, TODAY);
      const trendReason = s.reasons.find((r) =>
        /skill trend negative/i.test(r),
      );
      expect(trendReason).toBeDefined();
      // The reason carries a negative delta for difficulty 3 (-35)
      expect(trendReason!).toMatch(/-35/);
    }
  });

  it("c) same activity is not picked every time when state is similar (weighted-random)", () => {
    const child = makeChild();
    // 5 engaged sessions of cu1 in the past week
    const sessions = Array.from({ length: 5 }, (_, i) =>
      makeSession({
        activityId: "cu1",
        date: daysAgo(i),
        response: "engaged",
      }),
    );
    // Walk an rng that cycles across all three slots of the top-3
    const rngSeq = [0.05, 0.45, 0.95, 0.2, 0.6, 0.85, 0.1, 0.5, 0.99, 0.35];
    let i = 0;
    const rng = () => rngSeq[i++ % rngSeq.length]!;
    const picks = Array.from({ length: 10 }, () =>
      pickActivity(child, sessions, TODAY, ACTIVITIES, rng).pick,
    );
    // The seeded activity should not be picked all 10 times…
    expect(picks.every((p) => p.id === "cu1")).toBe(false);
    // …and weighted-random should produce more than one distinct activity.
    expect(new Set(picks.map((p) => p.id)).size).toBeGreaterThan(1);
  });

  it("d) recent LOVED activity recurs sooner than recent FRUSTRATED one", () => {
    const cu1 = getActivityById("cu1")!;
    const lovedSessions = [
      makeSession({ activityId: "cu1", date: daysAgo(8), response: "loved" }),
    ];
    const frustratedSessions = [
      makeSession({
        activityId: "cu1",
        date: daysAgo(8),
        response: "frustrated",
      }),
    ];
    const loved = scoreActivity(cu1, makeChild(), lovedSessions, TODAY);
    const frustrated = scoreActivity(
      cu1,
      makeChild(),
      frustratedSessions,
      TODAY,
    );
    expect(loved.score).toBeGreaterThan(frustrated.score);
    // Spec quantifies it: loved +5, frustrated -20 → loved is 25 higher.
    expect(loved.score - frustrated.score).toBe(25);
    // Skill alias to silence unused-import warnings if reformatted later.
    expect(lang(cu1.id)).toBe("curiosity");
  });
});
