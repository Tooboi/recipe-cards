import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="absolute top-1/2 left-1/2 -trangray-x-1/2 -trangray-y-1/2">
      <SignIn />
      <div className="text-sm mt-2 flex">
        <p>Forgot Password?</p>
        <Link href="/forgot-password" className="text-blue-400 ml-2">
          Reset here
        </Link>
      </div>
    </div>
  );
}