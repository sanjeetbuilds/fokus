# Fokus design tokens

Extracted verbatim from `design/Fokus.html` (round-4 reference). This
is the visual system the founder wants the app to match.

> The reference is older than the current code. Where the reference
> contains a feature/page we have intentionally deleted (Tune today,
> Menu button, settings page, "Invisible Strengths"/personality
> profile, "Child's Diary" tabs, emoji activity icons), those are
> NOT restored. Tokens still apply to the surfaces that remain.

## Fonts

| Family | Source | Weights | Where |
| --- | --- | --- | --- |
| `Plus Jakarta Sans` | Google Fonts | 300, 400, 500, 600, 700, 800 | Everywhere. Single family. |

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

Fallback stack: `'Plus Jakarta Sans', sans-serif`.

No serif. No icon font. No body-vs-display split — same family throughout.

## Surfaces (color)

| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#E9E6DC` | Page background. **Founder override: keep `#FFFFFF` instead** of cream. The warm tone is restored only via borders / pill backgrounds. |
| `--w` | `#FFFFFF` | Card / panel surface |
| `--dark` | `#252630` | Brand ink. Primary text + primary button bg. **Founder uses `#1A1A1A`** (very close; keep #1A1A1A for consistency with prior pass). |

## Text + lines

| Token | Hex | Use |
| --- | --- | --- |
| `--gray` | `#8E8D9B` | Secondary / muted text (captions, hints, time stamps) |
| `--gray-lt` | `#C2C0CB` | Tertiary text + ghost icons |
| `--gray-bd` | `#E5E3DA` | Borders + pill backgrounds. **Warm beige.** This replaces the colder `#EEEEEE` we've been using. |

## Brand + skill accents

| Token | Hex | Use in reference |
| --- | --- | --- |
| `--purple` | `#9CA5FF` | Primary brand accent. Bottom-tab active label. `.di-dur` timeline accent. Small text-action color. **Not used for CTA backgrounds in the reference** (CTAs are dark). |
| `--amber` | `#F4C84A` | Stat-card warm hue |
| `--lav` | `#C5BFEF` | Stat-card violet hue |
| `--coral` | `#E8836A` | Stat-card coral hue |
| `--green` | `#5DC87A` | Stat-card green hue / `.sp-dot` |
| `--lt-purple` | `#B5BAFF` | Soft lavender |

**8-skill palette** is independent of these and stays as we set it in
the prior cleanup (`F2C94C / A8A4E8 / E8A4B8 / 6B5B95 / 7DB87A / E8806B / 5FB8B0 / 3D5A80`).
The reference doesn't define eight skill colors — only the six brand
accents above — so the current 8-skill palette is preserved.

## Type scale

All weights are Plus Jakarta Sans. `letter-spacing` is in em.

| Token | Size | Weight | Tracking | Line | Where |
| --- | --- | --- | --- | --- | --- |
| `.pg-title` | 50px | 800 | -0.035em | 1.05 | Page title (Today's Focus, Activity Library, etc) |
| `.obs-h` | 38px | 800 | -0.03em | 1.1 | Onboarding slide headline |
| `.obs-h.sm` | 30px | 800 | -0.03em | 1.15 | Onboarding headline, dense variant |
| `.setup-h` | 38px | 800 | -0.03em | — | Setup screen headline |
| `.sp-logo` | 64px | 800 | -0.05em | 1 | Splash wordmark (one-off, big) |
| `.brand` | 18px | 800 | -0.02em | — | AppHeader wordmark "Fokus" |
| `.sec-h` | 22px | 700 | -0.02em | — | Section headline ("Child's Diary", etc) |
| `.di-name` | 18px | 700 | -0.01em | — | Row title (timeline / list rows) |
| `.child-name` | 28px | 800 | -0.025em | — | Profile child name |
| `.sc-val` | 22px | 800 | -0.025em | 1.15 | Stat card big value |
| `.sc-val.lg` | 26px | 800 | -0.025em | — | Stat card big value (wide variant) |
| `.stat2-val` | 28px | 800 | -0.025em | 1 | Two-col stat card value |
| `body` | 16px (default) | 400 | — | 1.5-1.6 | Body |
| `.obs-b` | 18px | 300 | — | 1.6 | Onboarding body subtitle |
| `.setup-sub` | 14px | 400 (implied) | — | 1.6 | Setup subtitle (muted) |
| `.di-dur` | 14px | 600 | — | — | Timeline duration accent (purple) |
| `.f-lbl` | 11px | 700 | +0.05em uppercase | — | Field label eyebrow |
| `.sp-eyebrow` | 11px | 700 | +0.12em uppercase | — | Splash eyebrow |
| `.setup-ey` | 11px | 700 | +0.08em uppercase | — | Setup eyebrow |
| `.sbar-t` | 15px | 600 | -0.01em | — | Status bar text |
| `.nb-lbl` | 11px | 500 (700 when active) | — | — | Bottom tab label |
| `.pill` / `.pt` | 13px | 600 | — | — | Pill / pill-tab text |
| `.act-card` row title | 16px | 700 | — | — | List-row title (Library) |
| `.act-tag` | 11px | 700 | — | — | List-row skill tag |
| `.sc-lbl` | 12px | 600 | — | — | Stat card label (white on color) |
| `.sc-sub` | 11px | 400 | — | 1.4 | Stat card subtitle |

**This undoes the recent dial-back** from 800→700 and the page-title
shrink from ~36-40→28-30. Headlines go back to 800 with tight
negative tracking.

## Spacing

The reference uses ad-hoc px values, no token system. Pragmatically:

- Page padding: 24px horizontal (`.tab { padding: 0 24px 28px }`)
- Section vertical rhythm: ~20px between blocks
- Card padding: 18px (`.wcard`, `.dcard`)
- Stat-card padding: 16px
- Pill padding: `8px 16px` (or `6px 13px` for `.pill-sm`)
- Input height: 52px

## Radius

| Token / class | Radius | Use |
| --- | --- | --- |
| Card | 20px | `.wcard`, `.dcard`, `.mj-card` (18) |
| Stat card | 22px | `.sc`, `.stat2` |
| CTA pill | 27px (half-height of 54) | `.cta`, `.begin`, `.ob-btn` |
| Pill / chip | 20px | `.pill`, `.pt` |
| Input | 14px | `.f-inp` |
| Activity icon square | 16px | `.act-ico` (50×50) |
| Avatar (child, 96) | 48px (round) | `.child-av` |
| Mood circle | 34px (round 68) | `.mood-circ` |
| Phone frame chrome | 52px / 48px | `.phone`, `.screen` (one-off) |

## Components

### Primary CTA

```
.cta {
  width: 100%;
  height: 54px;
  border-radius: 27px;
  background: var(--dark);          /* ink */
  color: var(--w);                  /* white */
  font-size: 16px;
  font-weight: 700;
}
```

### Outline CTA (used in onboarding slides on dark)

```
.ob-btn {
  width: 100%;
  height: 54px;
  border-radius: 27px;
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.22);
  color: rgba(255,255,255,0.82);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
```

### Card

```
.wcard {
  background: var(--w);              /* white */
  border: 1.5px solid var(--gray-bd); /* warm beige #E5E3DA */
  border-radius: 20px;
  padding: 18px;
}
.dcard { /* dashed variant — onboarding */
  border: 1.5px dashed var(--gray-lt);
}
```

### Input

```
.f-inp {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: 1.5px solid var(--gray-bd);
  background: var(--w);
  padding: 0 16px;
  font-size: 16px;
  color: var(--dark);
}
.f-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 7px;
}
```

### Pill / chip

```
.pill {
  background: var(--gray-bd);
  color: var(--dark);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
}
.pill.on {
  background: var(--dark);
  color: var(--w);
}
.pill-sm { font-size: 12px; padding: 6px 13px; }
```

### Pill-tab (filter pills)

```
.pt {
  background: var(--w);
  border: 1.5px solid var(--gray-bd);
  color: var(--dark);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 16px;
  border-radius: 20px;
}
.pt.on {
  background: var(--dark);
  color: var(--w);
  border-color: var(--dark);
}
```

### Bottom tab bar

```
.bnav {
  height: 78px;
  background: var(--w);
  border-top: 1px solid var(--gray-bd);
  display: flex;
  padding-top: 10px;
}
.nb-lbl   { font-size: 11px; font-weight: 500; color: var(--gray-lt); }
.nb.on .nb-lbl { color: var(--purple); font-weight: 700; } /* periwinkle when active */
.nb-ico   { opacity: 0.38; }
.nb.on .nb-ico { opacity: 1; }
```

This is the bit that came up in the cleanup pass — active-tab color
goes from current ink back to `--purple` (#9CA5FF).

### Section headers

```
.sec-h {
  font-size: 22px;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}
.sec-row { /* header + action link */
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.sec-act {
  font-size: 13px;
  font-weight: 600;
  color: var(--purple);
}
```

### Eyebrow labels (small caps)

```
.f-lbl, .sp-eyebrow, .setup-ey {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray) | var(--purple);
  letter-spacing: 0.05em - 0.12em;
  text-transform: uppercase;
}
```

### Avatar (child profile)

```
.child-av {
  width: 96px;
  height: 96px;
  border-radius: 48px;
  background: linear-gradient(145deg,#5BC8F5,#29A8E0 60%,#1888C0);
  font-size: 50px;
  box-shadow: 0 8px 28px rgba(41,168,224,0.38);
}
```

The blue gradient + drop shadow is **not** restored — current uses an
ink-circle avatar with first initial. The reference's gradient avatar
is decorative chrome that doesn't fit the spec-pure direction. Keep
the current ink avatar but adopt the **size + radius** (96 round).

## Shadows

The reference is mostly flat. Specific shadows:

- `.child-av` — `0 8px 28px rgba(41,168,224,0.38)` (decorative, not restored)
- `.begin` / `.cta` — none
- Stat card — none on flat color
- `.tune-thumb` — `0 2px 8px rgba(0,0,0,0.18)`
- Phone frame chrome — multiple (one-off, not relevant)

Default: **no shadow on cards**, hair border instead.

## Transitions

```
@keyframes fadeIn  { from {opacity:0} to {opacity:1} }
@keyframes fadeUp  { from {opacity:0; transform:translateY(14px)} to {opacity:1; transform:translateY(0)} }
@keyframes slideUp { from {transform:translateY(100%)} to {transform:translateY(0)} }
```

Tab fade-in: `.tab.on { animation: fadeIn 0.25s ease }`.
Pill / pill-tab hover: `transition: all 0.2s`.
Drag handle / dots: `transition: all 0.35s`.

---

## What we restore vs keep current

| Token | Reference says | We apply |
| --- | --- | --- |
| Body font | Plus Jakarta Sans | ✅ restore PJS (drop Inter) |
| Page bg | `#E9E6DC` cream | ❌ keep `#FFFFFF` per founder direction |
| Ink | `#252630` | ✅ keep `#1A1A1A` (founder set this in cleanup) |
| Border | `#E5E3DA` warm beige | ✅ restore warm beige (drop `#EEEEEE`) |
| Page-title size | 50px | ✅ restore (was dialed back to 28-30 last pass) |
| Headline weight | 800 | ✅ restore (was dialed back to 700) |
| Headline tracking | -0.035em / -0.03em / -0.02em | ✅ restore (was flattened to -0.01em) |
| Card radius | 20 | ✅ restore (was 16) |
| Card border | 1.5px | ✅ restore (was 1px or 0.5px) |
| CTA radius | 27 | ✅ restore (was 999 full pill) |
| CTA color | ink | ✅ unchanged |
| Active tab color | `--purple` periwinkle | ✅ restore (was ink in cleanup) |
| 8-skill palette | undefined in reference | ✅ keep current 8-color set |
| Tune today | sliders | ❌ stays deleted |
| Menu button | top right | ❌ stays deleted |
| Personality profile / Invisible Strengths | full tab | ❌ stays deleted |
| Compass tab | bottom nav | ❌ stays deleted |
| Child's Diary tabs | Today/Yesterday/Week/Month | ❌ stays deleted |
| Emoji activity icons | 📖🔮🎨 etc | ❌ Lucide SkillIcon stays |
| Reflect overlay | full-screen sheet | ❌ replaced by /done/[id] |
| Tune sliders | energy / mood | ❌ stays deleted |
