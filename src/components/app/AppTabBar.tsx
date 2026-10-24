"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  BookOpenIcon as BookOpenSolid,
  BookmarkIcon as BookmarkSolid,
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  UserCircleIcon as UserCircleSolid,
} from "@heroicons/react/24/solid";

/** Bottom tabs for the installed app. Hidden on the regular website (see "standalone:" in CSS). */
export default function AppTabBar({ userId }: { userId: string | null }) {
  const pathname = usePathname();
  const mine = userId ? `/users/${userId}` : "/signin";
  const saved = userId ? `/users/${userId}/bookmarks` : "/signin";

  const tabs = [
    { href: mine, label: "My Recipes", Icon: BookOpenIcon, Active: BookOpenSolid, on: !!userId && pathname === mine },
    { href: saved, label: "Saved", Icon: BookmarkIcon, Active: BookmarkSolid, on: !!userId && pathname === saved },
    { href: "/new-recipe", label: "Add", Icon: PlusIcon, Active: PlusIcon, on: pathname === "/new-recipe", add: true },
    {
      href: "/explore",
      label: "Explore",
      Icon: MagnifyingGlassIcon,
      Active: MagnifyingGlassSolid,
      on: pathname === "/explore" || pathname === "/",
    },
    {
      href: userId ? "/profile" : "/signin",
      label: userId ? "Profile" : "Sign in",
      Icon: UserCircleIcon,
      Active: UserCircleSolid,
      on: pathname.startsWith("/profile") || pathname === "/signin" || pathname === "/signup",
    },
  ];

  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-50 hidden border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur standalone:block print:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {tabs.map(({ href, label, Icon, Active, on, add }) => (
          <li key={label}>
            <Link
              href={href}
              aria-current={on ? "page" : undefined}
              className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                on ? "text-brand" : "text-ink-soft hover:text-ink"
              }`}
            >
              <span className="flex h-7 items-center">
                {add ? (
                  <span className="flex h-7 w-11 items-center justify-center rounded-full bg-brand text-white shadow-sm">
                    <PlusIcon className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                ) : on ? (
                  <Active className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
