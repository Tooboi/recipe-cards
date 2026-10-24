import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { connectToDatabase } from "@/lib/mongo";
import AuthSessionProvider from "@/components/wrappers/SessionProvider";
import ThemeProvider from "@/components/wrappers/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { ADS, adsEnabled } from "@/lib/ads";

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
    "Keep your family recipes safe, share them, and print them as full pages or classic 3×5 and 4×6 recipe cards.",
  // Google Search Console ownership check (the content="…" value from its HTML tag).
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
  // Lets AdSense verify the site during sign-up.
  ...(adsEnabled && { other: { "google-adsense-account": ADS.client } }),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectToDatabase;

  return (
    // next-themes sets the "dark" class on <html> before React loads, hence suppressHydrationWarning.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} font-sans antialiased bg-cream text-ink`}
      >
        <ThemeProvider>
        <AuthSessionProvider>
          <div className="flex min-h-screen min-w-[300px] flex-col">
            <Navbar />
            <main className="flex-1 pb-12">{children}</main>
            <Footer />
          </div>
          <Analytics />
          {adsEnabled && (
            <Script
              id="adsbygoogle-init"
              async
              strategy="afterInteractive"
              crossOrigin="anonymous"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.client}`}
            />
          )}
          <Toaster position="bottom-right" />
        </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
