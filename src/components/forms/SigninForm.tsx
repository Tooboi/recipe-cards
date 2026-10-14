"use client";

// import Image from "next/image";
import { useRouter } from "next/navigation";
import { doCredentialLogin } from "../../app/actions/index.js";
import Link from "next/link";
import { doSocialLogin } from "../../app/actions/index.js";
// import { revalidatePath } from "next/cache";
// import { useState } from "react";

export default function SigninForm() {
  const router = useRouter();

  async function onSubmit(event: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);

      const response = await doCredentialLogin(formData);

      if (!!response.error) {
        console.error(response.error);
      } else {
        // revalidatePath("/");
        // revalidatePath("/new-recipe");
        // revalidatePath("/profile");
        router.refresh();
        router.replace("/");
      }
    } catch (e) {
      console.error(e);
    }
  }

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
            Sign In
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="field-label validator"
              >
                Email
              </label>
              <div className="validator-hint hidden">
                Enter valid email address
              </div>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="baker@recipe.com"
                  autoComplete="email"
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
                {/* <div className="text-sm">
                  <a href="#" className="font-semibold text-brand hover:text-brand-dark">
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
                  className="field text-base"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-brand my-6 w-full py-3 text-base"
            >
              Sign In
            </button>
          </form>
          <form className="flex flex-col gap-2" action={doSocialLogin}>
            <button
              type="submit"
              name="action"
              value="google"
              className="btn-outline w-full py-2.5"
            >
              Sign in With Google
            </button>
            <button
              type="submit"
              name="action"
              value="github"
              className="btn-outline w-full py-2.5"
            >
              Sign in With GitHub
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-ink-soft">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-brand hover:text-brand-dark"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
