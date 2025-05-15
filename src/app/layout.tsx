
"use client"; // Add this to make RootLayout a client component

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/features/app-sidebar";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="antialiased min-h-screen w-full flex">
          <main className="flex-grow flex">{children}</main>
      </body>
    </html>
  );
}