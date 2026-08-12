import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import AuthGate from "./components/AuthGate";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Closet",
  description: "Your virtual closet"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-body`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-plum/10 bg-cream sticky top-0 z-20">
            <div className="max-w-5xl mx-auto px-5 py-4 flex items-baseline justify-between">
              <h1 className="font-display text-2xl text-plum tracking-tight">Closet</h1>
              <span className="text-xs uppercase tracking-widest text-gold">est. by you</span>
            </div>
            <NavBar />
          </header>
          <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-6">
            <AuthGate>{children}</AuthGate>
          </main>
        </div>
      </body>
    </html>
  );
}
