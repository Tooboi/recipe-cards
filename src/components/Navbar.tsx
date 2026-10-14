import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Logout from "@/components/buttons/Logout";
import { BookmarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SearchBar from "@/components/browse/SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/auth";
import CldImageWrapper from "./wrappers/CldImageWrapper";
import VaultMark from "./VaultMark";

const navLink =
  "relative py-1 text-sm font-semibold whitespace-nowrap text-ink-soft transition-colors hover:text-brand";

export default async function Navbar() {
  const session = await auth();
  const isSignedIn = !!session?.user;

  let internalUserId: string | null = null;
  if (session?.user?.email) {
    const dbUser = await prisma.user
      .findUnique({ where: { email: session.user.email }, select: { id: true } })
      .catch(() => null);
    internalUserId = dbUser?.id ?? null;
  }

  const links = [
    { href: "/explore", label: "Browse the Vault" },
    ...(isSignedIn && internalUserId
      ? [
          { href: `/users/${internalUserId}`, label: "My Vault" },
          { href: `/users/${internalUserId}/bookmarks`, label: "Saved" },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        {/* Brand */}
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label="Recipe Card Vault home">
          <VaultMark className="h-9 w-9 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-xl font-bold whitespace-nowrap text-ink sm:text-2xl">
              Recipe Card <span className="text-brand">Vault</span>
            </span>
            <span className="mt-1 hidden text-[10px] font-bold tracking-[0.22em] text-ink-soft uppercase sm:block">
              Family recipes, kept safe
            </span>
          </span>
        </Link>

        <div className="flex-1" />
        <SearchBar size="sm" placeholder="Search the vault…" className="hidden w-52 lg:block xl:w-64" />

        {/* Desktop links, grouped with the actions on the right */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={navLink}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="mx-1 hidden h-6 w-px bg-line md:block" aria-hidden />

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/explore"
            aria-label="Search recipes"
            className="flex h-10 w-10 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand lg:hidden"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Link>
          <Link href="/new-recipe" className="btn-brand hidden sm:inline-flex">
            <PlusIcon className="h-4 w-4" />
            Add Recipe
          </Link>

          {!isSignedIn && (
            <Link href="/signin" className="btn-outline hidden md:inline-flex">
              Sign In
            </Link>
          )}

          {isSignedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="avatar"
                  aria-label="Account menu"
                  className="hidden overflow-hidden rounded-full ring-2 ring-line transition hover:ring-brand md:block"
                >
                  <Avatar image={session.user.image} seed={internalUserId} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={12} align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{session.user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/users/${internalUserId}`}>My Vault</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/users/${internalUserId}/bookmarks`}>
                    Saved Recipes
                    <DropdownMenuShortcut>
                      <BookmarkIcon className="h-4 w-4" />
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Account settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Logout />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Phones / small tablets: everything lives in one menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Open menu"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition-colors hover:border-brand hover:text-brand md:hidden"
              >
                {isSignedIn ? (
                  <Avatar image={session.user.image} seed={internalUserId} small />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={10} align="end" className="w-60">
              {isSignedIn && (
                <>
                  <DropdownMenuLabel className="truncate">{session.user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/new-recipe">
                    Add a Recipe
                    <DropdownMenuShortcut>
                      <PlusIcon className="h-4 w-4" />
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                {links.map((l) => (
                  <DropdownMenuItem key={l.href} asChild>
                    <Link href={l.href}>{l.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {isSignedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Account settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Logout />
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/signin">Sign In</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup">Create an account</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function Avatar({
  image,
  seed,
  small = false,
}: {
  image?: string | null;
  seed: string | null;
  small?: boolean;
}) {
  const size = small ? 32 : 36;
  const cls = small ? "h-8 w-8 rounded-full" : "h-9 w-9 rounded-full";
  return image ? (
    <CldImageWrapper
      src={image}
      alt="Profile image"
      width={size}
      height={size}
      crop="fill"
      aspectRatio="1:1"
      className={`${cls} aspect-square`}
    />
  ) : (
    <Image
      className={`${cls} bg-brand-soft`}
      width={size}
      height={size}
      unoptimized
      src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?size=${size}&scale=90&mouth=concerned,default,eating,grimace,serious,smile,twinkle&seed=${seed}`}
      alt=""
    />
  );
}
