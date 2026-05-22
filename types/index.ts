/**
 * Fokus shared types; mirrors SPEC §5.
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

export interface ParentPreferences {
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

/**
 * The engine-facing Child shape. Mirrors the lean public.child Supabase
 * row (name + dob + pronouns + photo_url) plus the derived integer age
 * the engine uses for age-range filtering.
 *
 * Deliberately holds no "what the child likes / avoids / struggles
 * with" fields. Per SPEC §2 (the child is never measured) and the
 * pre-launch cleanup pass, Fokus does not profile the child to
 * personalize the daily pick.
 */
export interface Child {
  id: string;
  parentId: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  photoUrl?: string | null;
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
  /**
   * One-line hook (≤8 words, present tense, what the parent literally
   * does with the child). Shown under the title in the Library bottom
   * sheet for untried activities so the parent can decide whether to
   * tap without opening the detail screen.
   */
  hook: string;
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
