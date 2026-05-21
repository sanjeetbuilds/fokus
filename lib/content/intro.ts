export interface IntroScreen {
  id: number; // 1..3
  title: string;
  body: string;
}

/**
 * The three intro screens shown before signup. Copy is intentionally
 * tight: title and body both in Plus Jakarta Sans, no auxiliary callouts.
 */
export const INTRO_SCREENS: IntroScreen[] = [
  {
    id: 1,
    title: "School teaches reading. Math. Science.",
    body: "Those things matter. But they're not the whole picture.",
  },
  {
    id: 2,
    title:
      "What school doesn't teach: how to think, how to feel, how to recover.",
    body:
      "Critical thinking. Emotional steadiness. Creativity. The skills that decide how a child turns out get built at home.",
  },
  {
    id: 3,
    title: "Fokus is one small moment a day.",
    body:
      "For the parts no one teaches anywhere else. You and your child. Five to twenty minutes. That's the whole app.",
  },
];
