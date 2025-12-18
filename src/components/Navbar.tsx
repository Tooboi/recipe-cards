import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserAvatar,
} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { PlusIcon as PlusSolidIcon } from "@heroicons/react/24/solid";
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

export default async function Navbar() {
  const clerkUser = await currentUser();
  let internalUserId: string | null = null;

  if (clerkUser?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true },
    });
    internalUserId = dbUser?.id || null;
  }

  return (
    <div className="bg-gray-400 px-2 border-b-2 border-gray-700 z-100 top-0 sticky h-12 drop-shadow-lg">
      <div className="flex my-auto flex-row justify-between gap-4 content-center h-full">
        <Link href="/" className="text-3xl  sm:block hidden my-auto">
          RECIPE CARD MAKER
        </Link>
        <Link href="/" className="text-3xl  sm:hidden block my-auto">
          RCM
        </Link>
        <div className="flex-grow"></div>

        <div className="flex flex-row  items-center">
          <div className="flex">
            <Link
              className="transition-all px-2 py-1 mr-1 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:block hidden rounded-sm"
              href={"/explore"}
            >
              Explore
            </Link>
            <Link
              className="transition-all px-1 py-1 mr-1 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:hidden block  rounded-sm"
              href={"/explore"}
            >
              All
            </Link>
            <Link
              className="transition-all px-1 py-1 mr-1 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:block hidden rounded-sm"
              href={"/new-recipe"}
            >
              New Recipe
            </Link>
            <Link
              className="transition-all px-1 py-1 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:hidden block rounded-sm"
              href={"/new-recipe"}
            >
              New
            </Link>
            <SignedIn>
              <Link
                className="transition-all px-1 py-1 mr-1 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:block hidden rounded-sm"
                href={`/users/${internalUserId}`}
              >
                My Recipes
              </Link>

              {/* <Link
                className="transition-all px-1 py-1 mr-1 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:hidden block rounded-sm"
                href={`/users/${internalUserId}`}
              >
                Mine
              </Link> */}
              <Link
                className="transition-all pr-2 pl-1 py-1  h-max rounded-sm"
                href={`/users/${internalUserId}/bookmarks`}
              >
                <BookmarkSolidIcon className="w-7 h-7 text-gray-700 bg-gray-400 hover:text-amber-900 hover:stroke-2 hover:stroke-amber-600 hover:infill-amber-500 transition-all active:scale-95 hidden md:block" />
              </Link>
              {/* <UserButton /> */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <div className="border-2 rounded-full border-gray-800">
                      <UserAvatar />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-50" sideOffset={12}>
                  <DropdownMenuLabel>Recipes</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={"/explore"}>Explore</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${internalUserId}`}>My Recipes</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/new-recipe`}>
                      New Recipe
                      <DropdownMenuShortcut>
                        <PlusSolidIcon className="text-primary " />
                      </DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${internalUserId}/bookmarks`}>
                      My Bookmarks
                      <DropdownMenuShortcut>
                        <BookmarkSolidIcon className="text-primary " />
                      </DropdownMenuShortcut>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={"/profile"}>{clerkUser?.username}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <SignOutButton />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="transition-all cursor-pointer px-2 py-1 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 rounded-sm">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </div>
  );
}
