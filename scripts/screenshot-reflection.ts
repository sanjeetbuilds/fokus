/**
 * Capture screenshots of the "what Fokus knows about your child"
 * reflection layer in its three states (FULL / MEDIUM / COLLAPSED on
 * /today, plus the Profile sections).
 *
 * Run: BASE=http://localhost:3009 npx tsx scripts/screenshot-reflection.ts
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE ?? "http://localhost:3011";
const OUT = "screenshots";

interface SeedOpts {
  /** Number of sessions to seed for the active child. */
  sessionCount: number;
}

async function seed(
  page: import("puppeteer-core").Page,
  opts: SeedOpts,
) {
  await page.evaluate(async (o) => {
    const Dexie = (
      await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
    ).default;

    // Wipe & rebuild — every screenshot wants a deterministic state.
    try {
      await Dexie.delete("fokus_db");
    } catch {
      /* ignore */
    }

    const db = new Dexie("fokus_db");
    db.version(1).stores({
      parents: "id, updatedAt",
      children: "id, parentId, updatedAt",
      sessions: "id, childId, date, activityId, [childId+date]",
      observations: "id, childId, date",
    });
    const now = new Date().toISOString();
    const parentId = "demo-parent";
    const childId = "demo-child";

    await db.parents.put({
      id: parentId,
      name: "Priya",
      createdAt: now,
      updatedAt: now,
      preferences: { onboarded: true },
      _syncStatus: "local",
    });
    await db.children.put({
      id: childId,
      parentId,
      name: "Leo",
      age: 7,
      grade: "1st",
      engagement: {
        goesDeepOn: ["Drawing", "Building/Lego"],
        fleesFrom: ["Studying / homework"],
        inBetween: [],
      },
      englishConfidence: "hesitant",
      primaryLanguage: "Hindi",
      interests: ["Animals", "Space"],
      strengths: ["Curious", "Patient"],
      struggles: ["Finishing what they start", "Speaking English"],
      createdAt: now,
      updatedAt: now,
      _syncStatus: "local",
    });

    const seeds = [
      { offset: 1, activityId: "cu1", response: "loved" },
      { offset: 2, activityId: "la1", response: "engaged" },
      { offset: 3, activityId: "em1", response: "neutral" },
      { offset: 5, activityId: "th1", response: "loved" },
      { offset: 8, activityId: "re1", response: "struggled" },
    ];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (const s of seeds.slice(0, o.sessionCount)) {
      const d = new Date(today);
      d.setDate(d.getDate() - s.offset);
      const iso = d.toISOString().slice(0, 10);
      await db.sessions.put({
        id: `sess-${s.offset}-${s.activityId}`,
        childId,
        activityId: s.activityId,
        date: iso,
        response: s.response,
        context: { timeAvailable: "medium", childMood: "normal" },
        createdAt: d.toISOString(),
        _syncStatus: "local",
      });
    }

    window.localStorage.setItem(
      "fokus_app_state",
      JSON.stringify({
        state: { parentId, activeChildId: childId, lastPickContext: null },
        version: 2,
      }),
    );
    window.sessionStorage.setItem("fokus_splash_shown", "1");
  }, opts);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(90_000);
    await page.setViewport({ width: 412, height: 1200, deviceScaleFactor: 2 });

    page.on("console", (msg) => {
      console.log(`[browser:${msg.type()}] ${msg.text()}`);
    });
    page.on("pageerror", (err) => {
      console.log(`[browser:error] ${err.message}`);
    });
    page.on("requestfailed", (req) => {
      console.log(`[req-failed] ${req.url()} ${req.failure()?.errorText}`);
    });
    page.on("response", (res) => {
      if (res.status() >= 400) {
        console.log(`[res-${res.status()}] ${res.url()}`);
      }
    });

    const visitToday = async () => {
      await page.goto(`${BASE}/today`, { waitUntil: "load" });
      // Wait until Tailwind has actually applied (Loading… is in centered
      // flex column when CSS is loaded; raw HTML doesn't have that).
      await page.waitForFunction(
        () => {
          const h1 = document.querySelector("h1");
          return h1 !== null && h1.textContent?.includes("Tonight");
        },
        { timeout: 45_000 },
      );
      // Settle for one more tick so the reflection block's data fetch finishes.
      await new Promise((r) => setTimeout(r, 800));
    };

    // ---------- /today, FULL reflection (zero sessions) ----------
    await page.goto(`${BASE}/intro`, { waitUntil: "domcontentloaded" });
    await seed(page, { sessionCount: 0 });
    await visitToday();
    await page.screenshot({
      path: `${OUT}/v8-today-reflection-full.png`,
      type: "png",
    });

    // ---------- /today, COLLAPSED line (3+ sessions) ----------
    await seed(page, { sessionCount: 3 });
    await visitToday();
    await page.screenshot({
      path: `${OUT}/v8-today-reflection-collapsed.png`,
      type: "png",
    });

    // ---------- /profile, both new sections visible ----------
    await page.setViewport({ width: 412, height: 1500, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/profile`, { waitUntil: "load" });
    await page.waitForFunction(
      () => {
        const els = Array.from(document.querySelectorAll("p"));
        return els.some((p) =>
          p.textContent?.toLowerCase().includes("paying attention"),
        );
      },
      { timeout: 45_000 },
    );
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: `${OUT}/v8-profile-reflection.png`,
      type: "png",
    });

    console.log(
      "Captured: v8-today-reflection-full, v8-today-reflection-collapsed, v8-profile-reflection",
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
