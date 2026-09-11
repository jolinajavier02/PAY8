import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PAY8 — E-Wallet & Transit Card",
  description: "Send money, scan QR, transfer to banks, and tap-to-pay on transit — all in one app.",
  keywords: ["PAY8", "e-wallet", "Philippines", "GCash alternative", "bank transfer", "InstaPay", "PESONet", "QR pay", "transit card"],
  authors: [{ name: "PAY8" }],
  manifest: "/manifest.json",
  applicationName: "PAY8",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PAY8",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B2447",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="pay8-device-host">
          <div className="pay8-device-shell" data-pay8-device>
            {children}
            <Toaster />
          </div>
        </div>
      </body>
    </html>
  );
}
