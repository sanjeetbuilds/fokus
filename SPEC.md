# Fokus — Product Specification

**Version:** 1.0
**Status:** Build-ready
**Audience:** You (the founder/parent) and Claude Code

---

## Table of Contents

1. [Why This Exists](#1-why-this-exists)
2. [Product Philosophy](#2-product-philosophy)
3. [User & Use Case](#3-user--use-case)
4. [Design System](#4-design-system)
5. [Data Model](#5-data-model)
6. [Screens & Flows](#6-screens--flows)
7. [The Adaptive Engine](#7-the-adaptive-engine)
8. [Activity Library — All 64 Activities](#8-activity-library)
9. [Tech Stack & Architecture](#9-tech-stack--architecture)
10. [Build Sequence](#10-build-sequence)
11. [Claude Code Prompts](#11-claude-code-prompts)

---

## 1. Why This Exists

### The problem, stated honestly

Schools teach reading, math, memorization, instruction-following, and how to sit still for hours. These matter, but they are roughly 30% of what makes a complete adult.

The other 70% — how to think when there's no answer key, how to recover from a hard day, how to read other people, how to start something difficult, how to ask a good question, how to lose, how to make a decision, how to know what you don't know — is built somewhere else. Mostly at home. Mostly between the ages of 5 and 15. Mostly through small, repeated moments that nobody plans.

Most parents love their children deeply and have no framework for any of this. They default to what their parents did, or to what the school suggests, or to what's loudest on social media. They worry about academics because academics are measurable. They don't work on the 70% because the 70% is invisible until adulthood, when it's too late to install.

### Why an app

The 70% is not learned from theory. A parent reading a book about resilience does not produce a resilient child. A parent doing one small thing today, then one small thing tomorrow, then one small thing the day after — for ten years — produces a resilient child.

The bottleneck is **knowing what to do today.** That's a product problem. An app can solve it.

Fokus gives a parent one small thing to do with their child each day, designed by what actually builds the underlying skill, adapted to that specific child based on what's already been done and how they responded.

### What this is not

- Not a curriculum
- Not academic tutoring
- Not a behavior tracker for the child
- Not a productivity tool to optimize childhood
- Not a way to make your child "the best"

It is a memory and fokus for the parent. The child should never see the dashboard. The child should never know they are being "developed." The work is the relationship; the app is training wheels for the parent.

### The parent's introduction (onboarding intro screens)

These are the actual screens shown to a new parent before signup. Five screens, swipeable, each one short.

**Screen 1**
> School measures what's easy to measure. Marks. Behavior. Speed.

**Screen 2**
> But the people who do well in life — not just careers, life — usually share a different list of skills. How to think. How to recover. How to read other people. How to start something hard. How to lose. How to keep going.

**Screen 3**
> These aren't taught anywhere. They're built at home, in small moments, between ages 5 and 15. Most parents miss them — not because they don't care, but because nobody told them what the moments are.

**Screen 4**
> Fokus gives you one thing to focus on each day. Ten minutes. Designed for who your child actually is. You'll know what you're building, what to watch for, and what to leave alone.

**Screen 5**
> This is a tool for you, not for them. They'll never see this app. They'll just feel a parent who's quietly paying attention to the right things.

[ Begin → ]

---

## 2. Product Philosophy

These are the rules that govern every product decision. If a feature violates a principle, the principle wins.

### Principle 1 — The relationship is the product

Every feature must serve the parent-child interaction. Features that pull attention *to the app* and away from the child fail. No notifications during family time. No streaks shown to children. No gamification of human development.

### Principle 2 — The child is never measured

The child has no profile they can see, no score, no rank, no progress bar. Children who know they are being optimized perform instead of being. The dashboard is for the parent's memory, not the child's report card.

### Principle 3 — One thing a day, not a curriculum

Curricula create guilt and miss life. One small activity, picked well, beats ten activities done badly. If a parent misses three days, the app should welcome them back without shame.

### Principle 4 — The parent stays the expert

The app suggests. The parent decides. The app never tells a parent they're doing it wrong, never compares them to other parents, never produces anxiety.

### Principle 5 — Activities don't teach, experiences do

Every activity must work on the child *through experience*, not through being told a lesson. The parent's job is to set up the experience and stay out of the way. "What to say" in any activity is mostly "what NOT to say."

### Principle 6 — Honest data, honest engine

If a parent logs that an activity flopped, the engine respects that. No fake encouragement. No "great job!" when nothing happened. The adaptive system can only learn if the inputs are real.

### Principle 7 — Calm before clever

Apple-style restraint. No exclamation marks. No emoji unless the child drew it. No animated celebrations. The tone is: a wise older relative, not a peppy coach.

### Principle 8 — Account-backed, privacy-respecting

Fokus is account-backed via Supabase. Parent data (email, child's name, DOB, pronouns, photo URL, activity history with optional notes) is stored on Supabase with row-level security so a parent can only ever read or write their own rows. Dexie is used as a local cache for offline reads and a write queue for activity logs.

Privacy commitments: data is never shared with third parties, never sold, and the parent can delete their account and all associated data at any time. Account deletion and a full JSON data export are first-class features, not pre-launch TODOs.

---

## 3. User & Use Case

### Primary user

A parent of a child aged 5–10. Initial focus: 6–8 (the design will work for 5–10).

The parent:
- Has a phone (the app lives there)
- Has 10–25 minutes most days they can spend with their child
- Cares about their child becoming a capable, grounded adult
- Does not currently have a framework
- Has tried books, podcasts, Instagram parenting accounts, all of which were either too vague or too overwhelming

### Use moments

**Morning use (planning):**
Parent opens app while coffee is brewing. Reviews today's activity. Reads the how-to. Closes the app. Carries it in their head into the day.

**Activity moment (parent + child):**
Parent does the activity with the child. Phone is in pocket or on the table, not in hand. The activity is the moment.

**Evening use (logging):**
After the child is asleep, parent opens the app. 90 seconds. Marks how it went, drops a note, closes.

**Weekly use (reflection):**
Once a week, parent looks at the Map view. Notices what they've been working on, what they've missed. Sees a pattern in the notes they wrote.

### Anti-uses (what we don't want)

- Parent on phone during activity, reading the script
- Parent showing the app to the child
- Parent feeling guilty about missing days
- Parent comparing their child's "scores" to others
- Parent using this as a substitute for being present

---

## 4. Design System

Inspired by Apple — restrained, content-first, generous space, one accent color, no decoration that doesn't serve.

### Visual principles

- **Type over color.** Hierarchy comes from size and weight, not from boxes and badges.
- **One accent.** Everything is black, white, or gray, except one accent color that signals action and progress.
- **Generous whitespace.** Padding is large. Components breathe.
- **No skeuomorphism, no glassmorphism, no gradients.** Flat, clean, considered.
- **Motion is functional.** Animations exist to explain state change, never to delight for its own sake.

### Color tokens

```
/* Light mode */
--bg:             #FFFFFF       /* page background */
--bg-elevated:    #F5F5F7       /* cards, inputs (Apple's subtle gray) */
--bg-overlay:     rgba(0,0,0,0.4)  /* modals */

--ink:            #1D1D1F       /* primary text (Apple black, not pure) */
--ink-secondary:  #6E6E73       /* secondary text */
--ink-tertiary:   #86868B       /* tertiary text, captions */
--ink-quaternary: #C7C7CC       /* placeholders, disabled */

--line:           #D2D2D7       /* dividers, borders */
--line-subtle:    #E5E5EA       /* subtle dividers */

--accent:         #0071E3       /* Apple blue — the one accent */
--accent-pressed: #0058B0
--accent-bg:      #E8F1FD       /* tinted bg for selected states */

--success:        #34C759       /* used sparingly, only for confirmation */
--warning:        #FF9500       /* used very sparingly */
--danger:         #FF3B30       /* destructive actions only */

/* Dark mode */
--bg:             #000000
--bg-elevated:    #1C1C1E
--bg-overlay:     rgba(0,0,0,0.6)

--ink:            #F5F5F7
--ink-secondary:  #AEAEB2
--ink-tertiary:   #8E8E93
--ink-quaternary: #48484A

--line:           #38383A
--line-subtle:    #2C2C2E

--accent:         #0A84FF
--accent-pressed: #409CFF
--accent-bg:      #0A2540

--success:        #30D158
--warning:        #FF9F0A
--danger:         #FF453A
```

### Typography

Use the system font stack so it feels native on every device:

```css
font-family:
  -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display',
  'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Type scale (rem-based, mobile-first):**

| Token | Size | Weight | Use |
|---|---|---|---|
| `display` | 34px / 2.125rem | 700 | Page titles, onboarding |
| `title-1` | 28px / 1.75rem | 700 | Section titles |
| `title-2` | 22px / 1.375rem | 600 | Subsections, card titles |
| `title-3` | 20px / 1.25rem | 600 | Component titles |
| `headline` | 17px / 1.0625rem | 600 | Emphasis in body |
| `body` | 17px / 1.0625rem | 400 | Default reading text |
| `body-large` | 19px / 1.1875rem | 400 | Activity descriptions |
| `callout` | 16px / 1rem | 400 | Secondary content |
| `subhead` | 15px / 0.9375rem | 400 | Supporting text |
| `footnote` | 13px / 0.8125rem | 400 | Captions, metadata |
| `caption` | 12px / 0.75rem | 400 | Labels, smallest text |

**Letter spacing:** Tight on large sizes (-0.02em on display), default on body.
**Line height:** 1.5 for body, 1.2 for titles, 1.6 for long-form reading.

### Spacing scale

```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px   /* base unit */
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
```

**Default content padding:** 20px (space-5) horizontal on mobile.
**Default section spacing:** 32px (space-8) vertical between sections.

### Border radius

```
--radius-sm: 8px    /* small chips */
--radius-md: 12px   /* inputs, small cards */
--radius-lg: 16px   /* main cards */
--radius-xl: 20px   /* large cards, modals */
--radius-full: 9999px /* pills */
```

### Shadows

Use sparingly. Most elevation is shown via background color shift, not shadow.

```
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04)
--shadow-md: 0 2px 8px rgba(0,0,0,0.06)
--shadow-lg: 0 8px 24px rgba(0,0,0,0.08)  /* modals only */
```

### Motion

```
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)
--duration-fast: 150ms
--duration-base: 250ms
--duration-slow: 400ms
```

- Tap feedback: scale(0.97) for 100ms
- Page transitions: 250ms fade + slight slide
- Sheet/modal: 300ms slide up with spring
- Disabled: no transitions except color

### Component patterns

**Buttons:**
- Primary: filled, accent background, white text, 50px height (Apple's minimum tap), 12px radius
- Secondary: bordered, line color border, ink text, 50px height
- Tertiary: text only, accent color, no background
- Destructive: filled, danger background

**Inputs:**
- Background: `--bg-elevated`
- No visible border by default; border on focus only (accent)
- 50px minimum height
- 16px font size minimum (prevents iOS zoom)
- 12px radius

**Cards:**
- Background: `--bg-elevated`
- 16px (`--space-4`) internal padding minimum
- 16px (`--radius-lg`) radius
- No shadow by default; shadow on tap/lift

**Lists:**
- iOS-style grouped lists
- 12px radius on group containers
- Subtle dividers between items
- 56px minimum row height

**Navigation:**
- Bottom tab bar, 4 items max
- Large titles on top of pages (Apple style — title is part of content, not in a navbar)
- Back button as text + chevron, top-left

### Iconography

Use [Lucide](https://lucide.dev) or SF Symbols look-alikes. Stroke width 1.75. Sizes 16/20/24/28.

---

## 5. Data Model

Supabase is the source of truth. Dexie mirrors hot rows for offline reads and queues activity-log inserts when the network is gone.

### Storage strategy

- **Supabase (source of truth):** Postgres tables `profiles`, `child`, `activity_log` (one child per parent for now). RLS gates every row by `auth.uid()`. Photos in the `child-photos` Storage bucket, also gated by RLS.
- **Dexie (cache + queue):** On app boot, the hot rows are fetched from Supabase and mirrored into Dexie. UI reads go through Dexie via `useChild` / `useActivityLog`. Writes that can be deferred (activity completions) land in Dexie first with a `synced=false` flag, then push to Supabase opportunistically. Writes that must be authoritative (sign-in, child edits, photo upload) write Supabase first and only update Dexie on success.

### Schemas

```typescript
// Parent — there's typically one per device
type Parent = {
  id: string;              // uuid
  name: string;
  createdAt: string;       // ISO
  updatedAt: string;
  preferences: {
    reminderTime?: string;   // "20:00"
    darkMode?: 'auto' | 'light' | 'dark';
    onboarded: boolean;
  };
};

// Child — multiple per parent
type Child = {
  id: string;
  parentId: string;
  name: string;
  age: number;             // 5-10
  grade: string;           // "1st", "2nd", etc.
  birthMonth?: number;     // 1-12, for auto age update
  birthYear?: number;

  // Engagement profile (replaces flat "attention")
  engagement: {
    fleesFrom: string[];   // ["studying", "eating slowly"]
    goesDeepOn: string[];  // ["drawing", "lego"]
    inBetween: string[];   // ["games", "TV"]
  };

  // Language confidence
  englishConfidence: 'hesitant' | 'developing' | 'comfortable';
  primaryLanguage: string; // "Hindi", "Tamil", etc.

  // Personality observations
  interests: string[];     // ["animals", "space", ...]
  strengths: string[];     // ["curious", "patient", ...]
  struggles: string[];     // ["speaking English", "losing games", ...]

  // System
  createdAt: string;
  updatedAt: string;
  _syncStatus?: 'local' | 'synced' | 'pending';
};

// Session — one logged activity
type Session = {
  id: string;
  childId: string;
  activityId: string;     // references ACTIVITIES library
  date: string;            // ISO

  response: 'loved' | 'engaged' | 'neutral' | 'struggled' | 'frustrated' | 'skipped';
  note?: string;           // free-text parent observation
  duration?: number;       // actual minutes spent

  // Context at the time (helps engine learn)
  context: {
    timeAvailable: 'short' | 'medium' | 'long';
    childMood: 'low' | 'normal' | 'high';
  };

  createdAt: string;
  _syncStatus?: 'local' | 'synced' | 'pending';
};

// Observation — standalone parent notes about the child (not tied to activity)
type Observation = {
  id: string;
  childId: string;
  date: string;
  text: string;
  tags?: string[];         // optional: ["language", "confidence"]
  createdAt: string;
  _syncStatus?: 'local' | 'synced' | 'pending';
};

// Activity — static, lives in code, not in DB
type Activity = {
  id: string;
  title: string;
  skill: SkillKey;
  subskill?: string;
  duration: 5 | 10 | 15 | 25;
  difficulty: 1 | 2 | 3;
  languageLoad: 'low' | 'medium' | 'high';
  ageRange: [number, number];   // [6, 9]
  requires: 'nothing' | 'paper-pen' | 'objects-at-home' | 'outdoors';

  // Content layers (this is the depth you asked for)
  description: string;          // one-line essence
  hiddenCurriculum: string;     // what you're ACTUALLY building, long-term
  howTo: string;                // step-by-step for parent
  watchFor: string;             // what to notice (not what to teach)
  oneLineToSay: string;         // the single thing to drop during/after, naturally
  trap: string;                 // the common way parents ruin this exact activity
  adapt: { easier: string; harder: string };

  // Match hints (helps engine route)
  worksWellWith: string[];      // interests this activity dovetails with
};

type SkillKey =
  | 'curiosity'
  | 'language'
  | 'emotional'
  | 'thinking'
  | 'resilience'
  | 'creativity'
  | 'observation'
  | 'decisiveness';
```

### Indexes (Dexie)

```typescript
db.version(1).stores({
  parents: 'id, updatedAt',
  children: 'id, parentId, updatedAt',
  sessions: 'id, childId, date, activityId, [childId+date]',
  observations: 'id, childId, date',
});
```

---

## 6. Screens & Flows

### Information architecture

```
App
├── First Run
│   ├── Intro carousel (5 screens of why)
│   ├── Parent setup (name only)
│   └── Child onboarding (8 steps)
│
├── Main (bottom tab nav)
│   ├── Today
│   │   ├── Today landing (time + mood inputs)
│   │   ├── Activity detail
│   │   └── Log session
│   ├── Library (browse all activities)
│   │   └── Activity detail (same component)
│   ├── Map (insights)
│   │   ├── Overview
│   │   ├── Skill detail
│   │   └── Session history
│   └── Profile
│       ├── Children list
│       ├── Add child (re-runs onboarding)
│       ├── Edit child
│       └── Settings
```

### Screen specs

Below, every screen with content, behavior, and edge cases.

#### S1. Intro carousel

5 screens, horizontal swipe. Skip button top-right. CTA on last screen.

Content as specified in section 1.

Edge cases:
- User force-quits mid-carousel → returns to slide 1 on next open
- User skips → goes directly to parent setup

#### S2. Parent setup

Single screen, single field.

```
Welcome.
What should we call you?

[ Your name             ]

[ Continue ]
```

Edge case: name required to continue. No validation beyond non-empty.

#### S3. Child onboarding (8 steps)

Progress bar at top. Back button on every step except first. "Continue" disabled until valid.

**Step 1 — Basics**
```
About your child

Their name
[ ___________________ ]

Age
[ 5 ] [ 6 ] [ 7 ] [ 8 ] [ 9 ] [ 10 ]

Class
[ Nursery ] [ KG ] [ 1st ] [ 2nd ] [ 3rd ] [ 4th ] [ 5th ]

Birth month (optional, helps us track their age over time)
[ Month ▾ ]
```

**Step 2 — Where do they get pulled in?**
```
Where do they go deep?
Activities they happily spend long stretches on.

[ Drawing ] [ Building/Lego ] [ Reading ]
[ Sports/Running ] [ Stories ] [ Pretend play ]
[ Music ] [ Games (board/cards) ] [ Watching shows ]
[ Cooking with you ] [ Outdoor exploring ]

Select 1–4
```

**Step 3 — Where do they flee from?**
```
What do they try to get rid of fast?
Honest answer — this is where we'll be gentle.

[ Studying / homework ] [ Eating slowly ] [ Reading aloud ]
[ Writing ] [ Math practice ] [ Tidying up ]
[ Sitting still ] [ Listening to long instructions ]
[ Speaking in English ] [ Meeting new people ]

Select all that apply
```

**Step 4 — Language**
```
How comfortable is your child with English?

○ Hesitant
  Avoids speaking English. Comfortable in [primary language]
  for daily talk.

○ Developing
  Speaks some English. Gets stuck or shy with longer
  sentences.

○ Comfortable
  Speaks English well. Tries new words confidently.

Primary language at home
[ Hindi ▾ ]
```

**Step 5 — What lights them up?**
```
What lights them up?
The stuff they genuinely love. We use these to make
activities feel like THEIR thing.

[ Animals ] [ Space ] [ Vehicles ] [ Dinosaurs ]
[ Cooking ] [ Music ] [ Dancing ] [ Cricket / sports ]
[ Cartoons ] [ Specific shows ] [ Nature ] [ Trains ]
[ Bugs ] [ Drawing ] [ Stories ]

+ Add your own
Select 2–6
```

**Step 6 — Strengths**
```
What's already there in them?
Honest, not aspirational. What do you SEE?

[ Curious ] [ Talkative ] [ Patient ] [ Funny ]
[ Caring ] [ Active ] [ Detail-noticing ] [ Brave ]
[ Calm ] [ Creative ] [ Persistent ] [ Independent ]

Select 2–5
```

**Step 7 — Struggles**
```
Where do they get stuck?
Real challenges right now. We'll work on these gradually.

[ Speaking English ] [ Sitting still ] [ Sharing ]
[ Trying new things ] [ Finishing what they start ]
[ Losing games ] [ Asking questions ]
[ Talking to strangers ] [ Big feelings ] [ Reading ]
[ Following multi-step instructions ]

Select all that apply (can skip)
```

**Step 8 — Ready**
```
You're ready.

Each day, Fokus will give you one moment to share with
[Child name]. Five to twenty-five minutes — whatever you
have.

After, log how it went. The app learns and adjusts.

One promise:
This is for you, not for them. Don't show them streaks.
Don't make them feel measured.
The work is the relationship. We just help you focus on the right things.

[ Start with [Child name] → ]
```

#### S4. Today

```
[Logo]                              [Profile avatar]

WEDNESDAY · 6 NOV

With Aarav

How much time do you have?
[ 5–10 min ] [ 10–20 min ] [ 20–30 min ]

How's Aarav right now?
[ Low energy ] [ Normal ] [ High energy ]

[ Get today's moment → ]
```

After the button is tapped, navigates to Activity Detail.

Edge cases:
- Already done one today → shows "✓ One moment done today. Want another?"
- No sessions yet → standard view
- Returning to Today during an in-progress activity → resumes that activity

#### S5. Activity detail

```
← Back

[Skill icon] CURIOSITY · 10 MIN · MEDIUM

The Why Chain

Pick anything Aarav points to today and ask
"why" five times together.

────────────────────────────────────────

What you're really building
The reflex to look behind appearances instead of
accepting them. Curiosity is the upstream of
critical thinking, science, and original ideas.

────────────────────────────────────────

How to do it
[full instructions, 3-5 lines]

────────────────────────────────────────

What to watch for
[2-3 lines on what to notice in the child]

────────────────────────────────────────

The one thing to say (just once, casually)
"Most people stop asking why at age 7. Let's stay
weird and keep going."
Don't repeat it. Don't explain it. Drop it once,
move on.

────────────────────────────────────────

The trap to avoid
Don't give him the answers when he gets stuck.
The "I don't know, let's think" is the lesson.
Resist Google for 5 minutes.

────────────────────────────────────────

If it's too easy / too hard
Easier: Three layers instead of five. Celebrate the
shrug — "good, that's where curiosity lives."
Harder: Pick a layered question (why does the sky
change colors at sunset?) and stay 10 layers deep.

[Pick a different one]  [We did it — log it →]
```

#### S6. Log session

```
← Back

How did it go?
The Why Chain

How did Aarav respond?

○ Loved it
  Really engaged, wanted more.

○ Engaged
  Stayed focused, enjoyed it.

○ Neutral
  Did it, no strong feelings.

○ Struggled
  Found it hard but kept trying.

○ Frustrated
  Got upset, wanted to stop.

○ Skipped
  Didn't happen today.

Anything to remember? (optional)
[ Multi-line text input ]

[ Save ]
```

Edge case: "skipped" hides the note field as optional but reshows it with prompt "Why skipped?".

#### S7. Library

```
[Logo]                              [Profile avatar]

All activities
64 activities across 8 skill areas.

[ All ] [ Curiosity ] [ Language ] [ Emotional ]
[ Thinking ] [ Resilience ] [ Creativity ]
[ Observation ] [ Decisiveness ]

────────────────────────────────────────

The Why Chain
[icon] Curiosity · 10 min · Medium
Pick anything Aarav points to today and ask...

────────────────────────────────────────

[next activity card]
...
```

Tap → Activity detail.

#### S8. Map (insights)

```
[Logo]                              [Profile avatar]

Aarav's map

[Streak]  [Total days]  [Sessions]
   7         18            22

Skill development

Curiosity              ████████░░  8 sessions
Language confidence    ██████░░░░  6 sessions
Emotional awareness    ████░░░░░░  4 sessions
Thinking clarity       ███░░░░░░░  3 sessions
Resilience             ██░░░░░░░░  2 sessions
Creativity             ██░░░░░░░░  2 sessions
Observation            █░░░░░░░░░  1 session
Decisiveness           ░░░░░░░░░░  0 sessions

────────────────────────────────────────

Recent moments

[Date · Skill]
The Why Chain
Engaged
"Asked 7 layers deep about why we sleep. Surprising."

[Date · Skill]
Tell Me About Your Day
Struggled
"Stopped after 90 seconds. Switched to Hindi twice.
Didn't push it."

────────────────────────────────────────
```

Tap on a skill bar → Skill detail page with that skill's sessions and trend.
Tap on a session → Session detail (read-only) with the activity content shown.

Edge case: 0 sessions → "When you start, Aarav's map will build itself here."

#### S9. Profile / Children

```
[Logo]

Children

[Avatar] Aarav                    Active
        Age 7 · 22 sessions

[Avatar] Diya                    [Switch]
        Age 5 · 0 sessions
        [Delete icon]

[ + Add another child ]

────────────────────────────────────────

About Fokus

[The why text, brief]

Settings →
```

#### S10. Settings

```
← Back

Settings

Theme
○ System  ● Light  ○ Dark

Daily reminder (optional)
Time: [ 20:00 ]
[ Enable ]

Data
[ Export your data ]
[ Delete all data ]

About
Version 1.0
Made for parents who care about the 70% schools miss.
```

### Empty states

- No children yet → push to onboarding
- No sessions yet → Map view shows "First moment with [child] starts here"
- Library filter has 0 results → "Nothing matches. Try another filter."

### Error states

- IndexedDB unavailable → "Your browser doesn't support offline storage. Please use Safari or Chrome."
- Storage full → "Your device is low on storage. Free some space to keep using Fokus."
- Failed to save → toast: "Couldn't save. Try again." with retry.

---

## 7. The Adaptive Engine

This is the brain. Pure rules, no ML, fully understandable and tweakable.

### Inputs

- Child profile (full)
- Session history (all sessions for this child)
- Current context: `timeAvailable`, `childMood`
- Current date (for recency)

### Output

One activity, plus a reason it was picked (shown in admin / debug mode only).

### Algorithm

For each activity in the library, compute a score. Return the highest scorer, with a small randomness factor among the top 3 so the same activity isn't picked back-to-back.

```typescript
function scoreActivity(activity, child, sessions, context): number {
  let score = 100;
  const recent14 = sessions.slice(-14);
  const last7Days = sessions.filter(s =>
    daysSince(s.date) <= 7
  );

  // === 1. Time fit (heavy weight — wrong duration kills the moment) ===
  const durationMatch = {
    short:  { ideal: 7,  range: [5, 10] },
    medium: { ideal: 13, range: [10, 18] },
    long:   { ideal: 22, range: [18, 30] },
  }[context.timeAvailable];

  if (activity.duration < durationMatch.range[0]) score -= 40;
  else if (activity.duration > durationMatch.range[1]) score -= 60;
  else score += 10;

  // === 2. Mood fit ===
  if (context.childMood === 'low') {
    if (activity.difficulty === 3) score -= 35;
    if (activity.skill === 'resilience') score -= 25;
    if (activity.difficulty === 1) score += 15;
  }
  if (context.childMood === 'high') {
    if (activity.difficulty === 3) score += 20;
    if (activity.skill === 'resilience') score += 15;
    if (activity.skill === 'creativity') score += 10;
    if (activity.difficulty === 1) score -= 10;
  }

  // === 3. Language load × English confidence ===
  if (child.englishConfidence === 'hesitant') {
    if (activity.languageLoad === 'high' && activity.skill !== 'language') {
      score -= 20;
    }
    // But language activities need extra love for hesitant kids
    if (activity.skill === 'language') score += 25;
  }
  if (child.englishConfidence === 'comfortable' && activity.skill === 'language') {
    score -= 10; // less critical
  }

  // === 4. Engagement routing — KEY insight ===
  // If activity dovetails with what they go deep on, big boost.
  // If activity sounds like what they flee from, big penalty.
  const activityText = (
    activity.title + ' ' + activity.description + ' ' +
    activity.howTo + ' ' + activity.requires
  ).toLowerCase();

  for (const deep of child.engagement.goesDeepOn) {
    if (activityText.includes(deep.toLowerCase())) score += 25;
    // Also boost activities tagged as worksWellWith this interest
    if (activity.worksWellWith.includes(deep.toLowerCase())) score += 20;
  }
  for (const flees of child.engagement.fleesFrom) {
    if (activityText.includes(flees.toLowerCase())) score -= 30;
  }

  // === 5. Interest alignment ===
  for (const interest of child.interests) {
    if (activityText.includes(interest.toLowerCase())) score += 12;
    if (activity.worksWellWith.includes(interest.toLowerCase())) score += 15;
  }

  // === 6. Recency — don't repeat ===
  const lastDoneSession = [...sessions].reverse()
    .find(s => s.activityId === activity.id);
  if (lastDoneSession) {
    const daysAgo = daysSince(lastDoneSession.date);
    if (daysAgo < 14) score -= (14 - daysAgo) * 5;
    // Loved activities can recur sooner, struggled ones space out more
    if (lastDoneSession.response === 'frustrated' && daysAgo < 21) score -= 20;
    if (lastDoneSession.response === 'loved' && daysAgo > 7) score += 5;
  }

  // === 7. Skill coverage — boost neglected, dampen overdone ===
  const skillCountWeek = last7Days
    .filter(s => activityIdToSkill(s.activityId) === activity.skill).length;
  if (skillCountWeek === 0) score += 30;
  if (skillCountWeek === 1) score += 5;
  if (skillCountWeek >= 3) score -= 30;

  // === 8. Confidence trend in this skill ===
  const skillSessions = recent14
    .filter(s => activityIdToSkill(s.activityId) === activity.skill);
  const trend = skillSessions.reduce(
    (sum, s) => sum + responseValue(s.response), 0
  );

  if (trend < -5) {
    // Struggling in this skill — ease off, build wins
    if (activity.difficulty === 3) score -= 35;
    if (activity.difficulty === 1) score += 25;
  }
  if (trend > 12) {
    // Crushing this skill — stretch them
    if (activity.difficulty === 3) score += 25;
    if (activity.difficulty === 1) score -= 15;
  }

  // === 9. Age fit ===
  const [minAge, maxAge] = activity.ageRange;
  if (child.age < minAge) score -= 50;
  if (child.age > maxAge) score -= 20;
  if (child.age === minAge && activity.difficulty === 3) score -= 15;

  // === 10. Struggle prioritization ===
  // If child struggles match the skill, give it a boost (over time)
  const skillToStruggleMap = {
    language: ['Speaking English', 'Reading'],
    emotional: ['Big feelings', 'Losing games', 'Sharing'],
    resilience: ['Trying new things', 'Finishing what they start', 'Losing games'],
    decisiveness: ['Asking questions'],
    curiosity: ['Asking questions'],
    // etc.
  };
  const relevantStruggles = skillToStruggleMap[activity.skill] || [];
  const matchingStruggles = child.struggles.filter(
    s => relevantStruggles.includes(s)
  ).length;
  score += matchingStruggles * 10;

  return score;
}

function responseValue(response): number {
  return {
    loved: 8, engaged: 5, neutral: 1,
    struggled: -2, frustrated: -5, skipped: -1,
  }[response] || 0;
}

function pickActivity(child, sessions, context): Activity {
  const scored = ACTIVITIES.map(act => ({
    activity: act,
    score: scoreActivity(act, child, sessions, context),
  }));
  scored.sort((a, b) => b.score - a.score);

  // Top 3 with mild randomness — prevents same pick when state similar
  const top3 = scored.slice(0, 3);
  const totalWeight = top3.reduce((s, x) => s + Math.max(1, x.score), 0);
  let r = Math.random() * totalWeight;
  for (const x of top3) {
    r -= Math.max(1, x.score);
    if (r <= 0) return x.activity;
  }
  return top3[0].activity;
}
```

### Skill confidence display

For the Map view, show a 0–100 confidence per skill:

```typescript
function skillConfidence(skill, sessions): number {
  const skillSessions = sessions
    .filter(s => activityIdToSkill(s.activityId) === skill);
  if (skillSessions.length === 0) return 0;
  const totalValue = skillSessions
    .reduce((sum, s) => sum + responseValue(s.response), 0);
  // Base 30 + 2 per point, capped 0-100
  return Math.min(100, Math.max(0, 30 + totalValue * 2));
}
```

### When the engine refuses

If literally every activity scores below 0 (extremely rare), return a "rest day" message instead:

> Take today off. Just be with [Child]. The work is the relationship.

---

## 8. Activity Library

64 activities. 8 skills × 8 activities each.

Each activity has the full schema: `id`, `title`, `skill`, `duration`, `difficulty`, `languageLoad`, `ageRange`, `requires`, `description`, `hiddenCurriculum`, `howTo`, `watchFor`, `oneLineToSay`, `trap`, `adapt`, `worksWellWith`.

Activities should be stored in `lib/activities.ts` as a typed array. Below is the content for all 64.

### CURIOSITY (8)

**cu1 — The Why Chain** · 10 min · Medium · LangLoad: Medium · Ages 6–10 · Nothing needed
- **Description:** Pick anything they point to and ask "why" five times together.
- **Hidden curriculum:** The reflex to look behind appearances. Curiosity is the upstream of critical thinking, science, and original ideas. Adults who got "stop asking why" stop asking forever.
- **How to:** Choose an object they notice (a fan, a bird, traffic). Ask "Why does it work like that?" When they answer, ask "But why does THAT happen?" Continue 5 times. If they say "I don't know," respond "Great, let's think about it together." Never give the answer first.
- **Watch for:** Did they stay curious or get frustrated? Did they invent a theory? Did they ask their own follow-up question without you prompting?
- **One line to say:** "Most kids stop asking why around your age. Let's stay weird and keep asking." Drop once. Don't repeat.
- **Trap:** Giving the answer. The "I don't know, let's wonder" is the entire lesson. If you Google it inside 5 minutes, you taught the opposite.
- **Adapt easier:** 3 layers. Celebrate the shrug. Adapt harder: 7+ layers, branch into "what if it were different?"
- **Works well with:** science, nature, vehicles, animals

**cu2 — Take It Apart** · 25 min · Medium · LangLoad: Low · Ages 6–10 · Objects at home
- **Description:** Open up an old pen, broken toy, or torch together. Look at what's inside.
- **Hidden curriculum:** First-principles thinking starts here. Knowing that things are *made of parts* and parts have *jobs* is the seed of engineering, design, and "I could build that."
- **How to:** Find something safe to disassemble (an old ballpoint pen is perfect). Let them do the opening. Ask "What do you think this piece does?" Don't correct guesses — explore them. Try to put it back together.
- **Watch for:** Their patience with small parts. Whether they want to know what each piece *does* vs. just see inside.
- **One line to say:** "Everything you see was designed by someone. They figured out the pieces. You can too."
- **Trap:** Doing it for them when they fumble. The fumbling is the learning. Hands learn what eyes can't.
- **Adapt easier:** Just one component, like the spring from a pen. Adapt harder: An old remote, a broken toy with circuit boards.
- **Works well with:** building/lego, drawing, vehicles, how things work

**cu3 — Question Jar** · 5 min · Easy · LangLoad: Medium · Ages 5–10 · Paper-pen
- **Description:** Every day, they put one question they had today into a physical jar. Once a week, you investigate one.
- **Hidden curriculum:** Honoring questions. In most homes, "stop asking" is the default response by age 8. The jar tells the child: your questions matter enough to be collected.
- **How to:** Keep a jar visible at home. Each evening: "What's one question you had today?" They write or draw it (you write if they ask). Once a week, open the jar and pick one to actually investigate together.
- **Watch for:** Quality of questions over weeks. Does the child start *noticing more things to wonder about* during the day?
- **One line to say:** "Questions are how we make the world bigger." Said once when starting the jar.
- **Trap:** Investigating every question. That overburdens the practice. One a week. The jar is mostly a *receptacle*, not a to-do list.
- **Adapt easier:** Model first — write your own question on day 1. Adapt harder: Ask for 2 questions a day, themed weeks.
- **Works well with:** drawing, stories, science

**cu4 — How Does It Work?** · 15 min · Medium · LangLoad: High · Ages 7–10 · Nothing needed
- **Description:** Pick one everyday thing and figure out how it works together — no Googling.
- **Hidden curriculum:** Reasoning with incomplete information. Forming a theory before checking the answer is the core of science and most adult problem-solving.
- **How to:** Choose: how does a fan spin? How does the geyser heat water? How does a phone show pictures? Discuss your best guesses. Draw it on paper. ONLY after both of you have theories, look it up.
- **Watch for:** Whether their theories make internal sense, even if wrong. That's reasoning, regardless of the answer.
- **One line to say:** "Getting it wrong with a good guess is better than getting it right by being told."
- **Trap:** Rushing to look up the answer. The wrong theory is the lesson — comparing it to the truth is how understanding gets built.
- **Adapt easier:** Something visible like a tap or a doorknob. Adapt harder: Something abstract — how does wifi work? How does sleep work?
- **Works well with:** drawing, science, building/lego, how things work

**cu5 — Walk and Notice** · 15 min · Easy · LangLoad: Medium · Ages 5–10 · Outdoors
- **Description:** A 10-minute walk where the only rule is: spot three weird things.
- **Hidden curriculum:** The world is full of things we've trained ourselves not to see. Attention is a muscle. Walking with the job of noticing rebuilds it.
- **How to:** Walk anywhere — your gully, a park, even around the building. They must spot 3 things they've never noticed before. A crack pattern, a leaf shape, a sign. For each, ask "Why do you think it's like that?"
- **Watch for:** Does their *noticing radius* expand over weeks? Do they start pointing things out unprompted on regular walks?
- **One line to say:** "Most people walk the same street a thousand times and never see it. We're going to see it."
- **Trap:** Helping them find things. The friction of looking IS the practice. Stay silent.
- **Adapt easier:** Find 1 weird thing in great detail. Adapt harder: Find 5, name a category for each (textures / patterns / human-made / natural / accidental).
- **Works well with:** outdoor exploring, nature, walking, drawing

**cu6 — Stranger Question** · 10 min · Stretch · LangLoad: High · Ages 7–10 · Nothing needed
- **Description:** They think of one question to ask a person who knows something they don't.
- **Hidden curriculum:** The courage to ask + the social skill of asking well. Most adults never develop this and stay stuck because of it.
- **How to:** Could be a security guard, a shopkeeper, an uncle. They prepare ONE good question about that person's work. They ask it themselves (you stand back). Talk afterward about what they learned and how the asking felt.
- **Watch for:** Courage to ask. Quality of follow-up. How they feel about it afterward.
- **One line to say:** "Every person you'll ever meet knows something you don't. Asking is how you collect."
- **Trap:** Prepping them too much. One question, in their own words, even if awkward. Polish kills authenticity at this age.
- **Adapt easier:** Ask a family member first. Adapt harder: 2 people, same topic, compare their answers.
- **Works well with:** meeting people, social, languages

**cu7 — What's Inside?** · 10 min · Medium · LangLoad: Medium · Ages 6–10 · Nothing needed
- **Description:** Pick a closed object (a mango, light bulb, your phone). Both of you guess what's inside before opening or looking it up.
- **Hidden curriculum:** Building mental models before checking reality. This is how scientists and engineers think.
- **How to:** Choose something. Each of you draws what you think is inside, on paper. Compare drawings. Then find out the truth.
- **Watch for:** Detail in their guess. Do they build a theory or just say "stuff"?
- **One line to say:** "Guessing isn't wrong — guessing is the start of figuring out."
- **Trap:** Correcting their drawing. Compare reality to their guess, but don't grade the guess.
- **Adapt easier:** Simple things like a banana, a pencil. Adapt harder: A human eye, a clock, a battery.
- **Works well with:** drawing, science, how things work

**cu8 — Animal Mystery** · 15 min · Easy · LangLoad: Medium · Ages 5–10 · Nothing needed
- **Description:** Pick an animal. Together, list 5 weird things you don't know about it. Then find them out.
- **Hidden curriculum:** Normalizing "I don't know." Most kids learn to hide what they don't know — this practice does the opposite.
- **How to:** They pick an animal. Together list 5 things you both genuinely don't know (where does it sleep? what scares it? how long does it live? what does its baby look like?). Look up each one. Decide which fact was most surprising.
- **Watch for:** Their engagement with not-knowing. Many kids hate admitting it. This normalizes it.
- **One line to say:** "Not knowing is the start of knowing. Pretending to know stops it."
- **Trap:** Letting them only pick "their favorite animal" each time. Push variety — a worm, a moth, a bat.
- **Adapt easier:** 3 questions, picture-rich answers. Adapt harder: 10 questions, then they explain it to another family member.
- **Works well with:** animals, nature, stories, drawing

---

### LANGUAGE CONFIDENCE (8)

**la1 — Tell Me About Your Day (in English)** · 10 min · Easy · LangLoad: High · Ages 6–10 · Nothing
- **Description:** 5 minutes where they tell you about their day, only in English. You don't correct.
- **Hidden curriculum:** Fluency before accuracy. Most ESL kids freeze because they're afraid of being wrong. Removing correction unlocks the muscle.
- **How to:** Set a 5-minute timer. They talk about anything from their day, only in English. If they get stuck, they can mime, gesture, or use one Hindi word — you supply the English word and move on. NEVER correct grammar. End by saying "I liked when you said ___."
- **Watch for:** Length of sentences over weeks. Risk-taking with new words. Do they stop completely or push through stuck moments?
- **One line to say:** Pick one specific thing they said well: "When you said 'and then suddenly,' that was great." Specific praise > general praise.
- **Trap:** Correcting grammar or pronunciation mid-flow. This is the single fastest way to kill English confidence. Wait. Even at the end, mention zero or one thing.
- **Adapt easier:** 2 minutes, you ask questions they answer in single words or short phrases. Adapt harder: 10 minutes, follow-up questions.
- **Works well with:** stories, talking, anything

**la2 — Picture Description** · 10 min · Easy · LangLoad: High · Ages 6–10 · Nothing
- **Description:** Show them any photo or picture book image. They describe it in English for 1 minute.
- **Hidden curriculum:** Vocabulary recall under low pressure. Naming things you see is easier than narrating; this builds the bridge.
- **How to:** Pick a busy image (a picture book page, a photo from your phone). They describe everything they see in English. Time 1 minute. No corrections. Count how many things they named. Next time, try to beat the count.
- **Watch for:** Vocabulary range. Do they take risks naming things they're not sure of?
- **One line to say:** "You named [X] things. That's more than yesterday." Or: "Every new word is a new room in your head."
- **Trap:** Picking images that are too simple. A busy, weird image gives more material.
- **Adapt easier:** Simple image, 30 seconds, you point to things. Adapt harder: 2 minutes, abstract or emotional image.
- **Works well with:** drawing, stories, animals, anything visual

**la3 — Story Continue** · 10 min · Medium · LangLoad: High · Ages 6–10 · Nothing
- **Description:** You start a story in English with one line. They continue with one line. Back and forth.
- **Hidden curriculum:** Spontaneous English with creative pressure. The story scaffolds the language — they think about plot, the English comes along.
- **How to:** Start: "There was a boy who found a strange door in his school." They add the next line. You add the next. Keep going for 10 turns. Silly is good. End the story together.
- **Watch for:** Do they extend the plot or just repeat? Risk-taking with words.
- **One line to say:** "We just wrote a story together. You and me." Said at the end.
- **Trap:** Hijacking the plot when their turn is weak. Let weird, illogical, silly plots stand. The point is *speaking*, not literary quality.
- **Adapt easier:** Just 3 turns, you scaffold heavily. Adapt harder: Longer turns, more complex plots.
- **Works well with:** stories, pretend play, drawing

**la4 — Word of the Day** · 5 min · Easy · LangLoad: Medium · Ages 6–10 · Nothing
- **Description:** One new English word a day. They must use it 3 times before bed.
- **Hidden curriculum:** Active vocabulary > passive vocabulary. Most ESL learners know thousands of words they never use. Using > recognizing.
- **How to:** Morning: pick a word they don't know (start with concrete: "enormous," "ancient," "fragile"). Explain it with an example. Their mission: use it 3 times during the day. Track count out loud.
- **Watch for:** Do they use it correctly? Do they start collecting words?
- **One line to say:** "Words you USE are words you OWN. The rest are just visitors."
- **Trap:** Picking abstract words too early. Concrete words first ("enormous"), abstract ones later ("frustrated").
- **Adapt easier:** Super simple, count of 2 uses. Adapt harder: Abstract words, use in 5 different sentences.
- **Works well with:** stories, drawing, anything

**la5 — Order Something Yourself** · 10 min · Stretch · LangLoad: High · Ages 7–10 · Outdoors
- **Description:** At a shop or restaurant, they order or ask for something fully in English.
- **Hidden curriculum:** Confidence > fluency. Doing this once gives more confidence than 10 worksheets. The world rewards courage to speak.
- **How to:** Plan beforehand what they'll say. Practice once at home. Then they do it alone while you stand close but silent. Hug afterward regardless of how it went.
- **Watch for:** Their courage level. The decision to speak IS the thing.
- **One line to say:** "You just talked to a stranger in English. That's bigger than it feels." Said immediately after, then drop it.
- **Trap:** Coaching from the sidelines. Whisper-prompting. They feel monitored and freeze. Stand 2 meters back, look at your phone, let them do it.
- **Adapt easier:** Just say "thank you" to the shopkeeper. Adapt harder: A full conversation, ask 2 follow-up questions.
- **Works well with:** outdoor exploring, going to shops, meeting people

**la6 — Read Aloud Time** · 15 min · Medium · LangLoad: High · Ages 6–10 · Objects-at-home
- **Description:** They read one page aloud from a story book. You read the next. Alternate.
- **Hidden curriculum:** Reading aloud uses different brain circuits than silent reading — it integrates speaking confidence with comprehension. Modeling expressive reading shows what "good" sounds like.
- **How to:** Pick a book one level *below* their school level (build confidence, not stretch). They read a page. You read the next with expression — voices, pauses, drama. Don't correct mispronunciations mid-flow — wait till the end, and mention only 1 if any.
- **Watch for:** Expression, not accuracy. Do they start putting emotion into voices over weeks?
- **One line to say:** "Reading isn't just decoding letters. It's bringing the story alive." Said once, then just model it.
- **Trap:** Picking a book at their stretch level. Confidence wins over difficulty here. They should sound good to themselves.
- **Adapt easier:** Just one paragraph, you read most of the page. Adapt harder: A harder book, full chapter.
- **Works well with:** stories, reading, drawing

**la7 — Teach Me Something** · 10 min · Medium · LangLoad: High · Ages 7–10 · Nothing
- **Description:** They teach you something they know — only in English. You play the student.
- **Hidden curriculum:** Explaining is the deepest form of knowing. When they have to organize their thoughts to teach you, comprehension solidifies and English flows because the focus is the *thing*, not the language.
- **How to:** Topic: anything they know (a game, a school subject, a YouTube thing they watched). They must explain it to you in English. You ask "student" questions: "But why?" "Can you show me?" Take it seriously.
- **Watch for:** Clarity of explanation. Do they organize their thoughts or jump around?
- **One line to say:** "You explained that better than my teachers used to." Specific praise.
- **Trap:** Being a fake-impressed parent. Kids smell that. Be an actual curious student — ask real questions.
- **Adapt easier:** Just one fact, you do most of the asking. Adapt harder: A complex topic, they teach for 5 full minutes.
- **Works well with:** stories, anything they're into

**la8 — Phone Call Practice** · 10 min · Stretch · LangLoad: High · Ages 7–10 · Nothing
- **Description:** They call a relative on the phone and have a 3-minute conversation in English.
- **Hidden curriculum:** Phone English is harder than face-to-face — no gestures, no context. Mastering it builds serious confidence.
- **How to:** Pre-arrange with a relative (grandparent, uncle, family friend) who'll be patient. They call. Prep one question and one thing to share. Hand them the phone. Don't coach during the call.
- **Watch for:** Were they able to keep it going? Did they panic and hand the phone over?
- **One line to say:** "Phones are harder than face to face. You handled it."
- **Trap:** Listening on speaker and reacting. Let them have the call in private. Privacy = ownership.
- **Adapt easier:** Video call, longer. Adapt harder: Two calls in one week to different people.
- **Works well with:** family, meeting people

---

### EMOTIONAL AWARENESS (8)

**em1 — Name the Feeling** · 5 min · Easy · LangLoad: Medium · Ages 5–10 · Nothing
- **Description:** Three times today, ask them to name what they're feeling — and the intensity 1–10.
- **Hidden curriculum:** Emotions become manageable once named. Unnamed emotions run the show. This is the foundation of all adult emotional regulation.
- **How to:** At random moments throughout the day: "What are you feeling right now?" Help them name it — not just "good/bad" but "excited," "annoyed," "proud," "bored." Then: "How strong, 1 to 10?" Don't judge or fix the feeling.
- **Watch for:** Does their emotional vocabulary expand? Can they distinguish "frustrated" from "angry"? Can they name positive feelings beyond "happy"?
- **One line to say:** "Feelings are information, not problems. Naming them is how we listen."
- **Trap:** Telling them what they're feeling. "You're not angry, you're tired." That teaches them to mistrust their own signals.
- **Adapt easier:** Pick from 4 options (happy/sad/angry/scared). Adapt harder: Name the feeling AND its cause AND what it wants.
- **Works well with:** stories, talking, any quiet moment

**em2 — Big Feelings Pause** · 5 min · Medium · LangLoad: Medium · Ages 6–10 · Nothing
- **Description:** Teach a "pause and breathe" routine — practiced in calm so it's available in storm.
- **Hidden curriculum:** The 4-second gap between feeling and reacting is where all adult emotional intelligence lives. Most adults never developed it. Installing it at age 7 is gold.
- **How to:** When calm, teach them: when a big feeling comes, put a hand on belly, breathe in for 4, out for 6, then say "I feel ___." Practice 3 times in calm. Then USE it next time they're actually upset.
- **Watch for:** Do they start using it on their own over weeks? That's the win.
- **One line to say:** "The breath is the pause button. Use it before you press play on the reaction."
- **Trap:** Using it as a punishment in the moment ("go breathe!"). Make it an invitation, not a command. Sit and do it WITH them.
- **Adapt easier:** Just 3 breaths, no naming step. Adapt harder: 4-7-8 breathing, longer routine.
- **Works well with:** any quiet routine, bedtime

**em3 — Other Person's Shoes** · 10 min · Medium · LangLoad: High · Ages 6–10 · Nothing
- **Description:** Pick a real situation that happened today. Imagine how the OTHER person felt.
- **Hidden curriculum:** Empathy is not a feeling, it's a skill — the ability to construct another person's experience. This is how leaders, friends, and partners are built.
- **How to:** A fight with a friend, a teacher's scolding, even a TV character. Ask: "What do you think THEY were feeling? Why?" Don't lead them. Let them guess. Discuss without forcing them to agree with you.
- **Watch for:** Genuine perspective-taking vs. just saying what you want to hear.
- **One line to say:** "Every story has at least two insides. Both are real."
- **Trap:** Using this to make them apologize. The moment it becomes a lesson, perspective-taking dies.
- **Adapt easier:** Use a simple storybook character. Adapt harder: A real conflict with multiple parties, name what each one felt.
- **Works well with:** stories, talking, anything social

**em4 — Feeling Weather Report** · 5 min · Easy · LangLoad: Medium · Ages 5–10 · Nothing
- **Description:** Each evening, both of you give your day a "weather" — sunny, stormy, cloudy with sun.
- **Hidden curriculum:** Nuance. Most kids describe days as "good" or "bad." Weather metaphors teach that days have *parts*, that feelings shift within a day.
- **How to:** Before bed: "What was your weather today?" They say e.g. "Stormy in the morning, sunny by lunch." You do yours too. No fixing. Reflect: "Sounds like the morning was hard."
- **Watch for:** Do they start being more nuanced than "good day / bad day"?
- **One line to say:** "Weather changes inside the same day. So do we."
- **Trap:** Fixing the storm. "Why was it stormy?" with a solving tone teaches them to hide stormy moments. Just receive it.
- **Adapt easier:** Just one word. Adapt harder: Weather + reason + what made it shift.
- **Works well with:** bedtime, talking

**em5 — Anger Box** · 15 min · Medium · LangLoad: Low · Ages 6–10 · Paper-pen
- **Description:** Make a physical "anger box" — things they can do when angry. Build the list together.
- **Hidden curriculum:** Having pre-decided coping options removes the impossible task of inventing them mid-meltdown. Adults call this "regulation strategies." Kids call it the box.
- **How to:** When calm: "What helps you when you're really angry?" Brainstorm a list. Decorate a box. Put options inside on slips of paper (squeeze a pillow, draw the anger, count to 20, stomp 10 times). Use it next time.
- **Watch for:** Do they go to the box on their own? That's the goal.
- **One line to say:** "We make the plan when calm. Then we follow the plan when we're not."
- **Trap:** Imposing options they didn't pick. Their list, their box. Even if "scream into a pillow" sounds silly to you, write it down.
- **Adapt easier:** 3 options, simple. Adapt harder: Also make a "sad box" and "worried box."
- **Works well with:** drawing, crafts, building

**em6 — Apology Practice** · 10 min · Stretch · LangLoad: High · Ages 7–10 · Nothing
- **Description:** Teach the 4-part apology: what I did, why it was wrong, how it made you feel, what I'll do next time.
- **Hidden curriculum:** Real apologies are a skill, not a virtue. Most adults can't apologize properly. Installing this at 7 builds an unusual quality.
- **How to:** Practice with a hypothetical first: "Imagine you broke a friend's toy." Walk through: 1) I broke your toy. 2) I should have been careful. 3) I think it made you sad. 4) I'll be more careful. Then use the structure the next real time.
- **Watch for:** Do they start apologizing more genuinely? Less defensively?
- **One line to say:** "'Sorry' alone is a word. The four parts make it real."
- **Trap:** Forcing an apology to end a fight quickly. Real apologies take time. Better a slow real one than a fast fake one.
- **Adapt easier:** Just steps 1 and 4. Adapt harder: Also practice receiving apologies — "Thank you. It hurt when..."
- **Works well with:** social situations, family

**em7 — Story Feelings** · 10 min · Easy · LangLoad: Medium · Ages 5–10 · Objects-at-home
- **Description:** Read a story. Pause at key moments and ask what each character feels and why.
- **Hidden curriculum:** Practicing emotional reading on safe targets (story characters) before applying it to real people. Builds the muscle without the stakes.
- **How to:** Any story works. At conflict moments, pause: "How do you think she feels? What in the picture or words tells you?" Push for evidence, not just guesses.
- **Watch for:** Use of evidence from the story. Range of emotions named.
- **One line to say:** "We read faces in books to practice reading faces in life."
- **Trap:** Pre-stating the character's feeling. Let them guess first.
- **Adapt easier:** Very clear emotions, picture books. Adapt harder: Complex stories with mixed feelings.
- **Works well with:** stories, reading, drawing

**em8 — Gratitude Three** · 5 min · Easy · LangLoad: Medium · Ages 5–10 · Nothing
- **Description:** Each night, 3 specific things they're grateful for. You do yours too.
- **Hidden curriculum:** Specificity is the antidote to generic optimism. Saying "I'm grateful for my family" is different from "I'm grateful that papa made jokes at dinner." The latter trains noticing.
- **How to:** Before bed: 3 specific things. Not "my family" but "when papa made jokes at dinner." You go first to model specificity. Don't accept generic answers — gently push: "Tell me ONE moment."
- **Watch for:** Specificity over time. Do they start noticing good moments AS they happen?
- **One line to say:** "The day is full of moments. Most people miss them. We collect three."
- **Trap:** Making it a chore. If they're flat tired, skip a night. The practice is gentle, not mandatory.
- **Adapt easier:** 1 thing. Adapt harder: 3 things + one thing you did well.
- **Works well with:** bedtime, talking

---

(Continued in next sections — Thinking, Resilience, Creativity, Observation, Decisiveness)

---


### THINKING CLARITY (8)

**th1 — How Do We Know?** · 10 min · Medium · LangLoad: High · Ages 7–10 · Nothing
- **Description:** When they state something as fact, gently ask "How do we know that?"
- **Hidden curriculum:** The single most important critical-thinking habit: distinguishing knowing from hearing-and-repeating. Adults who never developed this are vulnerable to misinformation their whole life.
- **How to:** Whenever they say something definite ("Sharks are scary," "Vegetables are bad," "Boys are stronger"), ask "How do we know that?" Don't argue. Just keep asking until they separate "I heard" from "I saw" from "I think."
- **Watch for:** Do they start volunteering "I think" vs "I know"? That's metacognition starting.
- **One line to say:** "There's a difference between knowing something and being told it. Most people forget that."
- **Trap:** Doing this aggressively when they say something cute or harmless. Use it 1-2 times a day, max. Otherwise it becomes nagging and they shut down.
- **Adapt easier:** Only once a day, on neutral topics. Adapt harder: Also ask "What would change your mind?"
- **Works well with:** stories, talking, news, anything

**th2 — Two Reasons Game** · 10 min · Medium · LangLoad: High · Ages 6–10 · Nothing
- **Description:** For any "why" question, find TWO different possible reasons before settling on one.
- **Hidden curriculum:** Generating alternatives is the core of critical thinking. Most people stop at the first answer that feels right. This trains them not to.
- **How to:** Why is the sky blue? Why do kids fight? Why is mama tired? Insist on 2 possible reasons before they pick. "Yes, that's one. What's another?" Then: "Which seems more likely? Why?"
- **Watch for:** Generating alternatives gets easier over weeks. That's the practice working.
- **One line to say:** "First answer is rarely the best answer. Second one is where thinking starts."
- **Trap:** Pushing for the "right" second reason. Any second reason is fine — the muscle is the generation, not the accuracy.
- **Adapt easier:** You offer one reason, they offer one. Adapt harder: 3 reasons, then rank them.
- **Works well with:** any conversation, science, stories

**th3 — Sort the Same Things** · 15 min · Medium · LangLoad: Medium · Ages 6–10 · Objects-at-home
- **Description:** Take 10 random objects. Sort them. Then re-sort with a different rule. Then again.
- **Hidden curriculum:** Cognitive flexibility — the ability to see the same things multiple ways. This is the underlying skill behind creativity, debate, and good decision-making.
- **How to:** Gather 10 random items (toys, kitchen things, anything safe). They sort into groups. Ask: "What was your rule?" Then: "Now sort using a totally different rule." Aim for 3 different sorts.
- **Watch for:** Flexibility of categories. Can they see the same thing multiple ways? Do they get more creative with rules?
- **One line to say:** "Same things, different rules, different groups. That's how big thinkers think."
- **Trap:** Suggesting rules. Their rules, even if silly. Silly rules are creative rules.
- **Adapt easier:** 6 items, 2 sorts. Adapt harder: 15 items, 5 sorts.
- **Works well with:** building/lego, organizing, drawing

**th4 — What's Missing?** · 10 min · Medium · LangLoad: Medium · Ages 6–10 · Paper-pen
- **Description:** Draw a familiar object together from memory. Then check what's actually missing.
- **Hidden curriculum:** We don't see what we look at every day. This activity creates the unsettling, useful realization that *attention is selective*.
- **How to:** Both draw the same thing from memory — a bicycle, your house, your school, a 100-rupee note. Then go look at the real thing. What did each of you miss? What's usually invisible to you?
- **Watch for:** This builds observation AND the realization that we don't see everything.
- **One line to say:** "We look at things every day without seeing them. Today we saw."
- **Trap:** Mocking what they missed. Compare what YOU missed too. This is humbling for everyone.
- **Adapt easier:** Simple objects (a spoon, a fork). Adapt harder: Complex things (their classroom, a famous logo).
- **Works well with:** drawing, observation, art

**th5 — Same or Different?** · 10 min · Medium · LangLoad: High · Ages 6–10 · Nothing
- **Description:** Pick two things. Find 5 ways they're the same and 5 ways they're different.
- **Hidden curriculum:** Analogy and contrast are foundational reasoning tools. Used by every scientist, lawyer, writer, designer.
- **How to:** Pick odd pairs (a cat and a car, a teacher and a book, the moon and a clock). List 5 similarities and 5 differences. Push past the obvious.
- **Watch for:** Do they go beyond surface features (color, size) to function or behavior?
- **One line to say:** "Everything is a little like everything else. And totally not."
- **Trap:** Picking boring similar pairs (apple/orange). Weirder pairs unlock weirder thinking.
- **Adapt easier:** 3 each, similar pairs. Adapt harder: 8 each, weirder pairs, abstract things.
- **Works well with:** stories, animals, anything

**th6 — Cause and Effect Chain** · 10 min · Medium · LangLoad: High · Ages 6–10 · Nothing
- **Description:** Pick a small event. Trace 5 things that happen because of it, like dominoes.
- **Hidden curriculum:** Early systems thinking. The world is connected; actions have ripples. Adults who don't see this make worse decisions.
- **How to:** "It rains heavily." Then what? "Roads get wet." Then? "Cars go slow." Then? "Papa is late." Then? Five links minimum. Then try going backward: what caused the rain?
- **Watch for:** Length and quality of chain. Do branches start appearing (effect splits into multiple)?
- **One line to say:** "One thing always touches the next thing. Smart people see the whole row."
- **Trap:** Correcting their logic when a link is shaky. Let weird chains run. The chain-building is the muscle.
- **Adapt easier:** 3 links. Adapt harder: 8 links, branch into multiple effects.
- **Works well with:** stories, science, anything observed

**th7 — True, False, or Not Sure** · 10 min · Medium · LangLoad: High · Ages 7–10 · Nothing
- **Description:** Tell them 5 statements. They say true / false / not sure. Defend each.
- **Hidden curriculum:** Comfort with not knowing. Many kids feel pressured to know — this teaches that "not sure" is honest, valid, and often the smartest answer.
- **How to:** Mix obvious truths, obvious falsehoods, and tricky ones: "All birds fly." "The sun is bigger than earth." "Spinach makes you strong." They pick one of 3 options AND explain. Reward "not sure" — that's honest thinking.
- **Watch for:** Use of "not sure." Many kids feel pressured to know — this teaches it's okay not to.
- **One line to say:** "'Not sure' is the answer of careful thinkers."
- **Trap:** Treating "not sure" as worse than a wrong answer. It's better than a confident wrong answer.
- **Adapt easier:** 3 statements, very clear. Adapt harder: 10 statements with nuance.
- **Works well with:** stories, science, talking

**th8 — Solve It Backward** · 15 min · Stretch · LangLoad: High · Ages 7–10 · Nothing
- **Description:** Pose a goal. Work backward step by step to figure out how to reach it.
- **Hidden curriculum:** Planning, executive function, and goal-orientation. Most adults can't reverse-engineer outcomes. This installs the habit early.
- **How to:** Goal: "We want to eat dinner at 8pm sharp." Work backward: serve at 8 → cook by 7:50 → start by 7:30 → vegetables ready by 7:25 → buy them by 7. This is planning thinking.
- **Watch for:** Can they hold the goal in mind while working backward? That's executive function building.
- **One line to say:** "Working from the end to the now is how plans get made."
- **Trap:** Doing the working-backward for them. Pause. Wait. Let them propose.
- **Adapt easier:** Simple 3-step goal. Adapt harder: Complex goal with multiple paths and constraints.
- **Works well with:** cooking, baking, planning, anything sequential

---

### RESILIENCE (8)

**re1 — The Hard Puzzle** · 25 min · Stretch · LangLoad: Low · Ages 6–10 · Objects-at-home
- **Description:** A puzzle/task slightly above their level. You do NOT help unless they ask specifically.
- **Hidden curriculum:** Frustration tolerance. The ability to stay with a hard thing without quitting is more predictive of adult outcomes than IQ.
- **How to:** Pick something hard (a 60-piece puzzle if they do 30 easily, a math problem one grade up). Sit nearby but don't intervene. If they get frustrated, just acknowledge: "This is hard." Don't rescue. Stop only if they're genuinely overwhelmed.
- **Watch for:** How long they persist before asking. Do they take breaks vs. quitting entirely?
- **One line to say:** "Hard isn't a sign to quit. Hard is a sign you're growing."
- **Trap:** Rescuing too early. The discomfort IS the practice. Stay calm and present.
- **Adapt easier:** Only slightly above level, you nearby. Adapt harder: Significantly harder, longer time.
- **Works well with:** building/lego, math, drawing, anything stretchable

**re2 — Try, Fail, Try Again** · 15 min · Medium · LangLoad: Medium · Ages 6–10 · Objects-at-home
- **Description:** A physical skill they've never done. Allow exactly 5 attempts. Celebrate trying, not success.
- **Hidden curriculum:** Decoupling effort from outcome. Most kids learn "try → win" or "try → quit." This teaches "try → adjust → try."
- **How to:** Catching a ball with one hand, balancing on one leg eyes closed, tying a specific knot. 5 attempts. Track each. Talk about what they changed between tries. Whether they succeed or not, the celebration is for trying again.
- **Watch for:** Do they adjust strategy between tries or just repeat? That's learning.
- **One line to say:** "What you changed between try 2 and try 3 was the learning."
- **Trap:** Praising success only. The whole point is to celebrate the trying.
- **Adapt easier:** Easier skill, 3 attempts. Adapt harder: Harder skill, 10 attempts, track which strategies worked.
- **Works well with:** sports, balance, music, anything physical

**re3 — The Mistake Story** · 10 min · Easy · LangLoad: High · Ages 6–10 · Nothing
- **Description:** You tell them about a mistake YOU made today. They tell you one of theirs.
- **Hidden curriculum:** Mistakes become normal, discussable, and survivable. Most kids hide mistakes. Hidden mistakes ferment into shame.
- **How to:** Be honest. Real mistakes. "Today I was rude to a colleague and felt bad." Then ask them for one. The point: mistakes are normal and discussable. NEVER use their sharing against them later, not even gently.
- **Watch for:** Trust building. Over weeks, do they share more openly?
- **One line to say:** "Everyone makes mistakes. The thing that matters is whether we look at them."
- **Trap:** Using their shared mistake against them later. ONE betrayal here kills the practice forever.
- **Adapt easier:** You share, they just listen for the first few times. Adapt harder: Also discuss what each of you would do differently.
- **Works well with:** bedtime, talking, family time

**re4 — Boredom Practice** · 25 min · Medium · LangLoad: Low · Ages 5–10 · Nothing
- **Description:** Set aside 20 minutes with no screens, no scheduled activity. They must figure out what to do.
- **Hidden curriculum:** Boredom is where imagination, self-direction, and inner life develop. Constantly-entertained kids never build these muscles.
- **How to:** Tell them: "Next 20 minutes, no screen, no plan. You decide what to do." Don't suggest. Let them be bored. Boredom is where creativity and self-direction grow. End by asking what they came up with.
- **Watch for:** Does the time-to-discover-something shorten over weeks?
- **One line to say:** "Boredom isn't an emergency. It's the door to imagination."
- **Trap:** Suggesting activities when they whine. The whining IS the practice. Hold the line.
- **Adapt easier:** Start with 10 minutes if very screen-conditioned. Adapt harder: 30+ minutes, weekly.
- **Works well with:** any quiet time at home

**re5 — Finish What You Started** · 15 min · Medium · LangLoad: Medium · Ages 6–10 · Objects-at-home
- **Description:** Pick something they abandoned. Today, finish it.
- **Hidden curriculum:** Many adults can't finish things. They had this hopping pattern installed in childhood and never unlearned it. Practicing closure is rare and valuable.
- **How to:** A half-built lego, an unfinished drawing, a puzzle. The rule: today we finish it, however small. Sit with them. If they resist, acknowledge: "It's hard to come back to old things." But finish.
- **Watch for:** Their relationship with completion. Many kids hop activity to activity.
- **One line to say:** "Things we finish change us. Things we drop don't."
- **Trap:** Picking too big a thing. Aim for 10-15 min of work left. Set them up to win.
- **Adapt easier:** Pick something with just 10 min of work left. Adapt harder: A bigger abandoned project, multi-day.
- **Works well with:** building/lego, drawing, crafts

**re6 — Lose on Purpose** · 15 min · Medium · LangLoad: Low · Ages 6–10 · Objects-at-home
- **Description:** Play a game where they'll likely lose. Don't let them win.
- **Hidden curriculum:** Losing is a skill. Adults who never learned to lose well become adults who can't take feedback, can't admit mistakes, can't lose elections, jobs, or arguments gracefully.
- **How to:** Chess, cards, any board game. Don't throw the game. They need practice losing without it being a catastrophe. If they get upset, acknowledge calmly: "Losing is hard. It feels bad. Want to play again?"
- **Watch for:** Recovery time. Does the upset get shorter over weeks?
- **One line to say:** "Losing tells us what to practice. Winning just tells us we already knew it."
- **Trap:** Throwing the game to avoid a meltdown. The meltdown is part of the practice. Hold steady.
- **Adapt easier:** A short game first, build up. Adapt harder: A tournament of 3 games, varied outcomes.
- **Works well with:** games, board games, sports

**re7 — The Cold Splash** · 5 min · Medium · LangLoad: Low · Ages 5–10 · Nothing
- **Description:** Wash face with cold water in morning. Notice the "ugh" then the "okay."
- **Hidden curriculum:** A felt experience of: *discomfort passes*. Most kids learn to avoid discomfort. Brief, safe, chosen discomfort teaches the opposite.
- **How to:** Just cold water on face, as morning routine. They notice: "It feels bad for 5 seconds. Then it feels good." This is a tiny experience of: discomfort passes. Don't force it; invite it.
- **Watch for:** Do they start choosing small uncomfortable things on their own? That's the seed of grit.
- **One line to say:** "The bad feeling didn't last. Most bad feelings don't."
- **Trap:** Making it punishment. Frame as a choice they get to make, not something done to them.
- **Adapt easier:** Just splash, optional. Adapt harder: 10-second cold shower (kid-decided).
- **Works well with:** morning routine

**re8 — Try the Hard Food** · 10 min · Stretch · LangLoad: Medium · Ages 6–10 · Objects-at-home
- **Description:** One food they refuse. They take 3 bites mindfully. No pressure beyond that.
- **Hidden curriculum:** Tolerance for unfamiliar sensations — applies way beyond food. Adults who never learned to try unfamiliar things stay stuck in narrow lives.
- **How to:** Not making them finish it. Just 3 mindful bites of something they avoid (bitter gourd, mushroom, etc). Describe taste and texture aloud. After 3 bites, they're free. Try again in a week.
- **Watch for:** Tolerance for the unfamiliar. The food doesn't matter; the willingness does.
- **One line to say:** "Brave isn't liking it. Brave is trying it."
- **Trap:** Making them finish. That kills the practice. 3 mindful bites, exit clean.
- **Adapt easier:** Just 1 bite, or smell only. Adapt harder: Try a new cuisine entirely.
- **Works well with:** eating, mealtime

---

### CREATIVITY (8)

**cr1 — 20 Uses For This** · 10 min · Medium · LangLoad: Medium · Ages 6–10 · Objects-at-home
- **Description:** Pick one object. Come up with 20 unusual uses for it together.
- **Hidden curriculum:** Divergent thinking — generating many possibilities before evaluating. The first 5 ideas are common. The last 5 are creative. The skill is pushing past the obvious.
- **How to:** A brick, a sock, a spoon. List 20 uses. Silly ones count. "A brick is a... paperweight, doorstop, hammer, weight for exercise, building block..." Push past the obvious 5.
- **Watch for:** Where ideas come from. The first 5 are common; the last 5 are creative.
- **One line to say:** "Everyone gets the first five. The next fifteen are where creative people live."
- **Trap:** Filtering for "good" ideas. Bad ideas are required. Generating quantity creates quality.
- **Adapt easier:** 10 uses, simple object. Adapt harder: 30 uses, weirder objects.
- **Works well with:** building/lego, art, drawing

**cr2 — What If The World Was...** · 10 min · Medium · LangLoad: High · Ages 6–10 · Nothing
- **Description:** A "what if" question. Explore what would change in detail.
- **Hidden curriculum:** Counterfactual thinking — imagining how things could be different. This is the foundation of design, innovation, fiction, and strategy.
- **How to:** What if everyone could fly? What if water tasted different in every glass? What if you could only speak in songs? Pick one. Discuss: school, food, shops, family — how would each change?
- **Watch for:** Do they extend the idea or stop at the surface?
- **One line to say:** "Everything was once a 'what if' someone took seriously."
- **Trap:** Picking what-ifs that are too logical. Wilder is better — kids need permission to think wildly.
- **Adapt easier:** Simple concrete what-if. Adapt harder: 2 what-ifs combined.
- **Works well with:** stories, sci-fi, pretend play, dinosaurs, space

**cr3 — Invent A Creature** · 15 min · Medium · LangLoad: High · Ages 6–10 · Paper-pen
- **Description:** Together, design an animal that lives in a specific weird place.
- **Hidden curriculum:** Constraint-driven creativity. Real creative work isn't free-form — it's solving for fit. Designing to constraints teaches functional creativity.
- **How to:** Pick a place: under the sea floor, inside a volcano, on a cloud. What does the animal eat? How does it move? What are its enemies? Draw it. Name it.
- **Watch for:** Internal consistency — do the creature's features match its habitat?
- **One line to say:** "Real creativity isn't 'whatever.' It's solving the puzzle of fitting in a strange place."
- **Trap:** Letting features be arbitrary. Push: "But how would that work in a volcano?"
- **Adapt easier:** Just one feature, like the eyes. Adapt harder: An ecosystem of 3 creatures that depend on each other.
- **Works well with:** drawing, animals, dinosaurs, nature, sci-fi

**cr4 — Story From Three Words** · 10 min · Medium · LangLoad: High · Ages 6–10 · Nothing
- **Description:** You give three random words. They make a story using all three.
- **Hidden curriculum:** Connecting unrelated things is where creativity lives. Forced juxtaposition is a known creativity tool used by writers and inventors.
- **How to:** Words like: "elephant, key, mountain." They tell (or you write) a story using all three. Can be short. Then give 3 more for a second story. Silly is good.
- **Watch for:** How creatively they connect unrelated things. That's the core of creativity.
- **One line to say:** "Three random things, one story. That's how new ideas get born."
- **Trap:** Picking related words. Unrelated is the whole point — the friction generates the creativity.
- **Adapt easier:** 2 words, very short story. Adapt harder: 5 words, longer story with structure.
- **Works well with:** stories, drawing, pretend play

**cr5 — Re-Invent An Object** · 15 min · Stretch · LangLoad: High · Ages 7–10 · Paper-pen
- **Description:** Pick a common object. How would you redesign it for a different user?
- **Hidden curriculum:** Empathy + creativity = design. Understanding a user's constraints, then solving for them, is a complete creative discipline.
- **How to:** A chair for a giraffe. A toothbrush for an elephant. A backpack for someone with no hands. Sketch the new design. Solve the actual problems.
- **Watch for:** Empathy for the user (understanding their constraints) + creative problem-solving.
- **One line to say:** "Good design starts by asking what does THIS person need."
- **Trap:** Skipping the empathy step. The user constraints are the creative material — start there.
- **Adapt easier:** Just one tweak to an existing design. Adapt harder: Redesign for multiple users at once.
- **Works well with:** drawing, animals, building/lego

**cr6 — Open-Ended Building** · 25 min · Easy · LangLoad: Low · Ages 5–10 · Objects-at-home
- **Description:** Pure unstructured building time — lego, blocks, cardboard. No plan.
- **Hidden curriculum:** Self-direction. Most kids only build to instructions or examples. Free building activates a different muscle: starting from nothing.
- **How to:** Set out building materials. NO theme, NO goal, NO suggestion. Just "build whatever." You build too, separately. After 25 minutes, both share what you made.
- **Watch for:** Independence of imagination. Do they look to you for ideas or generate their own?
- **One line to say:** "Some of the best stuff in the world started with someone just making."
- **Trap:** Suggesting a theme to "help." The empty page is the practice.
- **Adapt easier:** Shorter time, one inspiration given. Adapt harder: Add a constraint mid-session ("must move," "must include a story").
- **Works well with:** building/lego, drawing, crafts

**cr7 — The Bad Idea Game** · 10 min · Medium · LangLoad: High · Ages 6–10 · Nothing
- **Description:** Brainstorm the WORST ideas to solve a problem. Then see if any contain a good idea.
- **Hidden curriculum:** Removing the fear of being wrong unlocks creativity. By making "bad" the goal, you destroy the inner editor that kills ideas before they're spoken.
- **How to:** Problem: "How to get to school faster?" Worst ideas: ride a snail, dig a tunnel, fly with balloons. List 10 terrible solutions. Then pick one and find what's GOOD about the bad idea.
- **Watch for:** Risk-taking with ideas. Comfort with looking silly.
- **One line to say:** "Sometimes the bad idea is hiding a good idea inside."
- **Trap:** Being too "good" with your own bad ideas. Match their silliness — outrank them in absurdity.
- **Adapt easier:** 5 bad ideas, you go first. Adapt harder: 20 bad ideas, find a hidden good one.
- **Works well with:** stories, anything

**cr8 — Make Up A Song** · 15 min · Stretch · LangLoad: High · Ages 6–10 · Nothing
- **Description:** Make up a 4-line song about something boring (dishes, traffic, brushing teeth).
- **Hidden curriculum:** Comfort with being silly. Most kids self-edit too much by age 8. This loosens it. Adults who can't be silly can't be creative.
- **How to:** Pick a boring topic. Make a melody (use a known tune if helpful). Write 4 lines together. Perform it. The point: even boring things can be made fun.
- **Watch for:** Comfort with being silly. Many kids self-edit too much — this loosens it.
- **One line to say:** "Boring things are only boring until someone makes a song about them."
- **Trap:** Cringing at their silliness. Match it. Be sillier.
- **Adapt easier:** 2 lines, you do most. Adapt harder: 8 lines with rhyme scheme.
- **Works well with:** music, dancing, stories, pretend play

---

### OBSERVATION (8)

**ob1 — Memory Tray** · 10 min · Medium · LangLoad: Low · Ages 6–10 · Objects-at-home
- **Description:** Put 10 random items on a tray. They look for 30 seconds. Cover. They recall.
- **Hidden curriculum:** Active observation + short-term memory + strategy. Doing this repeatedly forces the brain to develop chunking and grouping strategies.
- **How to:** Place 10 items on a tray (coin, key, pencil, etc). They study for 30 seconds. Cover. They list what they saw. Count how many. Try again next day with new items.
- **Watch for:** Improvement over weeks. Do they develop strategies (group by type, mental image)?
- **One line to say:** "Memory isn't just remembering. It's HOW you look in the first place."
- **Trap:** Adding pressure. This is play. Score goes up over weeks naturally.
- **Adapt easier:** 6 items, 1 minute. Adapt harder: 15 items, 20 seconds.
- **Works well with:** games, building/lego

**ob2 — What Changed?** · 5 min · Easy · LangLoad: Medium · Ages 5–10 · Nothing
- **Description:** Look around the room. They close eyes. You change one thing. They spot it.
- **Hidden curriculum:** Baseline awareness. The ability to notice what's different requires first noticing what is. Develops the foundation of attention.
- **How to:** In any room, they look carefully for 30 seconds. Close eyes. You move/change ONE thing (turn a book, move a cushion). They open eyes and find it.
- **Watch for:** How long to find it. Do they develop a scanning method?
- **One line to say:** "Detectives start by knowing what was normal."
- **Trap:** Making the change too subtle. Start obvious. Build over time.
- **Adapt easier:** Obvious change. Adapt harder: 3 changes at once.
- **Works well with:** games, building/lego

**ob3 — Sound Map** · 10 min · Medium · LangLoad: Medium · Ages 6–10 · Paper-pen
- **Description:** Sit somewhere outside. Close eyes for 2 minutes. Draw a "map" of every sound's direction.
- **Hidden curriculum:** Auditory observation — usually neglected entirely. We mostly tune sounds out; this re-attunes the ear.
- **How to:** Park bench, balcony, terrace. Close eyes. Draw a circle on paper for you in the middle. Every sound you hear, mark its direction with an arrow and a word. Compare maps.
- **Watch for:** How many sounds they distinguish. We mostly tune things out — this re-attunes.
- **One line to say:** "The world is louder than we let ourselves hear."
- **Trap:** Talking during. Silent is the practice.
- **Adapt easier:** 1 minute, just count sounds. Adapt harder: 5 minutes, more detail, classify (human/animal/machine/natural).
- **Works well with:** outdoor exploring, nature, music

**ob4 — Watch A Person** · 10 min · Medium · LangLoad: Medium · Ages 7–10 · Outdoors
- **Description:** At a public place, pick a stranger. Watch them for 3 minutes. Guess their story.
- **Hidden curriculum:** Social observation. Reading people from their body, clothes, behavior. A core social skill for adult life.
- **How to:** Park, station, mall. Pick someone safe to observe from a distance. Watch 3 minutes. Discuss: what's their mood? Where are they going? What might their job be? Build a story from clues.
- **Watch for:** Use of evidence, not just guessing. Detail of observations.
- **One line to say:** "People give away their stories without saying anything. We just have to look."
- **Trap:** Mocking or staring. Teach respect — observation is private, never rude.
- **Adapt easier:** Just describe what they're wearing. Adapt harder: Observe a group, infer relationships.
- **Works well with:** outdoor exploring, stories, meeting people

**ob5 — Re-Notice Your Home** · 15 min · Medium · LangLoad: High · Ages 6–10 · Nothing
- **Description:** Walk through your own house. Find 10 things you've never really looked at.
- **Hidden curriculum:** Habituation is the enemy of attention. Re-noticing a familiar place restores fresh sight.
- **How to:** Walk slowly, room by room. Find 10 things they've never really noticed (a stain pattern, a small scratch, a label, a hinge). Take note. Realize how much we don't see daily.
- **Watch for:** Whether their "noticing radius" expands generally after this.
- **One line to say:** "We see what we look for. Today we look for everything."
- **Trap:** Rushing. Slow is the entire practice.
- **Adapt easier:** 5 things, one room. Adapt harder: 20 things, photograph each.
- **Works well with:** drawing, photography, art

**ob6 — Texture Hunt** · 10 min · Easy · LangLoad: Medium · Ages 5–10 · Nothing
- **Description:** Find 10 different textures around the house. Describe each in detail.
- **Hidden curriculum:** Sensory vocabulary. Most kids stop at "rough/smooth." Building richer sensory language enriches both observation and expression.
- **How to:** Smooth, rough, fuzzy, sticky, cold, warm, bumpy. Find an example of each. They describe WHY it feels that way. Build vocabulary for sensory details.
- **Watch for:** Range of words used. Most kids stop at smooth/rough — push further.
- **One line to say:** "There are a hundred kinds of touch. Most have no names yet."
- **Trap:** Accepting "soft" or "hard" as final answers. Push: "What KIND of soft?"
- **Adapt easier:** Just 5 textures. Adapt harder: Add smells AND sounds (full sensory hunt).
- **Works well with:** drawing, art, cooking

**ob7 — Track Something All Day** · 5 min · Medium · LangLoad: Medium · Ages 6–10 · Paper-pen
- **Description:** Pick one thing to count throughout the day. Compare guess vs reality.
- **Hidden curriculum:** Calibration — matching belief to reality. This is the underlying skill behind good judgment, forecasting, science.
- **How to:** Morning: "How many times do you think we'll say 'come on' today? Guess." All day, tally. Or: how many cars pass our window in 5 minutes at 3pm, 5pm, 7pm. Estimate first, then measure.
- **Watch for:** Accuracy of estimation improves over time — that's calibration.
- **One line to say:** "Your guesses get smarter when you check them. That's how knowing happens."
- **Trap:** Calling them wrong if they guess badly. The guess is data, not a grade.
- **Adapt easier:** Count one obvious thing. Adapt harder: Track 3 things at once, predict ratios.
- **Works well with:** science, math, anything observable

**ob8 — Mood Detective** · 10 min · Stretch · LangLoad: High · Ages 7–10 · Nothing
- **Description:** Watch family members today. Guess their mood from small signs, not words.
- **Hidden curriculum:** Calibrated empathy. Reading people accurately, then verifying. This is rare and powerful in adulthood.
- **How to:** Through the day, observe family without asking. "Mama seemed quiet. I think she's tired." Use evidence: her movements, her voice tone. Then check with her — were you right?
- **Watch for:** Calibration of emotional reading + empathy.
- **One line to say:** "Most people don't say how they feel. Most people show it."
- **Trap:** Letting the observation become invasive ("I see you're sad" announced loudly). Keep it private and gentle.
- **Adapt easier:** Just one family member, one moment. Adapt harder: Predict everyone's mood at dinner before it starts.
- **Works well with:** family, stories, social

---

### DECISIVENESS (8)

**de1 — You Pick Dinner** · 10 min · Easy · LangLoad: Medium · Ages 5–10 · Nothing
- **Description:** Today, they decide what the family eats for one meal. Real choice, real ownership.
- **Hidden curriculum:** Real-stakes decision making. Most kids only get fake choices ("which color shirt"). One real decision a week builds the muscle for adult life.
- **How to:** Give 3 realistic options for dinner. They choose. Whatever they choose, you eat. No second-guessing. They see: my choice matters, and choices have consequences (a family ate this because of me).
- **Watch for:** Speed of decision. Anxiety or excitement? Over time, do they own choices?
- **One line to say:** "Your choice is a real choice. We're all eating it."
- **Trap:** Overriding the choice if it's "wrong." That teaches the choice was fake. Honor the choice.
- **Adapt easier:** 2 options. Adapt harder: Open choice, must plan it including ingredients.
- **Works well with:** cooking, eating, family

**de2 — 60 Second Choice** · 5 min · Medium · LangLoad: Medium · Ages 6–10 · Nothing
- **Description:** Give them 2 options. They have 60 seconds to decide AND say why.
- **Hidden curriculum:** Comfort with deciding under time pressure. Adults who can't do this become chronic procrastinators.
- **How to:** Two real options (which shirt? which snack? which park?). 60-second timer. They pick AND give a reason. Practice deciding under mild pressure. Don't reverse their choice afterward.
- **Watch for:** Quality of reasons. Speed. Do they learn to commit?
- **One line to say:** "Deciding is a skill. The faster you practice, the better you get."
- **Trap:** Reversing their choice later "for their good." That kills the practice.
- **Adapt easier:** 90 seconds, 2 simple options. Adapt harder: 3 options, 30 seconds.
- **Works well with:** anything choice-based

**de3 — The Trade-Off** · 10 min · Stretch · LangLoad: High · Ages 7–10 · Nothing
- **Description:** Give a choice where both options have pros and cons. They must list trade-offs before choosing.
- **Hidden curriculum:** Understanding that all real choices have costs. Adults who never learned this become paralyzed or impulsive.
- **How to:** "You can have an extra hour of play OR an ice cream — not both." They must say: "If I pick play, I lose ice cream. If I pick ice cream, I lose play." Then choose. The point: real choices have costs.
- **Watch for:** Can they hold both sides in mind? Many kids only see the gain side.
- **One line to say:** "Every yes is also a no to something. Smart deciders see both."
- **Trap:** Sneakily giving them both. Defeats the practice.
- **Adapt easier:** Very clear trade-off. Adapt harder: 3 options with multiple trade-offs.
- **Works well with:** anything daily

**de4 — Plan The Day** · 15 min · Medium · LangLoad: High · Ages 7–10 · Paper-pen
- **Description:** A weekend morning, they plan the family's day. Real plan, real execution.
- **Hidden curriculum:** Planning + ownership + reality testing. Their plan meets the real world, and they learn what worked and what didn't.
- **How to:** Sit with them. They decide: 3 activities, when, in what order. Write it. Then DO it (with reasonable flexibility). Debrief: what worked, what they'd change.
- **Watch for:** Realism of plan. Do they learn from execution?
- **One line to say:** "Plans meet reality and learn from it. That's how planning gets good."
- **Trap:** Overriding the plan when it's inconvenient. Honor it imperfectly rather than not at all.
- **Adapt easier:** Just 2 activities. Adapt harder: Half-day with budget constraints (₹500 for the outing).
- **Works well with:** weekends, family time

**de5 — Buy It Yourself** · 15 min · Stretch · LangLoad: High · Ages 7–10 · Outdoors
- **Description:** Give them ₹50. Send them into a shop to buy something specific. Stand outside.
- **Hidden curriculum:** Independent action in the real world. One of the most confidence-building moments a 7-year-old can have.
- **How to:** Pre-decide what they'll buy (bread, a specific snack). Give ₹50. They go alone or with you watching from distance. They talk to shopkeeper, take change, walk out. Big confidence builder.
- **Watch for:** Independent action. The decision is the whole thing.
- **One line to say:** "You did that without me. You can do more than you think."
- **Trap:** Hovering at the door. They need to feel alone.
- **Adapt easier:** You walk in with them, they handle only payment. Adapt harder: They pick WHAT to buy with ₹100 within a category.
- **Works well with:** outdoor exploring, going to shops

**de6 — Pick A Side** · 10 min · Medium · LangLoad: High · Ages 7–10 · Nothing
- **Description:** Give them a debatable question. They must pick a side and defend it.
- **Hidden curriculum:** Taking a position. Many adults won't commit to a view on anything. Comfortably defending a position is a rare skill.
- **How to:** "Should kids have homework?" "Is summer better than winter?" "Are dogs better than cats?" They must commit to one side AND give 3 reasons. No "both" allowed. Then switch sides next time.
- **Watch for:** Quality of argument. Comfort with picking a position.
- **One line to say:** "Picking a side and defending it isn't the same as being right. It's a skill of its own."
- **Trap:** Letting them off the hook with "both." That defeats it.
- **Adapt easier:** Low-stakes preferences (favorite fruit). Adapt harder: Real ethical dilemmas appropriate to age.
- **Works well with:** any conversation, stories

**de7 — The Reversible Test** · 5 min · Medium · LangLoad: High · Ages 7–10 · Nothing
- **Description:** Teach: small reversible decisions, decide fast. Big irreversible ones, decide slow.
- **Hidden curriculum:** A mental model that good decision-makers use throughout life. Speed-matched-to-stakes.
- **How to:** Discuss: "If you pick the wrong ice cream flavor, can we fix it? (Yes, next time.) If we cut your hair too short, can we fix it fast? (No, takes time.)" Practice categorizing daily choices: fast or slow?
- **Watch for:** Do they start using this language themselves? That's the goal.
- **One line to say:** "Reversible? Decide fast. Permanent? Decide slow."
- **Trap:** Over-explaining. Two examples, then practice.
- **Adapt easier:** Just two clear examples. Adapt harder: Add medium decisions, discuss gray areas.
- **Works well with:** any decision

**de8 — Stick With It** · 10 min · Medium · LangLoad: Medium · Ages 6–10 · Nothing
- **Description:** They made a choice. Now sit with the consequence without complaining.
- **Hidden curriculum:** Accepting consequences. Adults who can't do this blame others endlessly. Sitting with your own choice is a deep adult skill.
- **How to:** They chose chips over chocolate. They chose the park over the mall. When they later regret it: don't reverse. Acknowledge: "Yeah, sometimes our choice isn't the best. That happens. Next time you'll have more information."
- **Watch for:** Acceptance of consequences. This builds adult decision-making.
- **One line to say:** "Living with your choice is part of choosing."
- **Trap:** Rescuing them from regret. Regret is the teacher here. Stay warm but firm.
- **Adapt easier:** Very low stakes only. Adapt harder: Bigger choices, real consequences (within safety).
- **Works well with:** daily life

---


## 9. Tech Stack & Architecture

### Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Server components, image opt, easy Vercel deploy, PWA support |
| Language | **TypeScript** (strict) | Catches half the bugs at compile time |
| Styling | **Tailwind CSS** + CSS variables | Tokens via CSS vars, utility for speed |
| Storage (local) | **Dexie.js** over IndexedDB | Best-in-class IDB wrapper, sync-friendly schema |
| State | **Zustand** | Minimal, no boilerplate, plays well with Dexie |
| Forms | Native + small helpers | No heavy form lib needed for this UI |
| Icons | **Lucide React** | Apple-feel stroke icons |
| Animation | **Framer Motion** | iOS-feel spring transitions |
| PWA | **next-pwa** | Add-to-home-screen, offline shell |
| Deploy | **Vercel** | Free tier, your existing account |
| Source | **GitHub** | Your existing account |

### Folder structure

```
fokus/
├── app/
│   ├── (intro)/
│   │   ├── intro/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (main)/
│   │   ├── today/page.tsx
│   │   ├── activity/[id]/page.tsx
│   │   ├── log/[activityId]/page.tsx
│   │   ├── library/page.tsx
│   │   ├── map/page.tsx
│   │   ├── map/skill/[skill]/page.tsx
│   │   ├── profile/page.tsx
│   │   └── profile/settings/page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── manifest.ts
├── components/
│   ├── ui/                  # Primitive components (Button, Card, Input, etc.)
│   ├── layout/              # AppShell, TabBar, PageHeader
│   ├── onboarding/          # Onboarding-specific screens
│   ├── activity/            # ActivityCard, ActivityDetail
│   ├── map/                 # SkillBar, SessionList, StatCard
│   └── shared/              # Logo, EmptyState, etc.
├── lib/
│   ├── db/
│   │   ├── schema.ts        # Dexie schema
│   │   ├── client.ts        # Dexie instance
│   │   ├── parents.ts       # Parent queries
│   │   ├── children.ts      # Child queries
│   │   ├── sessions.ts      # Session queries
│   │   └── observations.ts  # Observation queries
│   ├── engine/
│   │   ├── scoreActivity.ts # The scoring function
│   │   ├── pickActivity.ts  # The selection function
│   │   ├── confidence.ts    # Skill confidence calculation
│   │   └── types.ts
│   ├── content/
│   │   ├── activities.ts    # ALL 64 activities (typed)
│   │   ├── skills.ts        # Skill definitions
│   │   └── intro.ts         # Intro carousel content
│   ├── store/
│   │   ├── useAppStore.ts   # Zustand: current child, view state
│   │   └── useUIStore.ts    # Zustand: UI state (modals, transitions)
│   └── utils/
│       ├── dates.ts
│       ├── ids.ts           # uuid generation
│       └── cn.ts            # className helper
├── public/
│   ├── icons/               # PWA icons
│   └── manifest.json
├── styles/
│   └── tokens.css           # CSS variables (light + dark)
├── types/
│   └── index.ts             # Shared types
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── SPEC.md                  # This file
```

### Supabase + Dexie split

Supabase is the source of truth. Dexie is the local cache and the offline write queue. Schemas mirror each other 1:1 so a Dexie row can be serialised into a Supabase insert and back.

- Every record has `id` (uuid) generated client-side so writes can land in Dexie before they reach Supabase.
- `activity_log` rows carry a `synced: boolean` flag; `lib/sync.ts` walks pending rows on boot and pushes them up.
- `lib/db/*.ts` is the Dexie surface. Components never read Supabase directly; they go through `useChild` / `useActivityLog` which read Dexie. `lib/sync.ts` is the only module that writes Supabase from the client.

### PWA setup

```json
// manifest.json
{
  "name": "Fokus",
  "short_name": "Fokus",
  "description": "One small moment a day with your child",
  "start_url": "/today",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#FFFFFF",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

---

## 10. Build Sequence

Build in this order. Each step produces something testable. Don't move forward until the previous works.

### Phase 1 — Foundation (2-3 days)

**Step 1: Project setup**
- Initialize Next.js 15 with TS + Tailwind
- Set up folder structure
- Add CSS variables (tokens) in `globals.css`
- Configure tailwind to use those CSS vars
- Verify dark mode toggle works

**Step 2: Core UI primitives**
- `Button` (primary/secondary/tertiary/destructive)
- `Card`
- `Input` and `Textarea`
- `Chip` (selectable, multi-select)
- `Sheet` (bottom sheet, iOS style)
- `PageHeader` (large title, back button)
- `TabBar` (bottom nav, 4 items)

**Step 3: Database layer**
- Set up Dexie with schemas
- Write `lib/db/parents.ts`, `children.ts`, `sessions.ts`, `observations.ts`
- Verify CRUD works in browser console

### Phase 2 — Onboarding (2 days)

**Step 4: Intro carousel** (5 screens, swipeable)
**Step 5: Parent setup** (1 screen, name)
**Step 6: Child onboarding** (8 steps, fully working with form validation and persistence)

By end of Phase 2: a new user can install, see intro, name themselves, create a child. Their data persists across browser reloads.

### Phase 3 — Today flow (3 days)

**Step 7: Activities content**
- Type all 64 activities into `lib/content/activities.ts`
- Verify TypeScript compiles cleanly with full data
- Build a debug page that lists all 64 (for QA)

**Step 8: Engine**
- Implement `scoreActivity`
- Implement `pickActivity`
- Implement `skillConfidence`
- Write unit tests for engine (at least 10 cases)

**Step 9: Today screen**
- Time + mood inputs
- Generate activity button → routes to activity detail

**Step 10: Activity detail screen**
- Render all activity content layers
- "Pick a different one" button → regenerates
- "We did it" button → routes to log screen

**Step 11: Log session screen**
- Response selector
- Note field
- Save → writes to DB, returns to Today

### Phase 4 — Insights & Library (2 days)

**Step 12: Library screen**
- All activities, filterable by skill
- Tap → activity detail

**Step 13: Map screen**
- Stats (streak, days, sessions)
- Skill bars
- Recent sessions list
- Skill detail page (sessions for one skill)

### Phase 5 — Profile & Polish (2 days)

**Step 14: Profile screen**
- Children list
- Switch active child
- Add new child (re-runs onboarding)
- Delete child (with confirmation)

**Step 15: Settings screen**
- Theme toggle
- Data export (download JSON)
- Delete all data (with confirmation)

**Step 16: PWA setup**
- Manifest
- Service worker
- App icons (1 set of sizes)
- Test "Add to home screen" on iOS and Android

### Phase 6 — Final pass (1 day)

**Step 17: Polish**
- Loading states everywhere
- Empty states everywhere
- Error states everywhere
- Animation pass (transitions feel native)
- Accessibility (focus states, ARIA, color contrast)

**Step 18: Deploy**
- Push to GitHub
- Connect Vercel
- Deploy
- Test on actual phone via the deployed URL

### Total estimate: ~12 working days

For a first solid version. Cloud sync, advanced features come later.

---

## 11. Claude Code Prompts

Paste these into Claude Code one at a time. Each is self-contained and produces a verifiable output. Don't move on until the previous works.

### Setup prompt (run once, at start)

```
I'm building Fokus, a parenting development app. Read /SPEC.md fully before doing anything.

The full spec is in SPEC.md. Treat it as the source of truth. If anything in the spec contradicts your default choices (framework, styling, design), the spec wins.

Set up the project:
1. Initialize Next.js 15 with App Router, TypeScript (strict), Tailwind CSS
2. Create the folder structure exactly as in section 9 of the spec
3. Set up the CSS tokens (section 4 of spec) in /styles/tokens.css and import in globals.css
4. Configure tailwind.config.ts to read these CSS variables so I can use them as Tailwind utilities
5. Set up dark mode using next-themes with class strategy
6. Install dependencies: dexie, zustand, framer-motion, lucide-react, next-themes, next-pwa, clsx, tailwind-merge

Verify: I can run `npm run dev`, see a page that says "Fokus" using the Apple-style font stack, and toggle between light and dark mode.

Don't build any screens yet. Just foundation.
```

### Prompt 2 — UI primitives

```
Read SPEC.md section 4 (Design System) again before starting.

Build these primitive components in /components/ui/:

1. Button (variants: primary, secondary, tertiary, destructive; sizes: sm, md, lg; full Apple-style behavior including 50px min height on md+, scale(0.97) tap feedback, disabled state)
2. Card (default + interactive variants)
3. Input (text input, 50px height, 16px font, focus state with accent border)
4. Textarea (multi-line, same styling as Input)
5. Chip (selectable, toggles between filled and outline based on `selected` prop)
6. PageHeader (large title style, optional back button with text + chevron-left, optional right action)
7. TabBar (bottom fixed nav, 4 tabs max, icon + label, accent for active)
8. Sheet (bottom sheet that slides up from bottom, iOS style with spring animation via framer-motion)
9. Avatar (circle, initial of name on accent-bg)
10. EmptyState (centered icon + title + description + optional CTA)

For each component:
- Use the CSS variables from /styles/tokens.css (don't hardcode colors)
- Support both light and dark mode automatically (since they're CSS vars)
- Use Lucide icons where iconography is needed
- TypeScript props with sensible defaults

Create a /app/_dev/ui/page.tsx that renders every variant of every primitive for visual QA. This page is internal — don't link to it from anywhere user-facing.

Verify: visiting /_dev/ui shows all primitives, each looks Apple-clean, dark mode toggle works, tap feedback feels native on mobile (test in browser device simulator).
```

### Prompt 3 — Database layer

```
Read SPEC.md section 5 (Data Model) before starting.

Set up the Dexie database layer:

1. Create /types/index.ts with all the TypeScript types from spec section 5 (Parent, Child, Session, Observation, Activity, SkillKey)
2. Create /lib/db/client.ts: Dexie instance, schema version 1 with indexes from the spec
3. Create /lib/db/parents.ts with: createParent, getParent, updateParent, getCurrentParent (returns first parent)
4. Create /lib/db/children.ts with: createChild, listChildren, getChild, updateChild, deleteChild
5. Create /lib/db/sessions.ts with: createSession, listSessionsForChild, getSessionsByDate, deleteSession
6. Create /lib/db/observations.ts with: createObservation, listObservationsForChild

All functions are async. Use uuid v4 for IDs (install `uuid` and `@types/uuid`). All records get `createdAt` and `updatedAt` on write. Set `_syncStatus: 'local'` on all writes.

Create /app/_dev/db/page.tsx that:
- Has buttons to create a sample parent, sample child, sample session
- Lists everything in the DB
- Has a "wipe all" button

Verify: I can create a parent and child via the dev page, refresh the browser, and they persist. Wiping works.
```

### Prompt 4 — Content (activities + skills)

```
Read SPEC.md section 8 (Activity Library) before starting. This is the largest content section.

Create /lib/content/activities.ts:
- Type the ACTIVITIES array as Activity[] (using the type from /types/index.ts)
- Enter ALL 64 activities from spec section 8 with COMPLETE content for every field (id, title, skill, duration, difficulty, languageLoad, ageRange, requires, description, hiddenCurriculum, howTo, watchFor, oneLineToSay, trap, adapt.easier, adapt.harder, worksWellWith)
- Don't summarize or shorten any field. Copy the spec content as-is, only restructuring into the type schema.

Create /lib/content/skills.ts:
- Export SKILLS object keyed by SkillKey
- Each skill has: label (the user-facing name), description (one line), iconName (Lucide icon name as string), color (a hex from a curated palette below)

Skill colors (Apple-style restraint — desaturated, distinguishable):
- curiosity:    #C9923E (warm amber)
- language:     #4A7C8E (calm teal)
- emotional:    #B5736E (muted terracotta)
- thinking:     #5E6B7A (slate blue)
- resilience:   #6B8068 (forest green)
- creativity:   #8A6E95 (dusty violet)
- observation:  #7A6E5C (warm gray)
- decisiveness: #A8825E (caramel)

Create /lib/content/intro.ts with the 5 intro screens from section 1 of the spec.

Verify: TypeScript compiles. Update /app/_dev/ui/page.tsx to list every activity in a simple table to confirm all 64 loaded correctly.
```

### Prompt 5 — Engine

```
Read SPEC.md section 7 (The Adaptive Engine) before starting.

Implement the engine:

1. /lib/engine/types.ts — input/output types for the engine
2. /lib/engine/scoreActivity.ts — exports scoreActivity(activity, child, sessions, context): number. Implement EXACTLY as in spec section 7, all 10 scoring rules. Use the responseValue helper.
3. /lib/engine/pickActivity.ts — exports pickActivity(child, sessions, context): Activity. Implement weighted-random top-3 selection.
4. /lib/engine/confidence.ts — exports skillConfidence(skill, sessions): number (0-100) and skillCoverage(sessions): Record<SkillKey, number>

Write unit tests in /lib/engine/__tests__/:
- A child with hesitant English gets boosted language activities
- A child with low mood gets easier difficulties
- A neglected skill (0 sessions in 7 days) gets a 30-point boost
- A recently struggled skill stops getting hard activities
- An interest-matched activity scores higher
- An activity that matches "fleesFrom" scores lower
- Same activity not picked twice in a row

Use vitest. Configure if needed.

Create /app/_dev/engine/page.tsx where I can:
- Pick a test child profile (or use the one in DB)
- Select time + mood
- Click "Pick activity" → see the chosen activity AND the top 5 scored activities with their scores

Verify: all unit tests pass. The dev page returns plausible picks given different inputs.
```

### Prompt 6 — Onboarding

```
Read SPEC.md section 6, screens S1-S3 before starting.

Build the onboarding flow:

1. /app/(intro)/intro/page.tsx — 5-screen swipeable carousel (use framer-motion). Each screen is full-height, single piece of content, swipe left to advance. Skip button top-right. Final screen has "Begin" CTA that routes to /onboarding/parent.

2. /app/(intro)/onboarding/parent/page.tsx — single name input, creates parent, routes to /onboarding/child.

3. /app/(intro)/onboarding/child/page.tsx — 8-step form, one step per render (no scrolling), progress bar at top. Internal state for the in-progress child object. Each step has the exact content from section 6 of the spec.
   - Back button on every step except first (returns to previous step)
   - Continue button (disabled until step is valid)
   - On final "Start with [Name]" tap: create child in DB, set as active in zustand store, route to /today

4. /lib/store/useAppStore.ts — Zustand store with:
   - activeChildId: string | null
   - setActiveChild(id: string): void
   - currentView: 'today' | 'library' | 'map' | 'profile'
   - setView(v): void
   Persist to localStorage (zustand/middleware).

5. /app/layout.tsx — root layout: on mount, check if any parent exists. If not, redirect to /intro. If yes but no children, redirect to /onboarding/child. If yes and children exist, allow whatever route.

Verify: full first-run flow works. Refreshing mid-onboarding resumes appropriately. Completed onboarding lands on /today and shouldn't re-trigger.
```

### Prompt 7 — Today flow

```
Read SPEC.md screens S4, S5, S6 before starting.

Build the Today flow:

1. /app/(main)/today/page.tsx — implements the Today screen from S4
   - Reads active child from store + DB
   - Time and mood as local state (chips)
   - "Get today's moment" calls pickActivity, then routes to /activity/[id] with context query params (?time=medium&mood=normal)
   - Shows count of sessions today if > 0

2. /app/(main)/activity/[id]/page.tsx — implements activity detail from S5
   - Reads activity from /lib/content/activities.ts by id
   - Renders ALL content layers from spec exactly as described, in the order: header (skill, duration, difficulty), title, description, hiddenCurriculum section, howTo section, watchFor section, oneLineToSay section (styled distinctively as a quote), trap section, adapt section
   - Sticky bottom bar with "Pick another" (goes back to /today) and "We did it" (goes to /log/[id])

3. /app/(main)/log/[activityId]/page.tsx — implements log screen from S6
   - 6 response options (use Chip or RadioCard)
   - Optional note textarea
   - Save creates Session in DB, returns to /today

4. /components/layout/AppShell.tsx — the wrapping shell for all (main) routes: includes TabBar at bottom. Active tab inferred from path.

5. /components/activity/ActivityDetail.tsx — reusable component used by both Today and Library detail pages.

Verify:
- Pick a time and mood, get an activity, see its full detail, complete it, log it, return to Today.
- "Pick another" gives a different activity.
- Sessions persist after refresh.
- TabBar shows correctly and switching tabs preserves state.
```

### Prompt 8 — Library + Map

```
Read SPEC.md screens S7 (Library) and S8 (Map) before starting.

Build:

1. /app/(main)/library/page.tsx — implements S7
   - Filter chips: "All" + 8 skill names
   - Activity cards in a vertical list, tappable
   - Tap routes to /activity/[id] (reuse the existing detail page)

2. /components/activity/ActivityCard.tsx — used in library; shows skill color dot, skill label, duration, difficulty, title, description.

3. /app/(main)/map/page.tsx — implements S8
   - 3-stat grid (streak, total days, sessions). Calculate from DB.
   - Skill development bars: for each of 8 skills, show count of sessions and confidence bar (use /lib/engine/confidence.ts)
   - Recent sessions: last 5, with activity title, response, optional note. Use /components/map/SessionCard.tsx
   - Each skill bar tappable → /map/skill/[skill]

4. /app/(main)/map/skill/[skill]/page.tsx — skill detail:
   - All sessions for that skill, reverse chronological
   - Trend mini-chart (optional, can be simple: dots colored by response)
   - "Activities in this skill" list

5. /components/map/StatCard.tsx, SkillBar.tsx, SessionCard.tsx as needed.

Verify: Map populates correctly with logged sessions. Library filters work. All routes are reachable via the TabBar.
```

### Prompt 9 — Profile + Settings

```
Read SPEC.md screens S9 and S10 before starting.

Build:

1. /app/(main)/profile/page.tsx
   - List all children with avatar (initial), name, age, session count, active indicator
   - "Switch" button on inactive children (changes active in store, routes to /today)
   - "+ Add another child" button → routes to /onboarding/child (works for additional children, not just first)
   - Trash icon on each child (except active) with confirmation
   - "Settings" link → /profile/settings

2. /app/(main)/profile/settings/page.tsx
   - Theme: 3 options (System, Light, Dark) using next-themes
   - Reminder time picker (just stores in parent.preferences for now; no actual notification logic needed yet)
   - "Export your data" button: downloads a JSON of all parent + children + sessions + observations
   - "Delete all data" button: wipes DB with double confirmation, routes back to /intro

Verify: switching children updates Today and Map correctly. Adding a 2nd child works without breaking the first. Theme persists. Data export gives a valid JSON file.
```

### Prompt 10 — PWA + polish

```
Read SPEC.md sections 4 (Design System) and 9 (Tech Stack) before starting.

PWA setup:
1. Configure next-pwa in next.config.js
2. Create /app/manifest.ts with the manifest from spec section 9
3. Generate 3 app icons (192x192, 512x512, maskable 512x512) — use a simple fokus-style icon with the accent color. You can use a simple SVG-based icon for now.
4. Service worker should cache the app shell + activities content (everything except DB)

Polish pass — go through every screen and check:
- Loading state (skeleton or spinner) for any async data
- Empty state on every list view (use EmptyState component)
- Error boundary at the layout level
- Tap feedback on every interactive element
- Page transitions: 250ms fade + 8px slide-up using framer-motion
- Focus rings on inputs (accent color, 2px)
- Color contrast meets WCAG AA in both light and dark mode
- Text never wraps awkwardly on mobile (test 375px width)
- iOS safe area insets respected (padding-bottom for home indicator)

Add a simple Toast component for save confirmations / errors.

Verify: lighthouse audit gives 90+ on PWA, performance, accessibility. App installs to iOS home screen. Works offline (cached pages).
```

### Prompt 11 — Deploy

```
Final step. Read SPEC.md section 10 to confirm we've covered everything.

1. Run through the full user journey: install → intro → onboarding → 3 days of sessions → check map → add second child → settings → export data → delete data → re-install.
2. Fix any bugs found.
3. Add a README.md at root explaining: what Fokus is, tech stack, how to run locally, how to deploy.
4. Initialize git, commit, push to GitHub (assume the repo URL is already configured).
5. Set up Vercel deployment from main branch.
6. Confirm deployed URL works on actual mobile device.

After deploy, give me:
- The Vercel URL
- A summary of what's working
- A list of known issues / things to improve in v2 (don't fix them — just list them)
```

---

## Closing notes

This spec is intentionally complete. If Claude Code is uncertain about any decision, defer to the principle and screen specs above. Don't invent features. Don't add gamification. Don't make the child the user.

When in doubt: *the parent is the user, the child is never measured, the relationship is the product.*

---

**End of spec.**
