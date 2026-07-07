import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Metamend Audit Builder",
  description: "Premium SaaS reporting platform for SEO, CRO, and SEM audits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark h-full antialiased bg-[#0B0B0C]`}
    >
      <head>
        <link rel="stylesheet" href="/outfit.css" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-white/90">{children}</body>
    </html>
  );
}