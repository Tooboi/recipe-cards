"use server";

import { signIn, signOut } from "@/auth";

export async function doSocialLogin(formData) {
  const action = formData.get("action");
  // The installed app asks to come back to /me; anything else goes to Explore.
  const redirectTo = formData.get("redirectTo") === "/me" ? "/me" : "/explore";

  await signIn(action, { redirectTo });
}

export async function doLogout() {
  await signOut({ redirectTo: "/" });
  router.refresh();
  revalidatePath("/");
  revalidatePath("/new-recipe");
  revalidatePath("/profile");
  router.replace("/");
}

export async function doCredentialLogin(formData) {
  console.log("formData", formData);

  try {
    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    return response;
  } catch (err) {
    throw err;
  }
}
