/**
 * Per-activity Lucide icon names. Resolved at render in
 * components/activity/ActivityIcon.tsx; that file owns the master
 * lookup map so we ship only the icons we actually use.
 *
 * Keys are Activity ids ("cu1" .. "de8").
 */
export const ACTIVITY_ICONS: Record<string, string> = {
  // -------------------- Curiosity --------------------
  cu1: "HelpCircle",
  cu2: "Wrench",
  cu3: "MessageCircleQuestion",
  cu4: "Cog",
  cu5: "Footprints",
  cu6: "User",
  cu7: "Box",
  cu8: "Bird",

  // -------------------- Language --------------------
  la1: "MessageCircle",
  // "Image" (a generic photo-frame glyph) read as a broken-image placeholder
  // on cards, so swap to ScanSearch; closer to the activity's intent of
  // examining a picture together.
  la2: "ScanSearch",
  la3: "BookOpen",
  la4: "Type",
  la5: "ShoppingBag",
  la6: "BookMarked",
  la7: "GraduationCap",
  la8: "Phone",

  // -------------------- Emotional --------------------
  em1: "Smile",
  em2: "Pause",
  em3: "Users",
  em4: "Cloud",
  em5: "Square",
  em6: "RotateCcw",
  em7: "Heart",
  em8: "Sparkle",

  // -------------------- Thinking --------------------
  th1: "Search",
  th2: "GitBranch",
  th3: "LayoutGrid",
  th4: "EyeOff",
  th5: "Diff",
  th6: "ArrowRight",
  th7: "CheckCircle",
  th8: "RotateCcw",

  // -------------------- Resilience --------------------
  re1: "Puzzle",
  re2: "RefreshCw",
  re3: "MessageSquare",
  re4: "Hourglass",
  re5: "CheckSquare",
  re6: "Trophy",
  re7: "Droplet",
  re8: "Utensils",

  // -------------------- Creativity --------------------
  cr1: "Lightbulb",
  cr2: "Sparkles",
  cr3: "Bug",
  cr4: "Pencil",
  cr5: "Hammer",
  cr6: "Blocks",
  cr7: "ThumbsDown",
  cr8: "Music",

  // -------------------- Observation --------------------
  ob1: "Grid3x3",
  ob2: "ScanSearch",
  ob3: "Ear",
  ob4: "Eye",
  ob5: "Home",
  ob6: "Hand",
  ob7: "Tally5",
  ob8: "Search",

  // -------------------- Decisiveness --------------------
  de1: "Utensils",
  de2: "Timer",
  de3: "Scale",
  de4: "Calendar",
  de5: "ShoppingCart",
  de6: "Flag",
  de7: "Undo",
  de8: "Anchor",
};
