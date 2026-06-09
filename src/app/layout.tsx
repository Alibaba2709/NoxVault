import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoxVault",
  description: "Dashboard rilassante per gestire budget e spese personali",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="min-h-full bg-slate-950 text-slate-300">{children}</body>
    </html>
  );
}
