import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { CommandPalette } from "@/components/CommandPalette";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linux Commands Hub",
  description:
    "A searchable reference for Linux commands — what they do, and why they're called that.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* This script runs before React hydrates to prevent the screen flicker from the theme. */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `const t=localStorage.getItem('theme');if(t&&t!=='system')document.documentElement.dataset.theme=t;`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <SiteHeader />
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
