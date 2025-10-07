import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col mx-auto w-full items-center mt-8 px-4">
      <SignIn />
      <div className="text-sm mt-2 flex">
        <p>Forgot Password?</p>
        <Link href="/forgot-password" className="text-blue-600 ml-2">
          Reset here
        </Link>
      </div>
    </div>
  );
}