import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
// import { currentUser } from "@clerk/nextjs/server";
// import { SignOutButton, UserAvatar } from "@clerk/nextjs";
import Logout from "@/components/buttons/Logout";
import { BookmarkIcon, PlusIcon } from "@heroicons/react/24/solid";
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
// import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import CldImageWrapper from "./wrappers/CldImageWrapper";
// import Avatar from "boring-avatars";

export default async function Navbar() {
  // Find user object ID from session
  const session = await auth();
  const isSignedIn = !!session?.user;

  let internalUserId: string | null = null;

  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    internalUserId = dbUser?.id ?? null;
    console.log(internalUserId);
  }

  return (
    <div className="bg-slate-400 px-2 border-b-2 border-slate-700 sticky top-0 z-50 h-12 drop-shadow-lg">
      <div className="flex h-full items-center justify-between gap-4">
        <Link href="/" className="text-3xl hidden sm:block">
          RECIPE CARD VAULT
        </Link>
        <Link href="/" className="text-3xl sm:hidden">
          RCV
        </Link>

        <div className="flex-grow" />

        <div className="flex items-center gap-1">
          <Link
            href="/explore"
            className="px-2 py-1 rounded-sm hover:bg-slate-300 hidden md:block"
          >
            Explore
          </Link>

          <Link
            href="/new-recipe"
            className="px-2 py-1 rounded-sm hover:bg-slate-300 hidden md:block"
          >
            New Recipe
          </Link>

          {/* ================= SIGNED IN ================= */}
          {isSignedIn && (
            <>
              <Link
                href={`/users/${internalUserId}`}
                className="px-2 py-1 rounded-sm hover:bg-slate-300 hidden md:block"
              >
                My Recipes
              </Link>

              <Link href={`/users/${internalUserId}/bookmarks`}>
                <BookmarkIcon className="w-7 h-7 text-slate-700 hover:text-amber-600 active:text-amber-700 transition" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    id="avatar"
                    aria-label="Avatar"
                    className="rounded-full ml-2 hover:brightness-105 active:brightness-100 hover:rotate-8 transition-all"
                  >
                    {session.user.image ? (
                      <CldImageWrapper
                        src={session.user.image}
                        alt="Profile image"
                        width={32}
                        height={32}
                        crop="fill"
                        aspectRatio="1:1"
                        className="rounded-full aspect-square border-2 border-slate-700"
                      />
                    ) : (
                      <Image
                        className="w-full h-full grow border-2 border-slate-600 bg-slate-500/60 rounded-full overflow-hidden"
                        width={100}
                        height={100}
                        unoptimized
                        src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?size=32&scale=90&mouth=concerned,default,eating,grimace,serious,smile,twinkle&seed=${internalUserId}`}
                        alt={internalUserId || "null"}
                      />
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={12}>
                  <DropdownMenuLabel>Recipes</DropdownMenuLabel>

                  <DropdownMenuItem asChild>
                    <Link href="/explore">Explore</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={`/users/${internalUserId}`}>My Recipes</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/new-recipe">
                      New Recipe
                      <DropdownMenuShortcut>
                        <PlusIcon className="w-4 h-4" />
                      </DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={`/users/${internalUserId}/bookmarks`}>
                      My Bookmarks
                      <DropdownMenuShortcut>
                        <BookmarkIcon className="w-4 h-4" />
                      </DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuLabel>Account</DropdownMenuLabel>

                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">{session?.user?.name}</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Logout />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {/* ================= SIGNED OUT ================= */}
          {!isSignedIn && (
            <Link
              href="/signin"
              className="px-2 py-1 rounded-sm hover:bg-slate-300"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
