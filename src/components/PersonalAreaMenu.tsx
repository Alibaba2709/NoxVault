"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PersonalAreaMenuProps {
  userName?: string;
}

export function PersonalAreaMenu({ userName = "" }: PersonalAreaMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userInitial = userName.trim().charAt(0).toUpperCase() || "?";

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-950/40 px-3 text-sm text-slate-300 transition hover:border-sky-400/70 hover:bg-slate-900 hover:text-sky-200"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-400/15 text-sky-300">
          {userInitial}
        </span>
        Area Personale
        <span className="text-slate-500">v</span>
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-md border border-slate-800 bg-slate-950 shadow-xl shadow-slate-950/40"
          role="menu"
        >
          <Link
            href="/profile"
            className="block px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-sky-200"
            role="menuitem"
          >
            Impostazioni Profilo
          </Link>
          <Link
            href="/dashboard/manage"
            className="block px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-sky-200"
            role="menuitem"
          >
            Gestione Spese
          </Link>
          <Link
            href="/dashboard/history"
            className="block px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-sky-200"
            role="menuitem"
          >
            Storico Movimenti
          </Link>
          <div className="my-1 h-px bg-slate-800" />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="block w-full px-4 py-3 text-left text-sm text-rose-300 transition hover:bg-rose-950/30 disabled:cursor-wait disabled:opacity-60"
            role="menuitem"
          >
            {isLoggingOut ? "Uscita..." : "Logout"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
