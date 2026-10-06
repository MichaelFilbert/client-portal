import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal — client approvals for freelancers",
  description: "Share a link. Clients approve work, request changes, and see what's next.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
