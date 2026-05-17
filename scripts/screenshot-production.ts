/**
 * Capture screenshots of the production-identity propagation for review.
 * Seeds IndexedDB + localStorage so /today and /activity render properly
 * past the OnboardingGate.
 *
 * Run: BASE=http://localhost:3009 npx tsx scripts/screenshot-production.ts
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE ?? "http://localhost:3009";
const OUT = "screenshots";

async function seed(page: import("puppeteer-core").Page) {
  // Open Dexie inside the page context and put one parent + one child + one
  // active-child pointer in. Mirrors what real onboarding would create.
  await page.evaluate(async () => {
    const Dexie = (await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")).default;
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
        fleesFrom: [],
        inBetween: [],
      },
      englishConfidence: "developing",
      primaryLanguage: "Hindi",
      interests: ["Animals", "Space"],
      strengths: ["Curious", "Patient"],
      struggles: [],
      createdAt: now,
      updatedAt: now,
      _syncStatus: "local",
    });
    window.localStorage.setItem(
      "fokus_app_state",
      JSON.stringify({
        state: { parentId, activeChildId: childId, lastPickContext: null },
        version: 2,
      }),
    );
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
    await page.setViewport({ width: 412, height: 900, deviceScaleFactor: 2 });

    // Seed first via /intro (any route — we just need the page to exist so
    // we can run a script in the same origin).
    await page.goto(`${BASE}/intro`, { waitUntil: "networkidle0" });
    await seed(page);

    // ---------- /intro (round-2) ----------
    await page.goto(`${BASE}/intro`, { waitUntil: "networkidle0" });
    await page.waitForSelector("[aria-roledescription='slide']");
    await page.screenshot({
      path: `${OUT}/v2-intro-slide-1.png`,
      type: "png",
    });

    // Advance to slide 3 (where the age axis lives)
    await page.evaluate(() => {
      const btns = Array.from(
        document.querySelectorAll<HTMLButtonElement>("[aria-label^='Go to slide 3']"),
      );
      btns[0]?.click();
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({
      path: `${OUT}/v2-intro-slide-3.png`,
      type: "png",
    });

    // ---------- /today ----------
    await page.goto(`${BASE}/today`, { waitUntil: "networkidle0" });
    await page.waitForSelector("h1");
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({
      path: `${OUT}/v2-today.png`,
      type: "png",
    });

    // ---------- /activity/cu1 ----------
    await page.goto(`${BASE}/activity/cu1?from=today&time=medium&mood=normal`, {
      waitUntil: "networkidle0",
    });
    await page.waitForSelector("h1");
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({
      path: `${OUT}/v2-activity-detail.png`,
      type: "png",
    });

    console.log("✓ Captured: v2-intro-slide-1, v2-intro-slide-3, v2-today, v2-activity-detail");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
