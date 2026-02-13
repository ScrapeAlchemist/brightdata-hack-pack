import type { Metadata } from "next";

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
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "2rem", maxWidth: 800, marginInline: "auto" }}>
        {children}
      </body>
    </html>
  );
}
