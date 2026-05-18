"use client";

import {
  Anchor,
  ArrowRight,
  Bird,
  Blocks,
  BookMarked,
  BookOpen,
  Box,
  Brain,
  Bug,
  Calendar,
  CheckCircle,
  CheckSquare,
  Cloud,
  Cog,
  Compass,
  Diff,
  Droplet,
  Ear,
  Eye,
  EyeOff,
  Flag,
  Footprints,
  GitBranch,
  GraduationCap,
  Grid3x3,
  Hammer,
  Hand,
  Heart,
  HelpCircle,
  Home,
  Hourglass,
  Image,
  LayoutGrid,
  Lightbulb,
  MessageCircle,
  MessageCircleQuestion,
  MessageSquare,
  Music,
  Pause,
  Pencil,
  Phone,
  Puzzle,
  RefreshCw,
  RotateCcw,
  Scale,
  ScanSearch,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Sparkle,
  Sparkles,
  Square,
  Tally5,
  ThumbsDown,
  Timer,
  Trophy,
  Type,
  Undo,
  User,
  Users,
  Utensils,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { SKILLS } from "@/lib/content/skills";
import type { SkillKey } from "@/types";

/**
 * Master Lucide lookup. The 64 per-activity names from
 * lib/content/activity-icons.ts must each resolve to a key here. Skill
 * icons (Anchor, BookOpen, Brain, Compass, Eye, Heart, Sparkles, Wind)
 * are included too so the fallback path works.
 */
const ICONS: Record<string, LucideIcon> = {
  Anchor,
  ArrowRight,
  Bird,
  Blocks,
  BookMarked,
  BookOpen,
  Box,
  Brain,
  Bug,
  Calendar,
  CheckCircle,
  CheckSquare,
  Cloud,
  Cog,
  Compass,
  Diff,
  Droplet,
  Ear,
  Eye,
  EyeOff,
  Flag,
  Footprints,
  GitBranch,
  GraduationCap,
  Grid3x3,
  Hammer,
  Hand,
  Heart,
  HelpCircle,
  Home,
  Hourglass,
  Image,
  LayoutGrid,
  Lightbulb,
  MessageCircle,
  MessageCircleQuestion,
  MessageSquare,
  Music,
  Pause,
  Pencil,
  Phone,
  Puzzle,
  RefreshCw,
  RotateCcw,
  Scale,
  ScanSearch,
  Search,
  ShoppingBag,
  ShoppingCart,
  Smile,
  Sparkle,
  Sparkles,
  Square,
  Tally5,
  ThumbsDown,
  Timer,
  Trophy,
  Type,
  Undo,
  User,
  Users,
  Utensils,
  Wind,
  Wrench,
};

export interface ActivityIconProps {
  iconName: string;
  skill: SkillKey;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean;
}

/**
 * Render an activity-specific icon by name. If the name doesn't resolve,
 * fall back to the skill's icon. The skill icon itself is sourced through
 * the same map so the fallback path always renders something.
 */
export default function ActivityIcon({
  iconName,
  skill,
  size = 22,
  strokeWidth = 1.75,
  className,
  style,
  "aria-hidden": ariaHidden = true,
}: ActivityIconProps) {
  const Icon =
    ICONS[iconName] ?? ICONS[SKILLS[skill].iconName] ?? Sparkles;
  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    />
  );
}
