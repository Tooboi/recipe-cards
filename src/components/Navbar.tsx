import { auth } from "../lib/auth";
import Image from "next/image";
import Link from "next/link";
import SignInButton from "@/components/auth/signin-button";

export default async function Navbar() {
  const session = await auth();

  const user = session?.user;
  console.log(user);

  return (
    <div className="bg-slate-300 py-1 px-2">
      <div className="navbar m-auto flex-row gap-2">
        <div className="justify-start">
          <Link
            href="/"
            className="text-3xl mx-auto xs:mx-0 normal-case hover:bg-transparent tracking-wide xs:tracking-wide "
          >
            {/* <Image src={logo} height={40z} width={40} alt="GAMMA2DOT2" /> */}
            RECIPE BOX
          </Link>
          <p>{user?.name}</p>
        </div>
        {/* <div className=" hidden lg:flex"><Tabs /></div> */}
        <div className="flex-none gap-2  xs:flex">
          <div className="dropdown-end dropdown">
            <div
              role="button"
              tabIndex={0}
              className="btn-ghost btn-circle btn"
            >
              {user ? (
                <Image
                  src={
                    user?.image ||
                    "https://source.boringavatars.com/marble/40/Maria%20Mitchell"
                  }
                  alt="Profile picture"
                  width={40}
                  height={40}
                  className="w-10 rounded-full"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block h-5 w-5 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
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
                    <Link
                      href="/add-render"
                      className="z-30 flex items-center rounded-lg p-2 text-stone-300 transition group-hover:bg-stone-800 group-active:bg-stone-900"
                      role="button"
                    >
                      {/* <PhotoIcon className="h-6 w-6 text-stone-400 group-hover:text-stone-500" /> */}
                      <span className="ml-3 flex group-hover:text-stone-200">
                        Add Render
                      </span>
                    </Link>
                  </li>
                  <li className="group rounded-lg transition-all hover:bg-stone-800 active:bg-stone-900 active:ring-2 active:ring-inset active:ring-stone-700">
                    <Link
                      href="/edit"
                      className="z-30 flex items-center rounded-lg p-2 text-stone-300 transition group-hover:bg-stone-800 group-active:bg-stone-900"
                      role="button"
                    >
                      {/* <PencilSquareIcon className="h-6 w-6 text-stone-400 group-hover:text-stone-500" /> */}
                      <span className="ml-3 flex group-hover:text-stone-200">
                        Edit Renders
                      </span>
                    </Link>
                  </li>
                  <div className="w-full border border-brand-700"></div>
                  <li className="group rounded-lg transition-all hover:bg-stone-800 active:bg-stone-900 active:ring-2 active:ring-inset active:ring-stone-700">
                    <button
                      // onClick={() => signOut({ callbackUrl: "/" })}
                      className="text  flex w-full items-center rounded-lg p-2 text-stone-300 transition "
                    >
                      {/* <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-stone-400 group-hover:text-stone-500" /> */}

                      <span className="ml-3 flex group-hover:text-stone-200">
                        Sign Out
                      </span>
                    </button>
                  </li>
                </ul>
              </>
            )}

            {!user && (
              <ul
                tabIndex={0}
                role="list"
                className="dropdown-content menu menu-sm z-30 mt-2 w-52 rounded-lg border-2 border-stone-700 bg-stone-900 p-2 shadow "
              >
                <li className="group rounded-lg transition-all hover:bg-stone-800 active:bg-stone-900 active:ring-2 active:ring-inset active:ring-stone-700">
                <SignInButton/>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
