import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default async function Navbar() {
  return (
    <div className="bg-stone-300 px-2 border-b-2 border-stone-800 shadow-md z-100 top-0 sticky h-12">
      <div className="flex my-auto flex-row justify-between gap-4 content-center h-full">
        <Link href="/" className="text-3xl  sm:block hidden my-auto">
          RECIPE CARD GENERATOR
        </Link>
        <Link href="/" className="text-3xl  sm:hidden block my-auto">
          RCG
        </Link>
        <div className="flex-grow"></div>

        <div className="flex flex-row  my-auto">
          <div className="flex">
            <Link className="px-2 py1 mr-2 mt-0.5 h-max bg-stone-400 hover:bg-stone-300 sm:block hidden rounded-sm" href={'/new-recipe'}>
              New Recipe
            </Link>
            <Link className="px-2 py1 mr-2 mt-0.5 h-max bg-stone-400 hover:bg-stone-300 sm:hidden block rounded-sm" href={'/new-recipe'}>
              New
            </Link>
            <Link className="px-2 py1 mr-2 mt-0.5 h-max bg-stone-400 hover:bg-stone-300  rounded-sm" href={'/recipes'}>
              My Recipes
            </Link>
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
}
