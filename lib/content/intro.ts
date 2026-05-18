export interface IntroScreen {
  id: number; // 1..3
  title: string;
  body: string;
}

/**
 * The three intro screens shown before signup. Copy is intentionally
 * tight: title in Fraunces, body in Inter, no auxiliary callouts.
 */
export const INTRO_SCREENS: IntroScreen[] = [
  {
    id: 1,
    title: "School measures what's easy to measure.",
    body: "Marks. Behavior. Speed. The things teachers can grade by Friday.",
  },
  {
    id: 2,
    title: "How to think. How to recover. How to wonder.",
    body: "These don't show up on report cards. They show up in who your child becomes.",
  },
  {
    id: 3,
    title: "One small moment a day. That's the whole app.",
    body: "Fokus picks today's moment for you, based on who your child actually is. You do it together, log how it went, and that's it.",
  },
];
