import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RevitaVibe Montgomery — AI Civic Land Intelligence Platform",
  description: "Turning vacant land into opportunity for parks, housing, and stronger neighborhoods in Montgomery, AL",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
