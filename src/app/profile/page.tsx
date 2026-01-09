"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-128 justify-center px-4">
        <div className="text-center w-full max-w-md mt-10 bg-gray-300 p-6 border-2 border-gray-700 rounded-lg shadow-md">
          Loading...
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-128 items-center justify-center flex-col gap-4">
        <h1 className="text-xl font-medium">You’re not signed in</h1>
        <Link
          href="/signin"
          className="px-4 py-2 rounded-md border-2 border-gray-600 bg-gray-300 hover:bg-gray-200"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="flex min-h-128 justify-center px-4">
      <div className="flexw-full max-w-xl mt-10 bg-gray-300 border-2 border-gray-700 rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt="Profile image"
              width={80}
              height={80}
              className="rounded-full border-2 border-gray-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-400 flex items-center justify-center border-2 border-gray-700">
              <Image
                className="w-full h-full grow bg-gray-500/60 rounded-full overflow-hidden"
                width={100}
                height={100}
                unoptimized
                src={`https://api.dicebear.com/9.x/pixel-art/svg?size=64&seed=${user.id}`}
                alt={user.id || "null"}
              />
            </div>
          )}

          <div>
            <p className="text-lg font-medium">{user.name ?? "Unnamed User"}</p>
            <p className="text-sm text-gray-700">{user.email}</p>
            <div className="text-[0.6rem] text-gray-500">{user.id}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 border-t-2 border-gray-600 pt-4 space-y-3">
          <Link
            href="/profile/change-username"
            className="block w-full px-4 py-2 rounded-md border-2 border-gray-600 bg-gray-400 hover:bg-gray-300 text-center"
          >
            Change Username
          </Link>

          <Link
            href="/profile/change-password"
            className="block w-full px-4 py-2 rounded-md border-2 border-gray-600 bg-gray-400 hover:bg-gray-300 text-center"
          >
            Change Password
          </Link>
        </div>
        
      </div>
    </div>
  );
}
