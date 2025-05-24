import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';
// import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

const rubik = Rubik({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recipe Card',
  description: 'Recipe Card Generator',
};
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${rubik.className} antialiased main-bg`}>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {/* <Navbar /> */}
          <main className="m-auto min-h-screen min-w-[300px] max-w-7xl p-4">
            {children} <Toaster position="top-right" />
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
