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
import Logout from "@/components/buttons/Logout";
// import { revalidatePath } from "next/cache";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex min-h-128 justify-center px-4">
        <div className="panel text-center w-full max-w-md mt-10 p-6">
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
          className="btn-outline"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="flex  justify-center px-4">
      <div className="panel w-full max-w-xl mt-10 pt-6 px-6">
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
                  router.replace("/profile");
                  // revalidatePath("/profile");
                  //  update NextAuth session
                  await (session as any).update({ image });
                  toast.success("Profile image updated");
                } catch {
                  toast.error(result.error || "Failed to update profile image");
                }
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
                      className="rounded-full aspect-square ring-4 ring-brand-soft"
                    />
                  ) : (
                    <Image
                      width={80}
                      height={80}
                      unoptimized
                      className="rounded-full ring-4 ring-brand-soft"
                      src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?size=64&seed=${user.id}`}
                      alt="avatar"
                    />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm text-stone-100 transition">
                    Change
                  </div>
                </button>
              )}
            </CldUploadWidget>

            <div>
              <p className="text-lg font-medium">
                {user.name ?? "Unnamed User"}
              </p>
              <p className="text-sm text-ink-soft">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 border-t border-line pt-4 space-y-3 flex flex-col">
          <div className="flex gap-2 w-full">
            <Link
              href="/profile/change-username"
              className="btn-outline w-full py-2.5"
            >
              Change Username
            </Link>

            <Link
              href="/profile/change-password"
              className="btn-outline w-full py-2.5"
            >
              Change Password
            </Link>
          </div>
          <Logout className="btn-ghost w-full py-2.5 text-brand" label="Sign out" />
          <div className="items-end h-full pb-2">
            <div className="text-[0.6rem] text-ink-soft text-end">{user.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
