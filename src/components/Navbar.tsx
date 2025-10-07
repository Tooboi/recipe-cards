import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link';
import prisma from '@/lib/prisma';

export default async function Navbar() {
  const clerkUser = await currentUser();
  let internalUserId: string | null = null;

  if (clerkUser?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
      select: { id: true },
    });
    console.log();


    internalUserId = dbUser?.id || null;
  }

  return (
    <div className="bg-gray-400 px-2 border-b-2 border-gray-800 z-100 top-0 sticky h-12">
      <div className="flex my-auto flex-row justify-between gap-4 content-center h-full">
        <Link href="/" className="text-3xl  sm:block hidden my-auto">
          RECIPE CARD EDITOR
        </Link>
        <Link href="/" className="text-3xl  sm:hidden block my-auto">
          RCE
        </Link>
        <div className="flex-grow"></div>


        <div className="flex flex-row  my-auto">
          <div className="flex">
            <Link className="px-2 py-1 mr-2 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:block hidden rounded-sm" href={'/explore'}>
              Explore
            </Link>
            <Link className="px-2 py-1 mr-2 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:hidden block  rounded-sm" href={'/explore'}>
              All
            </Link>
            <Link className="px-2 py-1 mr-2 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:block hidden rounded-sm" href={'/new-recipe'}>
              New Recipe
            </Link>
            <Link className="px-2 py-1 mr-2 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:hidden block rounded-sm" href={'/new-recipe'}>
              New
            </Link>
            <SignedIn>
              <Link className="px-2 py-1 mr-2 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:block hidden rounded-sm" href={`/users/${internalUserId}`}>
                My Recipes
              </Link>
              <Link className="px-2 py-1 mr-2 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 md:hidden block rounded-sm" href={`/users/${internalUserId}`}>
                Mine
              </Link>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton><button className='cursor-pointer px-2 py-1 mr-2 mt-0.5 h-max bg-gray-400 hover:bg-gray-300 rounded-sm'>Sign In</button></SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </div>
  );
}
