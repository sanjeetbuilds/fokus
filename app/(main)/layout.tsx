import type { ReactNode } from "react";

import { MainShell } from "@/components/layout/MainShell";

/**
 * Layout for the (main) route group. Wraps every top-level tab page in
 * the tab bar shell. Detail screens nested under (main) (e.g. /activity/[id],
 * /map/skill/[skill]) opt out of the tab bar inside MainShell.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  return <MainShell>{children}</MainShell>;
}
