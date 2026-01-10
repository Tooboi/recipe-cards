"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createUser } from "@/app/actions";
import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { doSocialLogin } from "../../app/actions/index.js";
// import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      //  Create the user
      await createUser({ email, username, password, image: "" });

      //  Sign in automatically
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success("Account created and logged in!");
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {/* <Image
            alt="Your Company"
            src='https://api.dicebear.com/9.x/identicon/svg?size=100&scale=90&seed=123&backgroundType[]&backgroundColor=transparent'
            className="mx-auto h-10 w-full"
            unoptimized
            width={100}
            height={100}
          /> */}
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-white">
            Sign Up
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form
            // action={doSocialLogin}
            onSubmit={handleSignup}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="username"
                className="text-sm/6 font-medium text-slate-100 flex"
              >
                Username
                <div className="tooltip tooltip-right" data-tip="username is public - can be changed later">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    className="size-4 ml-1 stroke-slate-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                    />
                  </svg>
                </div>
              </label>
              <div className="mt-2">
                <input
                  maxLength={64}
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="BestChefEver"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-2 outline-white/10 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-300 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-slate-100"
              >
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="baker@recipe.com"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-2 outline-white/10 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-300 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-slate-100"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="●●●●●●●●●"
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-2 outline-white/10 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-300 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md mx-auto my-8 py-2 border-2 border-slate-700 bg-slate-600 text-lg font-medium text-slate-300 transition-all hover:border-2 hover:border-cyan-600 hover:bg-cyan-950 hover:text-cyan-500 active:border-cyan-800 active:bg-cyan-950 active:text-cyan-600"
              >
                Sign Up
              </button>
              {/* <button
                type="submit"
                name="action"
                value='google'
                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Sign in With Google
              </button>
              <button
                type="submit"
                name="action"
                value='github'
                className="flex w-full justify-center rounded-md bg-green-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Sign in With GitHub
              </button> */}
            </div>
          </form>

          {/* <p className="mt-10 text-center text-sm/6 text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-slate-200 hover:text-slate-300">
              Sign Up
            </Link>
          </p> */}
        </div>
      </div>
    </>
  );
}
