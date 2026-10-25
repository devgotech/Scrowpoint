import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import "./globals.css";

import { AuthProvider } from "@/components/providers/AuthContext";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { TooltipProvider } from "@/components/ui/tooltip";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
});
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Scrowpoint | Premium Gadget Escrow",
  description: "Secure, high-trust P2P escrow marketplace for secondhand gadgets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${geist.variable} ${geistMono.variable}`}>
      {/* flex flex-col min-h-screen ensures the footer always pushes to the bottom */}
      <body className="antialiased flex flex-col min-h-screen">
        
        {/* The AuthProvider wraps the entire app so all components know the user's login state */}
        <AuthProvider>
          <TooltipProvider delayDuration={300}>
            <main className="mx-auto w-full max-w-[var(--page-max-width)] flex-1 px-4 py-6 pb-24 md:px-8 md:pb-6">
              {children}
            </main>
            <Suspense fallback={null}>
              <MobileBottomNav />
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}