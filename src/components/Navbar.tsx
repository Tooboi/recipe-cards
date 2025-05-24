import { auth } from '../lib/auth';
import Image from 'next/image';
import Link from 'next/link';
import SignInButton from '@/components/auth/signin-button';
import SignOutButton from '@/components/auth/signout-button';
import Avatar from 'boring-avatars';

export default async function Navbar() {

  const session = await auth();
  const user = session?.user;
  // console.log(user);

  return (
    <div className="bg-slate-300 px-2 border-b-2 border-slate-800 shadow-md z-100 top-0 sticky h-12">
      <div className="flex my-auto flex-row justify-between gap-4 content-center h-full">
        <Link href="/" className="text-3xl my-auto">
          {/* <Image src={logo} height={40z} width={40} alt="GAMMA2DOT2" /> */}
          RECIPE CARD GENERATOR
        </Link>
        <div className="flex-grow"></div>
        <div role="button" tabIndex={0} className=" my-auto">
          {user ? <Link className='font-semibold' href={'/new-recipe'}>NEW RECIPE</Link> : <Link className='font-semibold' href={'/new-recipe'}>NEW RECIPE</Link>}
        </div>
        <div className="flex my-auto">{!user ? <SignInButton /> : <SignOutButton />}</div>

        <div className="flex flex-row  my-auto">
          <div role="button" tabIndex={0} className="">
            {user ? (
              <Image src={user?.image || 'https://source.boringavatars.com/marble/40/Maria%20Mitchell'} alt="Profile picture" width={32} height={32} className="w-8 rounded-full" />
            ) : (
              <Avatar name={'recipe123'} colors={['#5b1d99', '#0074b4', '#00b34c', '#ffd41f', '#fc6e3d']} variant="beam" size={32} />
            )}
          </div>

          {user && (
            <>
              {/* {user?.email === process.env.ADMIN_EMAIL && ( */}
              <ul
                tabIndex={0}
                role="list"
                className="
                  hidden
                  dropdown-content menu menu-sm z-30 mt-2 w-52 gap-2 rounded-lg border-2 border-stone-700 bg-stone-900 p-2 shadow"
              >
                <li className="group rounded-lg transition-all hover:bg-stone-800 active:bg-stone-900 active:ring-2 active:ring-inset active:ring-stone-700">
                  <Link href="/add-render" className="z-30 flex items-center rounded-lg p-2 text-stone-300 transition group-hover:bg-stone-800 group-active:bg-stone-900" role="button">
                    {/* <PhotoIcon className="h-6 w-6 text-stone-400 group-hover:text-stone-500" /> */}
                    <span className="ml-3 flex group-hover:text-stone-200">Add Render</span>
                  </Link>
                </li>
                <li className="group rounded-lg transition-all hover:bg-stone-800 active:bg-stone-900 active:ring-2 active:ring-inset active:ring-stone-700">
                  <Link href="/edit" className="z-30 flex items-center rounded-lg p-2 text-stone-300 transition group-hover:bg-stone-800 group-active:bg-stone-900" role="button">
                    {/* <PencilSquareIcon className="h-6 w-6 text-stone-400 group-hover:text-stone-500" /> */}
                    <span className="ml-3 flex group-hover:text-stone-200">Edit Renders</span>
                  </Link>
                </li>
                <div className="w-full border border-brand-700"></div>
                <li className="group rounded-lg transition-all hover:bg-stone-800 active:bg-stone-900 active:ring-2 active:ring-inset active:ring-stone-700">
                  <button
                    // onClick={() => signOut({ callbackUrl: "/" })}
                    className="text  flex w-full items-center rounded-lg p-2 text-stone-300 transition "
                  >
                    {/* <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-stone-400 group-hover:text-stone-500" /> */}

                    <span className="ml-3 flex group-hover:text-stone-200">Sign Out</span>
                  </button>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
