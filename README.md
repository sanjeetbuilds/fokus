# Fokus

One small moment a day with your child.

Fokus is a parent-facing PWA that surfaces one developmentally-meaningful activity each day, calibrated to the child's age, mood, available time, English confidence, interests, and recent history. The parent is the user; the child never sees the app.

See `SPEC.md` for the full design specification (sections 1–10).

## Tech stack

- **Next.js 15** (App Router, route groups)
- **TypeScript** (strict)
- **Tailwind CSS 3.4** + CSS variables (tokens in `styles/tokens.css`)
- **Dexie** (IndexedDB wrapper — all user data is local)
- **Zustand** + `persist` middleware (active-child + last-pick state)
- **Framer Motion** (carousel, page transitions, sheets)
- **next-themes** (system / light / dark)
- **next-pwa** + Workbox (service worker, precache, offline shell)
- **Vitest** (engine unit tests, 8/8)
- **Lucide-React** (icons)

No backend. No analytics. No external API calls.

## Project layout

```
app/
├── (intro)/        Pre-onboarding flow (intro carousel + parent + child)
├── (main)/         Tabbed app (today, library, map, profile) + detail routes
│   ├── activity/[id]      Activity detail screen
│   ├── log/[activityId]   Session log screen
│   ├── map/skill/[skill]  Per-skill detail
│   └── profile/settings   Theme + reminder + data export
├── dev/            /dev/* tools (only used during development)
├── manifest.ts     PWA manifest (served at /manifest.webmanifest)
└── layout.tsx      Root layout with ThemeProvider + ToastProvider + OnboardingGate

components/         UI primitives (Button/Chip/Input/Card/Sheet/...) +
                    feature components (ActivityCard, SkillBar, ...)
lib/
├── content/        Static content — activities (64), skills (8), intro screens
├── db/             Dexie tables + helpers + export
├── engine/         Adaptive picker — scoreActivity, pickActivity, confidence,
│                   insights (streak, trend); all pure, all unit-tested
├── store/          Zustand store
└── utils/          dates, ids, cn
public/icons/       PNG icons + master SVG (regenerable via scripts/gen-icons.ts)
scripts/            Build-time helpers (icon generator, engine demo)
styles/             Design tokens (tokens.css)
types/              Shared TypeScript types (Child, Parent, Session, Activity, …)
```

## Running locally

Requires Node 20+ and npm.

```bash
npm install
npm run dev         # http://localhost:3000
npm run test        # vitest, engine tests
npm run build       # production build (emits /public/sw.js)
npm run start       # serve the production build
```

Service worker is disabled in `next dev` so hot reload isn't cached. To test PWA install / offline behavior, use `npm run build && npm run start`.

### Re-generating app icons

`scripts/gen-icons.ts` hand-renders the SVG source via `sharp` into the three PNG sizes referenced by the manifest:

```bash
npx tsx scripts/gen-icons.ts
```

Output lands in `public/icons/`.

### Useful dev pages

- `/dev/db` — Dexie console with sample data buttons
- `/dev/engine` — adaptive picker with score audit trail
- `/dev/ui` — primitive showcase
- `/dev/content` — activity library browser
- `/dev/intro-compare` — A/B/C compare for the intro variants

## Deploying

### Vercel (recommended)

1. Push to GitHub (this repo).
2. In the Vercel dashboard: **New Project → Import** the repo.
3. Framework preset auto-detects as Next.js. No build overrides needed. No environment variables required for the MVP.
4. Deploy. The first build emits the service worker (`/sw.js`) so install-to-home-screen works on the deployed URL.

### Other platforms

Any host that runs `next build` + `next start` will work. The only build-time generated assets that ship are `/public/sw.js` and `/public/workbox-*.js` (gitignored, regenerated each build).

## Data privacy

Everything lives in the browser. There is no server, no auth, no remote DB. Settings → Export your data downloads a JSON of all parent / children / sessions / observations. Settings → Delete all data wipes IndexedDB + the persisted Zustand state.

## Tests

```bash
npm run test
```

Covers the engine (`lib/engine/*`): 8 unit tests asserting each of the 10 scoring rules + the weighted-random pick behavior + the rest-day path. See `lib/engine/__tests__/engine.test.ts`.

## License

Private — not open source at this stage.
