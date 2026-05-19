/**
 * Capture verification screenshots for the v9 editorial+structural polish
 * pass. Five shots:
 *
 *   1. v9-onboarding-step2-engagement   — merged "what they love / avoid"
 *   2. v9-onboarding-step1-photo        — About-your-child with photo input
 *   3. v9-today-compressed              — Today w/ compact reflection
 *   4. v9-profile-photo-sections        — Profile w/ photo + renamed bits
 *   5. v9-today-empty-weeklybars        — Today w/ hidden WeeklyBars state
 *
 * Run: BASE=http://localhost:3011 npx tsx scripts/screenshot-polish.ts
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BASE ?? "http://localhost:3011";
const OUT = "screenshots";

interface SeedOpts {
  sessionCount: number;
  withPhoto?: boolean;
}

const TINY_PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAYklEQVR4nO3RsQ0AIAwEsP9P30Si4hQpvSV2yxxr7VRJsAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEnwYNDz5lAaIRA1L2AAAAAElFTkSuQmCC";

async function seed(
  page: import("puppeteer-core").Page,
  opts: SeedOpts,
) {
  await page.evaluate(async (o) => {
    const Dexie = (
      await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
    ).default;

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
      name: "Honey",
      age: 6,
      grade: "1st",
      photoUrl: o.withPhoto
        ? (window as unknown as { __DEMO_PHOTO: string }).__DEMO_PHOTO
        : null,
      engagement: {
        goesDeepOn: ["Drawing", "Building/Lego"],
        fleesFrom: ["Studying / homework", "Sitting still"],
        inBetween: [],
      },
      englishConfidence: "hesitant",
      primaryLanguage: "Hindi",
      interests: ["Animals", "Space", "Dinosaurs"],
      strengths: ["Curious", "Talkative"],
      struggles: ["Finishing what they start", "Big feelings", "Losing games"],
      createdAt: now,
      updatedAt: now,
      _syncStatus: "local",
    });

    const seeds = [
      { offset: 1, activityId: "cu1", response: "loved" },
      { offset: 2, activityId: "la1", response: "engaged" },
      { offset: 3, activityId: "em1", response: "neutral" },
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
    await page.setViewport({ width: 412, height: 1500, deviceScaleFactor: 2 });

    page.on("console", (msg) => {
      console.log(`[browser:${msg.type()}] ${msg.text()}`);
    });
    page.on("pageerror", (err) => {
      console.log(`[browser:error] ${err.message}`);
    });

    // Inject a placeholder photo data URL so the seeded child can opt into
    // photo display without driving the real file picker.
    await page.evaluateOnNewDocument((url) => {
      (window as unknown as { __DEMO_PHOTO: string }).__DEMO_PHOTO = url;
    }, TINY_PNG_DATA_URL);

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

    // ---------- Step 1 with photo upload UI (and onboarding compressed dots) ----------
    // Onboarding requires parent to exist + active child to NOT yet exist.
    await page.goto(`${BASE}/intro`, { waitUntil: "domcontentloaded" });
    await page.evaluate(async () => {
      const Dexie = (
        await import("https://cdn.jsdelivr.net/npm/dexie@4.4.2/+esm")
      ).default;
      try {
        await Dexie.delete("fokus_db");
      } catch { /* ignore */ }
      const db = new Dexie("fokus_db");
      db.version(1).stores({
        parents: "id, updatedAt",
        children: "id, parentId, updatedAt",
        sessions: "id, childId, date, activityId, [childId+date]",
        observations: "id, childId, date",
      });
      const now = new Date().toISOString();
      await db.parents.put({
        id: "demo-parent",
        name: "Priya",
        createdAt: now,
        updatedAt: now,
        preferences: { onboarded: true },
        _syncStatus: "local",
      });
      window.localStorage.setItem(
        "fokus_app_state",
        JSON.stringify({
          state: { parentId: "demo-parent", activeChildId: null, lastPickContext: null },
          version: 2,
        }),
      );
      window.sessionStorage.setItem("fokus_splash_shown", "1");
    });

    await page.goto(`${BASE}/onboarding/child`, { waitUntil: "load" });
    await waitForText("About your child");
    // Fill in just enough so Step 1's photo input is visible alongside other
    // fields. Drop the demo photo straight into form state via the input's
    // file picker — synthesise a File from the data URL.
    await page.evaluate(async (url: string) => {
      // Find the hidden <input type="file"> and feed it a synthesised image.
      const inp = document.querySelector(
        "input[type=file]",
      ) as HTMLInputElement | null;
      if (!inp) return;
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], "demo.png", { type: "image/png" });
      const dt = new DataTransfer();
      dt.items.add(file);
      inp.files = dt.files;
      inp.dispatchEvent(new Event("change", { bubbles: true }));
    }, TINY_PNG_DATA_URL);
    // Give the canvas downscale + state update a beat.
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: `${OUT}/v9-onboarding-step1-photo.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- Step 2: merged engagement ----------
    // Fill required Step 1 fields, then click Continue to advance.
    await page.evaluate(() => {
      const nameInput = document.querySelector(
        'input[placeholder*="Aarav"]',
      ) as HTMLInputElement | null;
      if (nameInput) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        setter?.call(nameInput, "Honey");
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const dob = document.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement | null;
      if (dob) {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        const d = new Date();
        d.setFullYear(d.getFullYear() - 6);
        setter?.call(dob, d.toISOString().slice(0, 10));
        dob.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    // Pick the 1st-class chip.
    await page.evaluate(() => {
      const chips = Array.from(document.querySelectorAll("button"));
      const target = chips.find((b) => (b.textContent ?? "").trim() === "1st");
      target?.click();
    });
    await new Promise((r) => setTimeout(r, 200));
    // Click Continue.
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const cont = buttons.find((b) =>
        (b.textContent ?? "").trim().startsWith("Continue"),
      );
      cont?.click();
    });
    await waitForText("What they love. What they avoid.");
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({
      path: `${OUT}/v9-onboarding-step2-engagement.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- Today w/ compressed reflection ----------
    await seed(page, { sessionCount: 0 });
    await page.goto(`${BASE}/today`, { waitUntil: "load" });
    await waitForText("Tonight");
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: `${OUT}/v9-today-compressed.png`,
      type: "png",
    });
    // Full-page version captures the hidden WeeklyBars state too.
    await page.screenshot({
      path: `${OUT}/v9-today-empty-weeklybars.png`,
      type: "png",
      fullPage: true,
    });

    // ---------- Profile w/ photo + renamed sections ----------
    await seed(page, { sessionCount: 0, withPhoto: true });
    await page.goto(`${BASE}/profile`, { waitUntil: "load" });
    await waitForText("Honey");
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: `${OUT}/v9-profile-photo-sections.png`,
      type: "png",
      fullPage: true,
    });

    console.log("Done — five screenshots in", resolve(OUT));
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
