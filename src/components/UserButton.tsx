// import profilePicPlaceholder from "@/assets/profile-pic-placeholder.png";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

// import {
//   ArrowRightStartOnRectangleIcon,
//   AdjustmentsHorizontalIcon,
//   UserIcon,
//   PencilSquareIcon,
//   FilmIcon,
//   PhotoIcon,
// } from "@heroicons/react/24/solid";

interface UserButtonProps {
  session: Session | null;
}

export default function UserButton({ session }: UserButtonProps) {
  const user = session?.user;

  return (
    <div className="dropdown-end dropdown">
      <div role="button" tabIndex={0} className="btn-ghost btn-circle btn">
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
            className="dropdown-content menu menu-sm z-30 mt-2 w-52 gap-2 rounded-lg border-2 border-gray-700 bg-gray-900 p-2 shadow"
          >
            <li className="group rounded-lg transition-all hover:bg-gray-800 active:bg-gray-900 active:ring-2 active:ring-inset active:ring-gray-700">
              <Link
                href="/add-render"
                className="z-30 flex items-center rounded-lg p-2 text-gray-300 transition group-hover:bg-gray-800 group-active:bg-gray-900"
                role="button"
              >
                {/* <PhotoIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500" /> */}
                <span className="ml-3 flex group-hover:text-gray-200">
                  Add Render
                </span>
              </Link>
            </li>
            <li className="group rounded-lg transition-all hover:bg-gray-800 active:bg-gray-900 active:ring-2 active:ring-inset active:ring-gray-700">
              <Link
                href="/edit"
                className="z-30 flex items-center rounded-lg p-2 text-gray-300 transition group-hover:bg-gray-800 group-active:bg-gray-900"
                role="button"
              >
                {/* <PencilSquareIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500" /> */}
                <span className="ml-3 flex group-hover:text-gray-200">
                  Edit Renders
                </span>
              </Link>
            </li>
            <div className="w-full border border-brand-700"></div>
            <li className="group rounded-lg transition-all hover:bg-gray-800 active:bg-gray-900 active:ring-2 active:ring-inset active:ring-gray-700">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text  flex w-full items-center rounded-lg p-2 text-gray-300 transition "
              >
                {/* <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500" /> */}

                <span className="ml-3 flex group-hover:text-gray-200">
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
          className="dropdown-content menu menu-sm z-30 mt-2 w-52 rounded-lg border-2 border-gray-700 bg-gray-900 p-2 shadow "
        >
          <li className="group rounded-lg transition-all hover:bg-gray-800 active:bg-gray-900 active:ring-2 active:ring-inset active:ring-gray-700">
            <button
              onClick={() => signIn()}
              className="text flex w-full items-center rounded-lg p-2 text-gray-300 transition active:bg-gray-900 group-hover:bg-gray-800"
            >
              {/* <UserIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500 " /> */}

              <span className="ml-3 hidden group-hover:text-gray-900 md:flex">
                Sign In
              </span>
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
