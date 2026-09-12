import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Financial Agent Interface",
  description: "AI-powered financial planning dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
