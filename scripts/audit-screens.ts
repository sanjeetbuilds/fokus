/**
 * Task 8 audit screenshots. Captures the 14 screens listed in the
 * design-system prompt, seeded with a fresh child so the engine has
 * something to pick.
 *
 *  Run:  BASE=http://localhost:3015 npx tsx scripts/audit-screens.ts
 */
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE ?? "http://localhost:3015";
const OUT = "screenshots/audit";

async function seed(page: import("puppeteer-core").Page, name = "Honey") {
  await page.evaluate(async (childName: string) => {
    const Dexie = (
      await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
    ).default;
    try { await Dexie.delete("fokus_db"); } catch { /* ignore */ }
    const db = new Dexie("fokus_db");
    db.version(2).stores({
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
      name: "",
      createdAt: now,
      updatedAt: now,
      preferences: { onboarded: true, hasSeenWelcomeModal: true },
      _syncStatus: "local",
    });
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 7);
    const dobIso = dob.toISOString().slice(0, 10);
    await db.children.put({
      id: childId,
      parentId,
      name: childName,
      age: 7,
      dateOfBirth: dobIso,
      grade: "",
      engagement: { goesDeepOn: [], fleesFrom: [], inBetween: [] },
      primaryLanguage: "",
      interests: [],
      strengths: [],
      struggles: [],
      photoUrl: null,
      gender: "unspecified",
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
    window.sessionStorage.setItem("fokus_splash_shown", "1");
  }, name);
}

async function clearAll(page: import("puppeteer-core").Page) {
  await page.evaluate(async () => {
    try {
      const Dexie = (
        await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
      ).default;
      await Dexie.delete("fokus_db");
    } catch {
      /* ignore */
    }
    try { window.localStorage.clear(); } catch { /* ignore */ }
    try { window.sessionStorage.clear(); } catch { /* ignore */ }
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
    await page.setViewport({ width: 412, height: 1200, deviceScaleFactor: 2 });
    page.on("pageerror", (err) => console.log(`[error] ${err.message}`));

    const waitForText = async (text: string, timeout = 20_000) => {
      await page.waitForFunction(
        (needle: string) =>
          Array.from(document.querySelectorAll("body *")).some((el) =>
            (el.textContent ?? "").toLowerCase().includes(needle.toLowerCase()),
          ),
        { timeout },
        text,
      );
    };
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // ---------- 1. Splash ----------
    await page.goto(`${BASE}/today`, { waitUntil: "domcontentloaded" });
    await clearAll(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await sleep(600);
    await page.screenshot({ path: `${OUT}/01-splash.png` });

    // ---------- 2-4. Intro 1/2/3 ----------
    await page.goto(`${BASE}/intro`, { waitUntil: "domcontentloaded" });
    await sleep(800);
    await page.screenshot({ path: `${OUT}/02-intro-1.png` });
    // intro slides advance via buttons. Try clicking next.
    const goNext = async () => {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const next = btns.find((b) =>
          /next|continue|→/i.test(b.textContent ?? ""),
        );
        if (next) (next as HTMLButtonElement).click();
      });
      await sleep(500);
    };
    await goNext();
    await page.screenshot({ path: `${OUT}/03-intro-2.png` });
    await goNext();
    await page.screenshot({ path: `${OUT}/04-intro-3.png` });

    // ---------- 5. Onboarding name ----------
    await page.goto(`${BASE}/onboarding`, { waitUntil: "domcontentloaded" });
    await sleep(500);
    await page.screenshot({ path: `${OUT}/05-onb-name.png` });

    // ---------- 6. Onboarding DOB (same screen now) ----------
    await page.type('input[type="text"], input[placeholder*="What"]', "Honey");
    await sleep(200);
    await page.screenshot({ path: `${OUT}/06-onb-dob.png` });

    // ---------- 7. Welcome modal ----------
    await page.goto(`${BASE}/today`, { waitUntil: "domcontentloaded" });
    await seed(page, "Honey");
    // Force welcome modal: mark hasSeen=false + sessionStorage flag.
    await page.evaluate(async () => {
      const Dexie = (
        await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
      ).default;
      const db = new Dexie("fokus_db");
      db.version(2).stores({
        parents: "id, updatedAt",
        children: "id, parentId, updatedAt",
        sessions: "id, childId, date, activityId, [childId+date]",
        observations: "id, childId, date",
      });
      await db.parents.update("demo-parent", {
        preferences: { onboarded: true, hasSeenWelcomeModal: false },
      });
      window.sessionStorage.setItem("show_welcome_modal", "true");
    });
    await page.goto(`${BASE}/today`, { waitUntil: "load" });
    await waitForText("Welcome to Fokus", 10_000).catch(() => undefined);
    await sleep(600);
    await page.screenshot({ path: `${OUT}/07-welcome.png` });

    // ---------- 8. Today (modal dismissed) ----------
    await page.evaluate(async () => {
      const Dexie = (
        await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
      ).default;
      const db = new Dexie("fokus_db");
      db.version(2).stores({
        parents: "id, updatedAt",
        children: "id, parentId, updatedAt",
        sessions: "id, childId, date, activityId, [childId+date]",
        observations: "id, childId, date",
      });
      await db.parents.update("demo-parent", {
        preferences: { onboarded: true, hasSeenWelcomeModal: true },
      });
      window.sessionStorage.removeItem("show_welcome_modal");
    });
    await page.goto(`${BASE}/today`, { waitUntil: "load" });
    await waitForText("Tonight with", 10_000);
    await sleep(600);
    await page.screenshot({ path: `${OUT}/08-today.png`, fullPage: true });

    // ---------- 9. Library list ----------
    await page.goto(`${BASE}/library`, { waitUntil: "load" });
    await waitForText("Activity", 10_000);
    await sleep(500);
    await page.screenshot({ path: `${OUT}/09-library.png`, fullPage: true });

    // ---------- 10. Library w/ filter active (Curiosity) ----------
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const curiosity = btns.find((b) =>
        /^curiosity$/i.test((b.textContent ?? "").trim()),
      );
      if (curiosity) (curiosity as HTMLButtonElement).click();
    });
    await sleep(400);
    await page.screenshot({
      path: `${OUT}/10-library-filtered.png`,
      fullPage: true,
    });

    // ---------- 11-12. Activity detail for cu1 (Curiosity), top + open example ----------
    await page.goto(`${BASE}/activity/cu1?from=library`, {
      waitUntil: "load",
    });
    await waitForText("What to do", 10_000);
    await sleep(500);
    await page.screenshot({ path: `${OUT}/11-activity-curiosity.png` });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        /see an example/i.test(b.textContent ?? ""),
      );
      if (btn) (btn as HTMLButtonElement).click();
    });
    await sleep(400);
    await page.screenshot({
      path: `${OUT}/12-activity-example-open.png`,
      fullPage: true,
    });

    // ---------- 13. Activity detail for a non-Curiosity (la1) ----------
    await page.goto(`${BASE}/activity/la1?from=library`, {
      waitUntil: "load",
    });
    await waitForText("What to do", 10_000);
    await sleep(500);
    await page.screenshot({
      path: `${OUT}/13-activity-noncuriosity.png`,
      fullPage: true,
    });

    // ---------- 14. Track ----------
    await page.goto(`${BASE}/map`, { waitUntil: "load" });
    await sleep(500);
    await page.screenshot({ path: `${OUT}/14-track.png`, fullPage: true });

    // ---------- 15. Profile ----------
    await page.goto(`${BASE}/profile`, { waitUntil: "load" });
    await sleep(500);
    await page.screenshot({ path: `${OUT}/15-profile.png`, fullPage: true });

    console.log("Done.");
  } finally {
    await browser.close();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
