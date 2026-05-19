import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { OnboardingGate } from "@/components/shared/OnboardingGate";
import SplashGate from "@/components/shared/SplashGate";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

// Round-4 design uses a single family: Plus Jakarta Sans, weights 300-800.
// Loaded as a CSS variable (`--font-body`) so the Tailwind `font-sans`
// utility (and `font-display`, kept as an alias) both resolve to it.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-body",
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
  // Warm beige bg in the new identity; status bar should match.
  themeColor: "#E9E6DC",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full ${jakarta.variable}`}
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
