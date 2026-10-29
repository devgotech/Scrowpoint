import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import "./globals.css";

import { AuthProvider } from "@/components/providers/AuthContext";
import MobileBottomNav from "@/components/MobileBottomNav";
import { LiveChatWidget } from "@/components/support/LiveChatWidget";
import { TooltipProvider } from "@/components/ui/tooltip";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-primary",
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-secondary",
});
const spaceMono = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
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
    <html lang="en" className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${spaceMono.variable}`}>
      {/* flex flex-col min-h-screen ensures the footer always pushes to the bottom */}
      <body className="antialiased flex flex-col min-h-screen">
        
        {/* The AuthProvider wraps the entire app so all components know the user's login state */}
        <AuthProvider>
          <TooltipProvider delayDuration={300}>
            <main>
              {children}
            </main>
            <Suspense fallback={null}>
              <MobileBottomNav />
            </Suspense>
            <LiveChatWidget />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}