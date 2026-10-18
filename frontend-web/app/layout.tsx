import type { Metadata } from "next";
// Next.js default fonts (adjust if you used different ones during setup)
import { Inter } from "next/font/google"; 
import "./globals.css";

// 1. Import your Auth Provider
import { AuthProvider } from "@/components/providers/AuthContext";

// 2. Import your Shell Components
// Note: If you saved these inside a specific folder like components/ui, update the paths below.
import Navbar from "@/components/Navbar";
import EscrowStatusBar from "@/components/EscrowStatusBar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Buyer's High | Premium Gadget Escrow",
  description: "Secure, high-trust P2P escrow marketplace for secondhand gadgets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* flex flex-col min-h-screen ensures the footer always pushes to the bottom */}
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        
        {/* The AuthProvider wraps the entire app so all components know the user's login state */}
        <AuthProvider>
          
          {/* <Navbar /> */}
          
          {/* Mounts directly below the top bar during active trades (ui_1 spec) */}
          {/* <EscrowStatusBar /> */}

          {/* Main Viewport: pb-24 prevents the mobile bottom nav from covering content */}
          <main className="flex-1 container mx-auto px-4 md:px-8 py-6 pb-24 md:pb-6">
            {children}
          </main>
          
          <MobileBottomNav />

        </AuthProvider>
      </body>
    </html>
  );
}