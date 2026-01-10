"use client";

// import Image from "next/image";
import { useRouter } from "next/navigation";
import { doCredentialLogin } from "../../app/actions/index.js";
import Link from "next/link";
// import { useState } from "react";

export default function SigninForm() {
  const router = useRouter();

  async function onSubmit(event: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);

      const response = await doCredentialLogin(formData);

      if (!!response.error) {
        console.error(response.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  }

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
            Sign In
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={onSubmit}  className="space-y-6">
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
                  placeholder="baker@recipe.com"
                  autoComplete="email"
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
                {/* <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </a>
                </div> */}
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

            {/* <div>
              <button
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
              </button>
            </div> */}

            <button
              type="submit"
              className="flex w-full justify-center rounded-md mx-auto my-8 py-2 border-2 border-slate-700 bg-slate-600 text-lg font-medium text-slate-300 transition-all hover:border-2 hover:border-cyan-600 hover:bg-cyan-950 hover:text-cyan-500 active:border-cyan-800 active:bg-cyan-950 active:text-cyan-600"
            >
              Sign In
            </button>
          </form>

          <p className="mt-10 text-center text-sm/6 text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-slate-200 hover:text-slate-300"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
