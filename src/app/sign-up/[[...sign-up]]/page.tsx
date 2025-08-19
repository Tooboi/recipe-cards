import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="absolute top-1/2 left-1/2 -trangray-x-1/2 -trangray-y-1/2">
      <SignUp />
    </div>
  );
}