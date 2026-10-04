import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { TourProvider } from "@/contexts/TourContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spinnerr | Ambient Music Visualizer",
  description: "An ambient dashboard music player with stunning generative vinyl disc art",
  applicationName: "Spinnerr",
  metadataBase: new URL("https://spinnerr-app.web.app"),
  openGraph: {
    title: "Spinnerr | Ambient Music Visualizer",
    description: "Open it and a record starts spinning. Browse stations, radio and archives.",
    url: "https://spinnerr-app.web.app",
    siteName: "Spinnerr",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* The landing station streams from Audius: open the connection early. */}
        <link rel="preconnect" href="https://api.audius.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.audius.co" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <TourProvider>
            {children}
          </TourProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
