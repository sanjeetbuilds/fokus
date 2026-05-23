import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthGate } from "@/components/shared/AuthGate";
import { OnboardingGate } from "@/components/shared/OnboardingGate";
import SplashGate from "@/components/shared/SplashGate";
import { ToastProvider } from "@/components/ui/Toast";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
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
  maximumScale: 1,
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
      className={`h-full ${sans.variable}`}
    >
      <body className="min-h-full bg-bg text-ink font-sans antialiased">
        <ToastProvider>
          <SplashGate>
            <AuthGate>
              <OnboardingGate>{children}</OnboardingGate>
            </AuthGate>
          </SplashGate>
        </ToastProvider>
      </body>
    </html>
  );
}
