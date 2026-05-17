"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Default theme is "light". Every fresh install opens in light mode
 * regardless of the OS preference. `enableSystem` stays on so users can
 * opt into "System" from /profile/settings; once they do, next-themes
 * persists the choice in localStorage and respects it on reload.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
