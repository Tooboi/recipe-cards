"use client";

import { doLogout } from "../../app/actions/index.js";
import { clearOfflineCopies } from "@/lib/app-mode";

export default function Logout({
  className = "w-full text-left",
  label = "Logout",
}: {
  className?: string;
  label?: string;
}) {
  return (
    // Offline copies of recipes are wiped first, so a shared phone doesn't keep them.
    <form action={doLogout} onSubmit={() => void clearOfflineCopies()}>
      <button className={className} type="submit">
        {label}
      </button>
    </form>
  );
}
