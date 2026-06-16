import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Veteran Journey Navigator",
  description: "A private prototype that helps veterans organize VA records, evidence, benefits, and VSO meeting questions.",
  openGraph: {
    title: "Veteran Journey Navigator",
    description: "Private veteran benefits and evidence organizer. Sign in with your own email to test the prototype.",
    type: "website",
    siteName: "Veteran Journey Navigator",
  },
  twitter: {
    card: "summary",
    title: "Veteran Journey Navigator",
    description: "Private veteran benefits and evidence organizer. Sign in with your own email to test the prototype.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
