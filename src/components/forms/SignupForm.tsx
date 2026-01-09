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

    // 1️⃣ Create the user
    await createUser({ email, username, password, image: "" });

    // 2️⃣ Sign in automatically
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

  // async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
  //   event.preventDefault();

  //   try {
  //     const formData = new FormData(event.currentTarget);

  //     const username = formData.get("username");
  //     const email = formData.get("email");
  //     const password = formData.get("password");

  //     const response = await fetch("/api/signup", {
  //       method: "POST",
  //       headers: {
  //         "content-type": "application/json",
  //       },
  //       body: JSON.stringify({ username, email, password }),
  //     });

  //     if (response.status === 201) {
  //       router.push("/");
  //     }
  //   } catch (error) {
  //     console.error(error instanceof Error ? error.message : String(error));
  //   }
  // }

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-900">
        <body class="h-full">
        ```
      */}
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
                className="block text-sm/6 font-medium text-gray-100"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="username"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm/6 font-medium text-gray-100"
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
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-100"
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
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
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

          {/* <p className="mt-10 text-center text-sm/6 text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-gray-200 hover:text-gray-300">
              Sign Up
            </Link>
          </p> */}
        </div>
      </div>
    </>
  );
}
