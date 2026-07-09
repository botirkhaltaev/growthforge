import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Growth Forge — GTM factory for ads",
  description:
    "Scope → distribute → reach out. Five Cursor agents scope ICP, distribute work, and plan a multi-touch cadence. The creative is the interface.",
  openGraph: {
    title: "Growth Forge",
    description:
      "GTM factory — scope the motion, distribute the work, reach the market. Built with @cursor/sdk.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground forge-atmosphere">
        {children}
      </body>
    </html>
  );
}
