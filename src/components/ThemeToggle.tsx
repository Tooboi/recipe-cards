"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ComputerDesktopIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "Match my device", Icon: ComputerDesktopIcon },
] as const;

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  // The theme is only known in the browser; render a neutral icon until then.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const Icon = !mounted ? SunIcon : resolvedTheme === "dark" ? MoonIcon : SunIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Change colour theme"
          title="Theme"
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand"
        >
          <Icon className={`h-5 w-5 ${mounted ? "" : "opacity-0"}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={mounted ? theme : "system"} onValueChange={setTheme}>
          {OPTIONS.map(({ value, label, Icon: OptIcon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <OptIcon className="h-4 w-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
