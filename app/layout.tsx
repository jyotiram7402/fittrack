import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { ServiceWorker } from "@/components/ServiceWorker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FitTrack — Your personalized diet & workout coach",
    template: "%s · FitTrack",
  },
  description:
    "Answer a few questions and get a personalized nutrition + training plan you can track every day. Free, fast, and built for your goals.",
  manifest: "/manifest.json",
  applicationName: "FitTrack",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FitTrack" },
  openGraph: {
    title: "FitTrack — Your personalized diet & workout coach",
    description: "Personalized diet + workout plans you can track daily.",
    url: siteUrl,
    siteName: "FitTrack",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "FitTrack" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a9a4b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeScript />
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
