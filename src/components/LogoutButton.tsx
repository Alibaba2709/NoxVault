"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex h-11 items-center justify-center rounded-md border border-slate-700 px-4 text-sm text-slate-300 transition hover:border-rose-400/70 hover:bg-rose-950/30 hover:text-rose-200 disabled:cursor-wait disabled:opacity-60"
    >
      {isLoggingOut ? "Uscita..." : "Logout"}
    </button>
  );
}
