import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { OnboardingGate } from "@/components/shared/OnboardingGate";
import SplashGate from "@/components/shared/SplashGate";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

// Display serif: Fraunces variable, with the optical-size axis so we get
// the right cut at every headline size. Loaded as a CSS variable so we can
// opt-in per-element via the Tailwind `font-display` utility; body text
// continues to use Inter via --font-body.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fokus",
    template: "%s · Fokus",
  },
  description: "One small moment a day with your child.",
  applicationName: "Fokus",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Fokus",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Intentionally omit maximumScale, since pinch-to-zoom must stay enabled for
  // low-vision accessibility (WCAG 2.5.4). Lighthouse fails meta-viewport
  // when maximum-scale < 5 or user-scalable=no.
  viewportFit: "cover",
  // Pinned to the cream regardless of OS preference. Default theme is "light"
  // (see components/shared/ThemeProvider.tsx) so a fresh install on a dark
  // phone still opens light; the status-bar tint should match.
  themeColor: "#F4F3EE",
  // Tells the UA we only render in light. Form controls + scrollbars stop
  // auto-darkening; matches the defaultTheme="light" choice above.
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full ${fraunces.variable} ${inter.variable}`}
    >
      <body className="min-h-full bg-bg text-ink font-sans">
        <ThemeProvider>
          <ToastProvider>
            <SplashGate>
              <OnboardingGate>{children}</OnboardingGate>
            </SplashGate>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
