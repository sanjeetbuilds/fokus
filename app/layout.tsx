import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OnboardingGate } from "@/components/shared/OnboardingGate";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

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
  // Intentionally omit maximumScale — pinch-to-zoom must stay enabled for
  // low-vision accessibility (WCAG 2.5.4). Lighthouse fails meta-viewport
  // when maximum-scale < 5 or user-scalable=no.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EE" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="min-h-full bg-bg text-ink font-sans">
        <ThemeProvider>
          <ToastProvider>
            <OnboardingGate>{children}</OnboardingGate>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
