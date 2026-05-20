/**
 * Fokus shared types — mirrors SPEC §5.
 *
 * Every persisted record carries:
 *   - id: uuid (Dexie primary key)
 *   - createdAt: ISO timestamp
 *   - _syncStatus: 'local' | 'synced' | 'pending'
 *     (Phase 1 always 'local'; reserved for Phase 2 cloud sync.)
 */

export type SyncStatus = "local" | "synced" | "pending";

export type SkillKey =
  | "curiosity"
  | "language"
  | "emotional"
  | "thinking"
  | "resilience"
  | "creativity"
  | "observation"
  | "decisiveness";

// ---------- Parent ----------

export type ThemePreference = "auto" | "light" | "dark";

export interface ParentPreferences {
  reminderTime?: string; // "20:00"
  darkMode?: ThemePreference;
  onboarded: boolean;
  /** Once the parent dismisses the WelcomeModal post-onboarding, this
   *  sticks across reloads so it never reappears. */
  hasSeenWelcomeModal?: boolean;
}

export interface Parent {
  id: string;
  name: string;
  createdAt: string; // ISO
  updatedAt: string;
  preferences: ParentPreferences;
  _syncStatus?: SyncStatus;
}

// ---------- Child ----------

export type EnglishConfidence = "hesitant" | "developing" | "comfortable";

export interface ChildEngagement {
  fleesFrom: string[];
  goesDeepOn: string[];
  inBetween: string[];
}

export interface Child {
  id: string;
  parentId: string;
  name: string;
  /**
   * Age in whole years. Derived from `dateOfBirth` at creation time; persisted
   * for ergonomic reads and so the engine doesn't recompute on every score.
   * Older records (created before dateOfBirth was added) keep just `age`.
   */
  age: number; // 5–10
  /**
   * Source of truth for child age. YYYY-MM-DD calendar date. Optional only
   * to support records created before this field existed — new onboarding
   * writes it, and the rest of the app reads `age` (derived).
   */
  dateOfBirth?: string;
  grade: string; // "Nursery" | "KG" | "1st" | ...
  /** @deprecated Use `dateOfBirth`. Kept for legacy records / dev seed. */
  birthMonth?: number; // 1–12
  /** @deprecated Use `dateOfBirth`. Kept for legacy records / dev seed. */
  birthYear?: number;

  engagement: ChildEngagement;

  englishConfidence: EnglishConfidence;
  primaryLanguage: string;

  interests: string[];
  strengths: string[];
  struggles: string[];

  /**
   * Optional base64 data URL of a parent-uploaded photo, downscaled to
   * 256x256 client-side before encoding. Null/undefined falls back to the
   * letter Avatar everywhere a child face would appear.
   */
  photoUrl?: string | null;

  /**
   * Compact age range as captured in the round-4 onboarding form
   * ("0-1 yr" / "2-4 yrs" / "4-6 yrs" / "6-9 yrs"). The numeric `age` is
   * derived from this when the deeper fields aren't filled yet; once the
   * parent enters DOB via settings, `dateOfBirth` becomes authoritative.
   */
  ageBand?: string | null;

  /** Optional gender, captured later in the profile-completion flow. */
  gender?: "boy" | "girl" | "unspecified" | null;

  createdAt: string;
  updatedAt: string;
  _syncStatus?: SyncStatus;
}

// ---------- Session ----------

export type SessionResponse =
  | "loved"
  | "engaged"
  | "neutral"
  | "struggled"
  | "frustrated"
  | "skipped";

export type TimeAvailable = "short" | "medium" | "long";
export type ChildMood = "low" | "normal" | "high";

export interface SessionContext {
  timeAvailable: TimeAvailable;
  childMood: ChildMood;
}

export interface Session {
  id: string;
  childId: string;
  activityId: string; // references ACTIVITIES library
  date: string; // YYYY-MM-DD (ISO calendar date)
  response: SessionResponse;
  note?: string;
  duration?: number; // minutes
  context: SessionContext;
  createdAt: string;
  _syncStatus?: SyncStatus;
}

// ---------- Observation ----------

export interface Observation {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  text: string;
  tags?: string[];
  createdAt: string;
  _syncStatus?: SyncStatus;
}

// ---------- Activity (static content, not in DB) ----------

export type ActivityDuration = 5 | 10 | 15 | 25;
export type ActivityDifficulty = 1 | 2 | 3;
export type LanguageLoad = "low" | "medium" | "high";
export type ActivityRequires =
  | "nothing"
  | "paper-pen"
  | "objects-at-home"
  | "outdoors";

export interface ActivityAdapt {
  easier: string;
  harder: string;
}

export interface ActivityExampleLine {
  speaker: "you" | "child";
  line: string;
}

export interface ActivityExample {
  setup: string;
  exchange: ActivityExampleLine[];
  closing?: string;
}

export interface Activity {
  id: string;
  title: string;
  skill: SkillKey;
  subskill?: string;
  duration: ActivityDuration;
  difficulty: ActivityDifficulty;
  languageLoad: LanguageLoad;
  ageRange: [number, number];
  requires: ActivityRequires;

  description: string;
  hiddenCurriculum: string;
  howTo: string;
  watchFor: string;
  oneLineToSay: string;
  trap: string;
  adapt: ActivityAdapt;
  worksWellWith: string[];
  example: ActivityExample;
  /**
   * Per-activity Lucide icon name (e.g. "Wrench"). Resolved at render via
   * components/activity/ActivityIcon.tsx, which falls back to the skill's
   * iconName if the activity's name doesn't resolve.
   */
  iconName: string;
}
