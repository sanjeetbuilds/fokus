/**
 * Round-5 verification screenshots — spec restoration pass.
 *
 *   v11-track            — frequency tiles + "View all 8 skills" link
 *   v11-library          — 8 skill pills (no Sensory/Storytelling/Movement)
 *   v11-profile          — child name "Honey", no goal/skills-earned/milestones
 *   v11-today            — reflection block + time/mood chips + activity card
 *
 * Run: BASE=http://localhost:3013 npx tsx scripts/screenshot-round5.ts
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE ?? "http://localhost:3013";
const OUT = "screenshots";

async function seed(page: import("puppeteer-core").Page) {
  await page.evaluate(async () => {
    const Dexie = (
      await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
    ).default;
    try { await Dexie.delete("fokus_db"); } catch { /* ignore */ }
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
      name: "Honey",
      age: 6,
      ageBand: "4-6 yrs",
      grade: "1st",
      engagement: {
        goesDeepOn: ["Drawing", "Building/Lego"],
        fleesFrom: ["Studying / homework"],
        inBetween: [],
      },
      primaryLanguage: "Hindi",
      interests: ["Animals", "Space"],
      strengths: ["Curious"],
      struggles: ["Sitting still"],
      createdAt: now,
      updatedAt: now,
      _syncStatus: "local",
    });
    // Seed only past-day sessions so Today renders the active picker
    // (chips + activity card) rather than the "done for today" state.
    const seeds = [
      { offset: 1, activityId: "la1", response: "engaged" },
      { offset: 1, activityId: "cu1", response: "loved" },
      { offset: 2, activityId: "ob1", response: "loved" },
      { offset: 3, activityId: "th2", response: "engaged" },
      { offset: 5, activityId: "cr1", response: "loved" },
      { offset: 7, activityId: "re5", response: "engaged" },
    ];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (const s of seeds) {
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
        duration: 12,
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
  });
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
    await page.setViewport({ width: 412, height: 1500, deviceScaleFactor: 2 });

    page.on("pageerror", (err) => console.log(`[error] ${err.message}`));

    const waitForText = async (text: string, timeout = 45_000) => {
      await page.waitForFunction(
        (needle: string) => {
          return Array.from(document.querySelectorAll("body *")).some((el) =>
            (el.textContent ?? "").toLowerCase().includes(needle.toLowerCase()),
          );
        },
        { timeout },
        text,
      );
    };

    await page.goto(`${BASE}/today`, { waitUntil: "domcontentloaded" });
    await seed(page);

    // ---------- Track ----------
    await page.goto(`${BASE}/map`, { waitUntil: "load" });
    await waitForText("Track.");
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: `${OUT}/v11-track.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- Library ----------
    await page.goto(`${BASE}/library`, { waitUntil: "load" });
    await waitForText("Activity");
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: `${OUT}/v11-library.png`,
      type: "png",
    });

    // ---------- Profile ----------
    await page.goto(`${BASE}/profile`, { waitUntil: "load" });
    await waitForText("Honey");
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({
      path: `${OUT}/v11-profile.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- Today ----------
    await page.goto(`${BASE}/today`, { waitUntil: "load" });
    await waitForText("Today");
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({
      path: `${OUT}/v11-today.png`,
      type: "png",
      fullPage: true,
    });

    console.log("Done.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
