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
        className="w-full max-w-md mt-10 bg-slate-300 p-6 border-2 border-slate-700 rounded-lg shadow-md"
      >
        <h1 className="text-xl font-semibold mb-4">Change Password</h1>

        <label htmlFor="currentPassword" className="block text-sm mb-1">Current Password</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 mb-3 border-2 border-slate-600 rounded-md"
          required
        />

        <label htmlFor="newPassword" className="block text-sm mb-1">New Password</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 mb-3 border-2 border-slate-600 rounded-md"
          required
        />

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 border-2 border-slate-600 bg-slate-400 hover:bg-slate-300 rounded-md disabled:opacity-50"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
