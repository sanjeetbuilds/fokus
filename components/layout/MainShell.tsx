"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, BookOpen, Home, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import TabBar, { type TabItem } from "@/components/ui/TabBar";

interface TabDef extends Omit<TabItem, "onClick"> {
  path: string;
}

/**
 * Tabs only render on EXACTLY their root path. /map/skill/foo and other
 * detail routes inside (main) deliberately hide the tab bar so detail
 * screens get the full viewport for focus.
 */
const TABS: TabDef[] = [
  { key: "today", label: "Today", icon: Home, path: "/today" },
  { key: "library", label: "Library", icon: BookOpen, path: "/library" },
  { key: "map", label: "Track", icon: Activity, path: "/map" },
  { key: "profile", label: "Profile", icon: User, path: "/profile" },
];

const TAB_PATHS = new Set(TABS.map((t) => t.path));

export function MainShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const showTabs = TAB_PATHS.has(pathname);
  const activeTab = TABS.find((t) => t.path === pathname)?.key ?? "today";

  const transitioned = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );

  if (!showTabs) {
    return transitioned;
  }

  const tabs: TabItem[] = TABS.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    onClick: () => router.push(t.path),
  }));

  return (
    <>
      {transitioned}
      <TabBar tabs={tabs} activeKey={activeTab} />
    </>
  );
}
