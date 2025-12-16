"use client";

// import { CldImage } from "next-cloudinary";

import { CldImage as CldImageDefault, CldImageProps } from "next-cloudinary";

const CldImage = (props: CldImageProps) => {
  return (
    <>
      <CldImageDefault
        {...props}
      />
    </>
  );
};

export default CldImage;

// export default function CldImageWrapped() {
//   return <CldImage {...props} />
// }
