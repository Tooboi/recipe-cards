import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="absolute top-1/2 left-1/2 -transtone-x-1/2 -transtone-y-1/2">
      <SignUp />
    </div>
  );
}