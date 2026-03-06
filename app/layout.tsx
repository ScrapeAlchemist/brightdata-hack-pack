import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bright Data Hackathon Starter",
  description: "Scrape any website with Bright Data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
