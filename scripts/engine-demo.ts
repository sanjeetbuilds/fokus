/**
 * Engine demo: scores a sample child against the live ACTIVITIES library
 * and prints the top pick plus the top-3 audit trail. Run with:
 *   npx tsx scripts/engine-demo.ts
 *
 * Pure: no DB, no network. The seeded rng makes the output deterministic.
 */
import { ACTIVITIES } from "../lib/content/activities";
import { pickActivity, type PickContext } from "../lib/engine";
import type { Child, Session } from "../types";

const TODAY = new Date("2026-05-17T12:00:00Z");

function daysAgo(n: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

const child: Child = {
  id: "demo-child",
  parentId: "demo-parent",
  name: "Aarav",
  age: 7,
  grade: "1st",
  engagement: {
    fleesFrom: ["Studying", "Eating slowly", "Speaking in English"],
    goesDeepOn: ["Drawing", "Building/Lego"],
    inBetween: ["Games"],
  },
  englishConfidence: "hesitant",
  primaryLanguage: "Hindi",
  interests: ["animals", "space", "drawing"],
  strengths: ["Curious", "Patient"],
  struggles: ["Speaking English", "Big feelings"],
  createdAt: TODAY.toISOString(),
  updatedAt: TODAY.toISOString(),
  _syncStatus: "local",
};

const sessions: Session[] = [
  {
    id: "s1",
    childId: child.id,
    activityId: "cu1",
    date: daysAgo(3),
    response: "engaged",
    context: { timeAvailable: "medium", childMood: "normal" },
    createdAt: TODAY.toISOString(),
  },
  {
    id: "s2",
    childId: child.id,
    activityId: "em4",
    date: daysAgo(5),
    response: "loved",
    context: { timeAvailable: "short", childMood: "normal" },
    createdAt: TODAY.toISOString(),
  },
];

const ctx: PickContext = { timeAvailable: "medium", childMood: "normal" };

// Seeded rng so the demo is reproducible
let n = 0;
const seq = [0.1, 0.5, 0.9, 0.3, 0.7];
const rng = () => seq[n++ % seq.length]!;

const { pick, scored } = pickActivity(
  child,
  sessions,
  ctx,
  TODAY,
  ACTIVITIES,
  rng,
);

console.log("=== Today's pick ===");
console.log(
  `${pick.title} · ${pick.skill} · ${pick.duration} min · diff ${pick.difficulty}`,
);
console.log(`Description: ${pick.description}`);
console.log("");
console.log("=== Top 3 scored ===");
for (let i = 0; i < 3; i++) {
  const s = scored[i]!;
  console.log(`\n#${i + 1}  ${s.activity.title}  [${s.activity.skill}]  score=${s.score}`);
  for (const r of s.reasons) console.log(`  · ${r}`);
}
