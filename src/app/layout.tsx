import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
// import SessionProvider from './SessionProvider';
import './globals.css';

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
    
    <html lang="en" >
      <body className={`${rubik.className} antialiased`}>
        {/* <SessionProvider> */}
          <main className="m-auto min-h-screen min-w-[300px] max-w-7xl p-4">{children}</main>
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
