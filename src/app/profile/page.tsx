/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { updateProfileImage } from "@/app/actions";
import Image from "next/image";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CldImageWrapper from "@/components/wrappers/CldImageWrapper";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex min-h-128 justify-center px-4">
        <div className="text-center w-full max-w-md mt-10 bg-slate-300 p-6 border-2 border-slate-700 rounded-lg shadow-md">
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
          className="px-4 py-2 rounded-md border-2 border-slate-600 bg-slate-300 hover:bg-slate-200"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="flex min-h-128 justify-center px-4">
      <div className="flexw-full max-w-xl mt-10 bg-slate-300 border-2 border-slate-700 rounded-lg p-6 shadow-md">
        <h1 className="text-2xl font-semibold mb-4">Profile</h1>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <CldUploadWidget
              uploadPreset="avatars"
              options={{
                folder: "recipe/avatars",
                sources: [
                  "local",
                  "dropbox",
                  "google_drive",
                  "instagram",
                  "unsplash",
                ],
                maxImageFileSize: 41943040,
                cropping: true,
                croppingAspectRatio: 1,
                multiple: false,
              }}
              onSuccess={async (result: any) => {
                try {
                  const image = result.info.secure_url;

                  await updateProfileImage({
                    id: user.id!,
                    image,
                  });

                  //  update NextAuth session
                  await (session as any).update({ image });
                  toast.success("Profile image updated");
                  router.refresh();
                } catch {}
              }}
              onError={async (result: any) => {
                toast.error(result.error || "Failed to update profile image");
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="relative group "
                >
                  {session?.user?.image ? (
                    <CldImageWrapper
                      src={session.user.image}
                      alt="Profile image"
                      width={80}
                      height={80}
                      crop="fill"
                      aspectRatio="1:1"
                      className="rounded-full aspect-square border-2 border-slate-700"
                    />
                  ) : (
                    <Image
                      width={80}
                      height={80}
                      unoptimized
                      className="rounded-full border-2 border-slate-700"
                      src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?size=64&seed=${user.id}`}
                      alt="avatar"
                    />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm text-slate-100 transition">
                    Change
                  </div>
                </button>
              )}
            </CldUploadWidget>

            <div>
              <p className="text-lg font-medium">
                {user.name ?? "Unnamed User"}
              </p>
              <p className="text-sm text-slate-700">{user.email}</p>
              <div className="text-[0.6rem] text-slate-500">{user.id}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 border-t-2 border-slate-600 pt-4 space-y-3">
          <Link
            href="/profile/change-username"
            className="block w-full px-4 py-2 rounded-md border-2 border-slate-600 bg-slate-400 hover:bg-slate-300 text-center"
          >
            Change Username
          </Link>

          <Link
            href="/profile/change-password"
            className="block w-full px-4 py-2 rounded-md border-2 border-slate-600 bg-slate-400 hover:bg-slate-300 text-center"
          >
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}
