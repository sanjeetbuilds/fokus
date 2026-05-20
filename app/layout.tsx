import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { OnboardingGate } from "@/components/shared/OnboardingGate";
import SplashGate from "@/components/shared/SplashGate";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

// Body — Plus Jakarta Sans, weights 300-800.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

// Display — Fraunces (variable, with optical-size axis). Opt-in per-element
// via the Tailwind `font-display` utility. Used on splash wordmark, intro
// titles, onboarding title, welcome-modal title.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fokus",
    template: "%s · Fokus",
  },
  description: "A calm companion for the invisible moments that matter.",
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
  viewportFit: "cover",
  // Round-5 light-mode bg is pure white; status bar matches.
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full ${jakarta.variable} ${fraunces.variable}`}
    >
      <body className="min-h-full bg-bg text-ink font-sans antialiased">
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
