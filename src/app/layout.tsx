import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';
// import { SessionProvider } from "next-auth/react"


const rubik = Rubik({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recipe Card',
  description: 'Recipe Card Generator',
};
import { ClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${rubik.className} antialiased main-bg`}>
          <main className="m-auto min-h-screen min-w-[300px] pb-8">
            <Navbar />
            <ClerkLoading>
              <div className="flex flex-col items-center text-center mt-32">LOADING...</div>
            </ClerkLoading>
            <ClerkLoaded>
              {children} <Toaster position="bottom-right" />
            </ClerkLoaded>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
