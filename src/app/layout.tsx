import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';
// import Navbar from '@/components/Navbar';
import { SessionProvider } from 'next-auth/react';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/sonner';

const rubik = Rubik({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recipe Card',
  description: 'Recipe Card Generator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <Providers>
          <body className={`${rubik.className} antialiased main-bg`}>
            {/* <Navbar /> */}
            <main className="m-auto min-h-screen min-w-[300px] max-w-7xl p-4">
              {children} <Toaster position="top-right" />
            </main>
          </body>
        </Providers>
      </SessionProvider>
    </html>
  );
}
