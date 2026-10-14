import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { connectToDatabase } from "@/lib/mongo";
import AuthSessionProvider from "@/components/wrappers/SessionProvider";
import { Analytics } from "@vercel/analytics/next";

// Serif display face for titles, friendly sans for body copy.
const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Recipe Card Vault — Family recipes, kept safe and ready to print",
    template: "%s | Recipe Card Vault",
  },
  description:
    "Keep your family recipes safe in the vault, share them, and print them as full pages or classic 3×5 and 4×6 recipe cards.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectToDatabase;

  return (
    <html lang="en">
      <body
        className={`${display.variable} ${body.variable} font-sans antialiased bg-cream text-ink`}
      >
        <AuthSessionProvider>
          <div className="flex min-h-screen min-w-[300px] flex-col">
            <Navbar />
            <main className="flex-1 pb-12">{children}</main>
            <Footer />
          </div>
          <Analytics />
          <Toaster position="bottom-right" />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
