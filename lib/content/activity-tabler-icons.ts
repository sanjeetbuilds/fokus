/**
 * Activity-specific Tabler icon names. One unique icon per activity,
 * chosen to evoke what the parent literally does in that activity
 * (not the umbrella skill).
 *
 * Keyed by activity id. Merged into ACTIVITIES at module load.
 *
 * Skill icons (ti-bulb / ti-heart / ti-brain / ti-mountain / ti-palette
 * / ti-eye / ti-target / ti-message-circle) are reserved for the skill
 * tiles and intentionally not used here.
 *
 * Naming follows the @tabler/icons-react v3 convention: the kebab-case
 * "ti-foo-bar" maps to the React component `IconFooBar`. The resolver
 * in components/activity/TablerIcon.tsx hard-imports each one below so
 * the bundler tree-shakes correctly.
 */
export const ACTIVITY_TABLER_ICONS: Record<string, string> = {
  // Curiosity
  cu1: "ti-message-question",    // ask why five times
  cu2: "ti-tools",               // open a broken thing
  cu3: "ti-bottle",              // question jar (no jar in Tabler; bottle)
  cu4: "ti-settings",            // guess how it works (gears)
  cu5: "ti-walk",                // walk and notice
  cu6: "ti-user-question",       // ask a stranger a real question
  cu7: "ti-package",             // what's inside (open a sealed object)
  cu8: "ti-paw",                 // animal mystery

  // Language confidence
  la1: "ti-messages",            // tell me about your day, in English
  la2: "ti-photo",               // picture description
  la3: "ti-book",                // story continue
  la4: "ti-abc",                 // word of the day
  la5: "ti-shopping-cart",       // order something yourself
  la6: "ti-microphone",          // read aloud time
  la7: "ti-presentation",        // teach me something
  la8: "ti-phone",               // phone call practice

  // Emotional awareness
  em1: "ti-mood-smile",          // name the feeling
  em2: "ti-player-pause",        // big feelings pause / breath
  em3: "ti-users",               // other person's shoes
  em4: "ti-cloud",               // feeling weather report
  em5: "ti-box",                 // anger box
  em6: "ti-mood-empty",          // apology practice
  em7: "ti-book-2",              // story feelings
  em8: "ti-stars",               // gratitude three

  // Perspective
  pe1: "ti-book",                // the other side of the story
  pe2: "ti-question-mark",       // three reasons
  pe3: "ti-eye-search",          // feelings detective
  pe4: "ti-arrows-exchange",     // the switch
  pe5: "ti-clock-hour-8",        // their whole day
  pe6: "ti-door-enter",          // first day anywhere
  pe7: "ti-message-question",    // ask don't tell
  pe8: "ti-heart-handshake",     // what they want

  // Thinking clarity
  th1: "ti-question-mark",       // how do we know?
  th2: "ti-arrows-split",        // two reasons game
  th3: "ti-arrows-sort",         // sort the same things
  th4: "ti-zoom-in",             // what's missing? (re-look)
  th5: "ti-scale",               // same or different
  th6: "ti-link",                // cause and effect chain
  th7: "ti-checkbox",            // true / false / not sure
  th8: "ti-arrow-back-up",       // solve it backward

  // Resilience
  re1: "ti-puzzle",              // the hard puzzle
  re2: "ti-refresh",             // try, fail, try again
  re3: "ti-eraser",              // the mistake story
  re4: "ti-hourglass",           // boredom practice
  re5: "ti-flag",                // finish what you started
  re6: "ti-chess",               // lose on purpose
  re7: "ti-droplet",             // cold splash
  re8: "ti-bowl",                // try the hard food

  // Creativity
  cr1: "ti-list",                // 20 uses for this
  cr2: "ti-world",               // what if the world was…
  cr3: "ti-rocket",              // invent a creature (imagined being)
  cr4: "ti-pencil",              // story from three words
  cr5: "ti-rotate",              // re-invent an object
  cr6: "ti-stack-2",             // open-ended building
  cr7: "ti-flame",               // the bad idea game
  cr8: "ti-music",               // make up a song

  // Observation
  ob1: "ti-grid-3x3",            // memory tray
  ob2: "ti-arrows-exchange",     // what changed?
  ob3: "ti-ear",                 // sound map
  ob4: "ti-binoculars",          // watch a person
  ob5: "ti-home",                // re-notice your home
  ob6: "ti-hand-finger",         // texture hunt
  ob7: "ti-chart-bar",           // track something all day
  ob8: "ti-search",              // mood detective

  // Decisiveness
  de1: "ti-tools-kitchen-2",     // you pick dinner
  de2: "ti-stopwatch",           // 60-second choice
  de3: "ti-coin",                // the trade-off (cost)
  de4: "ti-calendar",            // plan the day
  de5: "ti-building-store",      // buy it yourself
  de6: "ti-arrows-right-left",   // pick a side
  de7: "ti-history",             // the reversible test
  de8: "ti-pin",                 // stick with it
};
