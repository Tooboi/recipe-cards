"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createUser } from "@/app/actions";
import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
import { doSocialLogin } from "../../app/actions/index.js";
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
      router.refresh();
      router.push("/");
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
      <div className="mx-auto my-8 flex w-[calc(100%-2rem)] max-w-md flex-col justify-center rounded-lg border border-line bg-paper px-6 py-10 shadow-sm sm:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {/* <Image
            alt="Your Company"
            src='https://api.dicebear.com/9.x/identicon/svg?size=100&scale=90&seed=123&backgroundType[]&backgroundColor=transparent'
            className="mx-auto h-10 w-full"
            unoptimized
            width={100}
            height={100}
          /> */}
          <h2 className="mt-6 text-center font-serif text-3xl font-bold text-ink">
            Sign Up
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="field-label flex validator"
              >
                Username
                <div
                  className="tooltip tooltip-right"
                  data-tip="username is public - can be changed later"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    className="size-4 ml-1 stroke-ink-soft"
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
                  pattern="[A-Za-z][A-Za-z0-9\-]*"
                  title="Only letters, numbers or dash"
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="BestChefEver"
                  className="field text-base"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="field-label validator"
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
                  className="field text-base"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="field-label"
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
                  className="field text-base"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-brand my-6 w-full py-3 text-base"
              >
                Sign Up
              </button>
            </div>
          </form>
          <form className="flex flex-col gap-2" action={doSocialLogin}>
            <button
              type="submit"
              name="action"
              value="google"
              className="btn-outline w-full py-2.5"
            >
              Sign up With Google
            </button>
            <button
              type="submit"
              name="action"
              value="github"
              className="btn-outline w-full py-2.5"
            >
              Sign up With GitHub
            </button>
          </form>

          {/* <p className="mt-8 text-center text-sm text-ink-soft">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-brand hover:text-brand-dark">
              Sign Up
            </Link>
          </p> */}
        </div>
      </div>
    </>
  );
}
