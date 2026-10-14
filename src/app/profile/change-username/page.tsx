"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { updateUsername } from "@/app/actions";
// import { auth } from "@/auth";

export default function ChangeUsernamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-128 justify-center px-4">
        <div className="panel w-full max-w-md mt-10 p-6">
          Loading...
        </div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/signin");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await updateUsername({
        id: session?.user?.id || "",
        username,
      });

      //  FORCE SESSION REFRESH
      await signIn("credentials", { redirect: false });

      //  Refresh server components
      router.refresh();

      router.push("/profile");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update username";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-128 justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="panel w-full max-w-md mt-10 p-6"
      >
        <h1 className="text-xl font-semibold mb-4">Change Username</h1>
        <p className="text-sm mb-3 text-stone-700">
          Signed in as:{" "}
          <span className="font-medium text-stone-900">
            {session.user.name ?? "Not set"}
          </span>
        </p>
        <label className="block text-sm mb-1">New Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="field mb-3"
          placeholder="Enter new username"
          required
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-brand w-full py-2.5"
        >
          {loading ? "Saving…" : "Save Username"}
        </button>
      </form>
    </div>
  );
}
