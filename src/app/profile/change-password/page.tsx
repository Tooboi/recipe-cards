"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updatePassword } from "@/app/actions";

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading…</p>
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
      if (!session?.user?.id) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      await updatePassword({
        id: session.user.id,
        currentPassword,
        newPassword,
      });

      router.push("/profile");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update password";
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
        <h1 className="text-xl font-semibold mb-4">Change Password</h1>

        <label htmlFor="currentPassword" className="block text-sm mb-1">Current Password</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="field mb-3"
          required
        />

        <label htmlFor="newPassword" className="block text-sm mb-1">New Password</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="field mb-3"
          required
        />

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-brand w-full py-2.5"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
