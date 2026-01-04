import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
// import { currentUser } from "@clerk/nextjs/server";
// import { SignOutButton, UserAvatar } from "@clerk/nextjs";
import Logout from "@/components/Logout";
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
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

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
    <div className="bg-gray-400 px-2 border-b-2 border-gray-700 sticky top-0 z-50 h-12 drop-shadow-lg">
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
            className="px-2 py-1 rounded-sm hover:bg-gray-300 hidden md:block"
          >
            Explore
          </Link>

          <Link
            href="/new-recipe"
            className="px-2 py-1 rounded-sm hover:bg-gray-300 hidden md:block"
          >
            New Recipe
          </Link>

          {/* ================= SIGNED IN ================= */}
          {isSignedIn && (
            <>
              <Link
                href={`/users/${internalUserId}`}
                className="px-2 py-1 rounded-sm hover:bg-gray-300 hidden md:block"
              >
                My Recipes
              </Link>

              <Link href={`/users/${internalUserId}/bookmarks`}>
                <BookmarkIcon className="w-7 h-7 text-gray-700 hover:text-amber-700 transition" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full ml-2">
                    <div className="border-2 border-gray-800 rounded-full">
                      <Image
                        className="w-full h-full grow bg-gray-500/50 rounded-full"
                        width={80}
                        height={80}
                        unoptimized
                        src={`https://api.dicebear.com/9.x/identicon/svg?size=80&scale=80&seed=${session?.user?.id}&backgroundType[]&backgroundColor=transparent`}
                        alt={session?.user?.id || "user"}
                      />
                    </div>
                  </Button>
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
              className="px-2 py-1 rounded-sm hover:bg-gray-300"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
