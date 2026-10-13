import type { Metadata } from "next";
import { Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { DemoProvider } from "@/lib/demo-context";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  variable: "--font-body",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Covenant",
  description: "Commercial property transaction management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full`}
    >
      <body className="min-h-full bg-paper text-ink">
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
