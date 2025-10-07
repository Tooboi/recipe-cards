import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col mx-auto w-full items-center mt-8 px-4">
      <SignUp />
    </div>
  );
}