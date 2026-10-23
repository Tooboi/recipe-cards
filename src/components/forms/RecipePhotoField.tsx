"use client";

import { CldImage, CldUploadWidget } from "next-cloudinary";
import { ArrowPathIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";

const MAX_FILE_SIZE = 41943040; // 40 MB

type UploadResult = { info?: { public_id?: string } | string };

/** Recipe photo: add, replace or remove (uploads go to Cloudinary). */
export default function RecipePhotoField({
  imageId,
  onChange,
}: {
  imageId: string;
  onChange: (imageId: string) => void;
}) {
  return (
    <div>
      <span className="field-label">Photo</span>
      <CldUploadWidget
        uploadPreset="recipe"
        options={{
          maxImageFileSize: MAX_FILE_SIZE,
          maxFiles: 1,
          sources: ["local", "camera", "dropbox", "google_drive", "instagram", "unsplash"],
          autoMinimize: true,
          cropping: true,
          croppingAspectRatio: 4 / 3,
          showSkipCropButton: true,
        }}
        onSuccess={(result: UploadResult) => {
          const info = result?.info;
          if (info && typeof info === "object" && info.public_id) onChange(info.public_id);
        }}
      >
        {({ open }) =>
          imageId ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <CldImage
                alt="Recipe photo"
                src={imageId}
                width="480"
                height="360"
                crop="fill"
                className="aspect-[4/3] w-full rounded-md border border-line object-cover sm:w-64"
              />
              <div className="flex gap-2 sm:flex-col">
                <button
                  type="button"
                  className="btn-outline flex-1 sm:flex-none"
                  onClick={(e) => {
                    e.preventDefault();
                    open();
                  }}
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Replace photo
                </button>
                <button
                  type="button"
                  className="btn-ghost flex-1 hover:!bg-red-50 hover:!text-red-700 sm:flex-none"
                  onClick={() => onChange("")}
                >
                  <TrashIcon className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                open();
              }}
              className="flex w-full items-center gap-3 rounded-md border-2 border-dashed border-line bg-cream px-4 py-4 text-left text-ink-soft transition-colors hover:border-brand hover:text-brand"
            >
              <PhotoIcon className="h-8 w-8 shrink-0" />
              <span className="text-sm">
                <span className="block font-semibold">Add a photo</span>
                Optional · max 40 MB
              </span>
            </button>
          )
        }
      </CldUploadWidget>
    </div>
  );
}
