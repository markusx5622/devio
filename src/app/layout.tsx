import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devio",
  description: "Statistical Process Control analysis for the rest of us.",
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
