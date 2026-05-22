/**
 * Tabler icon resolver. Maps a kebab-case "ti-foo-bar" string to a
 * concrete @tabler/icons-react component (IconFooBar).
 *
 * Each of the 64 activity icons is imported by name so the bundler
 * tree-shakes only the icons in use. If a new activity is added with
 * a Tabler icon not listed here, add an import + an entry to ICONS.
 */

import {
  IconAbc,
  IconArrowBackUp,
  IconArrowsExchange,
  IconArrowsRightLeft,
  IconArrowsSort,
  IconArrowsSplit,
  IconBinoculars,
  IconBook,
  IconBook2,
  IconBottle,
  IconBowl,
  IconBox,
  IconBuildingStore,
  IconCalendar,
  IconChartBar,
  IconCheckbox,
  IconChess,
  IconClockHour8,
  IconCloud,
  IconCoin,
  IconDoorEnter,
  IconDroplet,
  IconEar,
  IconEraser,
  IconEyeSearch,
  IconFlag,
  IconFlame,
  IconGrid3x3,
  IconHandFinger,
  IconHeartHandshake,
  IconHistory,
  IconHome,
  IconHourglass,
  IconLink,
  IconList,
  IconMessageQuestion,
  IconMessages,
  IconMicrophone,
  IconMoodEmpty,
  IconMoodSmile,
  IconMusic,
  IconPackage,
  IconPaw,
  IconPencil,
  IconPhone,
  IconPhoto,
  IconPin,
  IconPlayerPause,
  IconPresentation,
  IconPuzzle,
  IconQuestionMark,
  IconRefresh,
  IconRocket,
  IconRotate,
  IconScale,
  IconSearch,
  IconSettings,
  IconShoppingCart,
  IconStack2,
  IconStars,
  IconStopwatch,
  IconToolsKitchen2,
  IconTools,
  IconUserQuestion,
  IconUsers,
  IconWalk,
  IconWorld,
  IconZoomIn,
  type IconProps,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

const ICONS: Record<string, ComponentType<IconProps>> = {
  "ti-abc": IconAbc,
  "ti-arrow-back-up": IconArrowBackUp,
  "ti-arrows-exchange": IconArrowsExchange,
  "ti-arrows-right-left": IconArrowsRightLeft,
  "ti-arrows-sort": IconArrowsSort,
  "ti-arrows-split": IconArrowsSplit,
  "ti-binoculars": IconBinoculars,
  "ti-book": IconBook,
  "ti-book-2": IconBook2,
  "ti-bottle": IconBottle,
  "ti-bowl": IconBowl,
  "ti-box": IconBox,
  "ti-building-store": IconBuildingStore,
  "ti-calendar": IconCalendar,
  "ti-chart-bar": IconChartBar,
  "ti-checkbox": IconCheckbox,
  "ti-chess": IconChess,
  "ti-clock-hour-8": IconClockHour8,
  "ti-cloud": IconCloud,
  "ti-coin": IconCoin,
  "ti-door-enter": IconDoorEnter,
  "ti-droplet": IconDroplet,
  "ti-ear": IconEar,
  "ti-eraser": IconEraser,
  "ti-eye-search": IconEyeSearch,
  "ti-flag": IconFlag,
  "ti-flame": IconFlame,
  "ti-grid-3x3": IconGrid3x3,
  "ti-hand-finger": IconHandFinger,
  "ti-heart-handshake": IconHeartHandshake,
  "ti-history": IconHistory,
  "ti-home": IconHome,
  "ti-hourglass": IconHourglass,
  "ti-link": IconLink,
  "ti-list": IconList,
  "ti-message-question": IconMessageQuestion,
  "ti-messages": IconMessages,
  "ti-microphone": IconMicrophone,
  "ti-mood-empty": IconMoodEmpty,
  "ti-mood-smile": IconMoodSmile,
  "ti-music": IconMusic,
  "ti-package": IconPackage,
  "ti-paw": IconPaw,
  "ti-pencil": IconPencil,
  "ti-phone": IconPhone,
  "ti-photo": IconPhoto,
  "ti-pin": IconPin,
  "ti-player-pause": IconPlayerPause,
  "ti-presentation": IconPresentation,
  "ti-puzzle": IconPuzzle,
  "ti-question-mark": IconQuestionMark,
  "ti-refresh": IconRefresh,
  "ti-rocket": IconRocket,
  "ti-rotate": IconRotate,
  "ti-scale": IconScale,
  "ti-search": IconSearch,
  "ti-settings": IconSettings,
  "ti-shopping-cart": IconShoppingCart,
  "ti-stack-2": IconStack2,
  "ti-stars": IconStars,
  "ti-stopwatch": IconStopwatch,
  "ti-tools": IconTools,
  "ti-tools-kitchen-2": IconToolsKitchen2,
  "ti-user-question": IconUserQuestion,
  "ti-users": IconUsers,
  "ti-walk": IconWalk,
  "ti-world": IconWorld,
  "ti-zoom-in": IconZoomIn,
};

export interface TablerIconProps {
  /** Kebab-case name, e.g. "ti-tools". */
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean;
}

export default function TablerIcon({
  name,
  size = 22,
  strokeWidth = 2,
  className,
  style,
  "aria-hidden": ariaHidden = true,
}: TablerIconProps) {
  const Icon = ICONS[name];
  if (!Icon) {
    // Fail soft: render a faded question mark rather than crashing the
    // row. Should never fire in practice; the activities loader throws
    // if an activity is missing a Tabler icon.
    return (
      <IconQuestionMark
        size={size}
        stroke={strokeWidth}
        className={className}
        style={style}
        aria-hidden={ariaHidden}
      />
    );
  }
  return (
    <Icon
      size={size}
      stroke={strokeWidth}
      className={className}
      style={style}
      aria-hidden={ariaHidden}
    />
  );
}
