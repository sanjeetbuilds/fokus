# Fokus design tokens

Extracted from `design/Fokus.html` (round-4 reference), then adjusted
per founder direction:
- White page bg (not the reference's cream)
- Smaller page titles (36-40, not the reference's 50)
- Surface tint `#FBFAF7` carries the reference's warmth on cards / inputs
- 8-skill palette mapped onto the reference's smaller color set, with
  the emotional / creativity coral conflict resolved

> The reference is older than the current app. Several features in it
> were deliberately deleted from the live product (Compass tab,
> personality markers, "Skills Earned" counters, Milestones Journal,
> child mood ratings, hardcoded child names, Tune Framework sliders,
> "Growing Fast!" subtitles). NONE of those are restored. This doc is
> visual vocabulary only — fonts, colors, card styles, spacing, radii,
> pill styling, button styling.

## Fonts

| Family | Source | Weights | Notes |
| --- | --- | --- | --- |
| `Plus Jakarta Sans` | Google Fonts (next/font) | 300, 400, 500, 600, 700, 800 | Single family. The **300** weight is what gives the reference its calm feeling — used for quiet subheads, taglines, footer hints. |

```ts
const sans = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});
```

Default body letter-spacing: -0.01em (set on html/body in
`app/globals.css`).

## Colors

| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#FFFFFF` | Page background. Founder override (reference: `#E9E6DC`). |
| `--surface-tint` | `#FBFAF7` | Cards / input fills / Today's header zone. Barely-perceptible warm white that replaces the reference's cream as the "warm surface" while keeping the page white. |
| `--ink` | `#252630` | Brand ink (reference `--dark`). |
| `--ink-secondary` | `#8E8D9B` | Secondary text. Captions, hints. (reference `--gray`) |
| `--ink-tertiary` | `#C2C0CB` | Tertiary text, disabled state. (reference `--gray-lt`) |
| `--line` | `#E5E3DA` | Hairlines / dividers / card borders / pill bg. (reference `--gray-bd`) |
| `--accent` | `#9CA5FF` | Brand accent. Active tab, small text accents, focus rings. (reference `--purple`) |
| `--accent-soft` | `#B5BAFF` | Lighter brand for hover / soft fills. (reference `--lt-purple`) |
| `--lav` | `#C5BFEF` | Lavender (reference `--lav`) |
| `--amber` | `#F4C84A` | Amber — used as the Curiosity skill color (reference `--amber`) |
| `--coral` | `#E8836A` | Coral — used as the Creativity skill color (reference `--coral`) |
| `--green` | `#5DC87A` | Green — used as the Resilience skill color (reference `--green`) |

### Skill palette mapping

The 8-skill palette is REMAPPED onto the reference's smaller color
set. Two skills (emotional + creativity) both want coral; the conflict
is resolved by giving emotional a warmer salmon shade.

| Skill | Previous hex | New hex | Source |
| --- | --- | --- | --- |
| Curiosity | `#F2C94C` | **`#F4C84A`** | reference `--amber` |
| Language confidence | `#A8A4E8` | **`#9CA5FF`** | reference `--purple` |
| Emotional awareness | `#E8A4B8` | **`#E89070`** | warmer salmon — distinct from creativity |
| Thinking clarity | `#6B5B95` | `#6B5B95` (kept) | no reference equivalent |
| Resilience | `#7DB87A` | **`#5DC87A`** | reference `--green` |
| Creativity | `#E8806B` | **`#E8836A`** | reference `--coral` |
| Observation | `#5FB8B0` | `#5FB8B0` (kept) | no reference equivalent |
| Decisiveness | `#3D5A80` | `#3D5A80` (kept) | no reference equivalent |

The emotional/creativity adjustment is a judgment call — flagged so
the founder can refine. Both reading as "warm orange-pink" is the
trade-off for losing the dedicated `#E8A4B8` pink we previously had.

## Type scale

| Token | Size | Weight | Tracking | Line | Where |
| --- | --- | --- | --- | --- | --- |
| Page title | 36-40px | 800 | -0.025em | 1.05 | Today's Focus / Activity Library / What we've done / Profile. **Founder override — reference is 50px which reads too heavy on a white surface.** |
| Headline (h1) | 38px | 800 | -0.03em | 1.1 | Onboarding, sign-in, activity detail title |
| Sub-headline | 30px | 800 | -0.025em | 1.1 | Today activity card title |
| Section header | 22px | 700 | -0.02em | — | "By skill", "Recent" |
| Eyebrow / small-caps | 11-13px | 700 | +0.06em uppercase | — | "CURRENT MARKERS" / "BY SKILL" / "RECENT" |
| Card title (in stat card) | 22-26px | 800 | -0.025em | — | On colored stat-card bg, white text |
| Brand wordmark | 18px | 800 | -0.02em | — | AppHeader "Fokus" |
| Body | 14-16px | 400 | — | 1.5-1.6 | Body copy |
| Quiet / footer text | 14px | **300** | — | 1.5 | "One thing a day, with {name}." footer line on Today, intro-slide subtitles |
| Meta / captions | 12-13px | 400 | — | 1.4 | Dates, durations, micro labels |

## Spacing

- Page horizontal padding: 24px
- Card padding: 18px (reference `.wcard`)
- Stat card padding: 16-18px
- Default section vertical rhythm: 24-32px between blocks
- Input height: 52px

## Radii

| Use | Radius |
| --- | --- |
| Card (default) | **22px** (was 20 last pass; reference is 20 on `.wcard` but bigger reads softer on the white surface) |
| Stat card | 22px (reference `.sc`) |
| Input | 14px (reference `.f-inp`) |
| Pill / chip | 20px (reference `.pill` / `.pt`) |
| CTA button | 27px (reference `.cta` half of 54-height) |
| Icon square (SkillIcon) | 16px (reference `.act-ico`) |
| Avatar 48px | round (24) |
| Avatar 96px | round (48) |

## Components

### Primary CTA

```
height: 54px;
border-radius: 27px;
background: #252630;
color: #FFFFFF;
font: 700 16px Plus Jakarta Sans;
letter-spacing: -0.01em;
```

### Pill / chip

```
.pill {
  background: #E5E3DA;
  color: #252630;
  font: 600 13px Plus Jakarta Sans;
  padding: 8px 16px;
  border-radius: 20px;
}
.pill.on {
  background: #252630;
  color: #FFFFFF;
}
```

### Pill-tab (filter pills, white surface)

```
.pt {
  background: #FFFFFF;
  border: 1.5px solid #E5E3DA;
  color: #252630;
  font: 600 13px Plus Jakarta Sans;
  padding: 7px 16px;
  border-radius: 20px;
}
.pt.on {
  background: #252630;
  color: #FFFFFF;
  border-color: #252630;
}
```

### Card — solid (wcard)

```
background: #FFFFFF;
border: 1.5px solid #E5E3DA;
border-radius: 22px;
padding: 18px;
```

### Card — dashed (dcard)

For activity items in the reference. We use the dashed variant on the
Today activity card to differentiate "today's prompt" from the solid
data cards on Track.

```
background: #FFFFFF;
border: 1.5px dashed #C2C0CB;  /* dashed uses the lighter gray */
border-radius: 22px;
padding: 18px;
```

### Stat card (colored bg, white text)

```
background: var(--skill-color);  /* one of amber/purple/coral/green/lavender */
color: #FFFFFF;
border-radius: 22px;
padding: 16-18px;
min-height: ~130px;
```

Number inside: 36 / 800 / -0.025em / white.
Label inside: 12 / 600 / rgba(255,255,255,0.92).
Sub-label inside: 12 / 400 / rgba(255,255,255,0.7).

### Input

```
height: 52px;
border-radius: 14px;
border: 1.5px solid #E5E3DA;
background: #FBFAF7;          /* surface tint — gives inputs a warm wash */
padding: 0 16px;
font: 400 16px Plus Jakarta Sans;
color: #252630;
```

Field label above input:

```
.f-lbl {
  font: 700 11px Plus Jakarta Sans;
  color: #8E8D9B;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 7px;
}
```

### Activity row (Library `.act-card`)

```
display: flex;
align-items: center;
gap: 14px;
padding: 14px 0;
border-bottom: 1px solid #E5E3DA;
```

- 50×50 icon square on the left, radius 16, skill-color bg
- Title (16 / 700) + tag-pill row + duration meta, vertical stack
- 34×34 round chevron button on the right, `#E5E3DA` bg

### Bottom nav

```
height: 78px;
background: #FFFFFF;
border-top: 1px solid #E5E3DA;
.nb-lbl { font: 500 11px; color: #C2C0CB; }
.nb.on .nb-lbl { color: #9CA5FF; font-weight: 700; }
.nb-ico { opacity: 0.38; }
.nb.on .nb-ico { opacity: 1; color: #9CA5FF; }
```

### Section headers

```
font: 700 13px Plus Jakarta Sans;
text-transform: uppercase;
letter-spacing: 0.06em;
color: #8E8D9B;
```

## Today refresh

Two additions beyond pure visual tokens, both quiet:

1. **Warm header zone** — wrap the avatar + name + age + pronouns row
   in a soft `#FBFAF7` container with 16-radius and 16-padding. Gives
   the top of the page a "header zone" instead of floating elements.

2. **Quiet footer line** — below the activity card, with 32px top
   margin, centered:

   ```
   One thing a day, with {child name}.
   font: 300 14px Plus Jakarta Sans;
   color: #8E8D9B;
   ```

   This is the product's tagline as a quiet bottom-edge anchor — no
   stats, no streaks, no measurement.

Things explicitly NOT added to Today (the reference has them; we don't):

- Multiple stat tiles (Calm Practice, Movement, Today's Theme, etc).
- Child's Diary tabs (Today / Yesterday / Week / Month) and the
  timeline below.
- Tune-today sliders, time chips, mood chips.
- Streak counter, "X activities done", "Growing Fast" subtitle.
- Personality markers, "Skills Earned" tile.

## What's deliberately not restored from the reference

| Reference element | Why skipped |
| --- | --- |
| Compass tab / "Invisible Strengths" / personality cards | Personality profiling — deleted. |
| "Skills Earned: 08" counter | Child measurement. |
| Milestones Journal scroll | Child measurement / personality timeline. |
| "Growing Fast!" / "Growing Well" subtitles | Child measurement language. |
| Hardcoded "Leo Harrison" name | Comes from `useChild` now. |
| Tune Framework sliders (mood / energy) | "Tune today" — deleted. |
| Page bg `#E9E6DC` cream | Founder kept `#FFFFFF`. |
| Page title 50px | Founder shrank to 36-40 on white. |
| Stat cards 4-tile grid on Today | Reintroduces choice surface — one activity per day stays. |
| Child's Diary tabs | Surfaces engagement metadata about the child. |
| Reference's emoji activity icons | SkillIcon Lucide glyphs kept. |
| Blue gradient avatar | Ink-circle-with-initial kept. |
| Reflect overlay | Replaced by `/done/[id]` route. |
