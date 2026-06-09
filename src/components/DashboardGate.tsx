"use client";

import Link from "next/link";
import { useEffect } from "react";

export function DashboardGate() {
  useEffect(() => {
    const userId = localStorage.getItem("hollyUserId");

    if (userId) {
      window.location.replace(`/dashboard?userId=${userId}`);
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-300">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col justify-center">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Holly Finance
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-100">
            Dashboard non ancora collegata
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Prima crea un profilo e completa l&apos;onboarding: cosi Holly sa
            quali dati caricare.
          </p>
          <Link
            href="/register"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-indigo-400/85 px-4 text-sm font-medium text-slate-950 transition hover:bg-indigo-300"
          >
            Vai alla registrazione
          </Link>
        </div>
      </section>
    </main>
  );
}
