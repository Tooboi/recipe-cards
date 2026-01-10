import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
// import { SessionProvider } from "next-auth/react";
import { connectToDatabase } from "@/lib/mongo";
import AuthSessionProvider from "@/components/wrappers/SessionProvider";
// import { getServerSession } from "next-auth";

import { Analytics } from "@vercel/analytics/next";

const rubik = Rubik({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recipe Card Vault",
  description: "Recipe Card Vault",
};
import {
  ClerkProvider,
  // ClerkLoaded, ClerkLoading
} from "@clerk/nextjs";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectToDatabase;

  return (
    <ClerkProvider>
      {/* <SessionProvider session={session}>  */}
      <html lang="en">
        <body className={`${rubik.className} antialiased main-bg`}>
          <AuthSessionProvider>
            <main className="m-auto min-h-screen min-w-[300px] pb-8">
              <Navbar />
              {children}
              <Analytics />
              <Toaster position="bottom-right" />
            </main>
          </AuthSessionProvider>
        </body>
      </html>
      {/* // </SessionProvider>  */}
    </ClerkProvider>
  );
}
