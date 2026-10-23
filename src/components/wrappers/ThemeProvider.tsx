"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Light/dark theme. Follows the device setting until the visitor picks one (remembered per browser). */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
