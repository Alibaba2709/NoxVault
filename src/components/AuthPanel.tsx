import type { ReactNode } from "react";

interface AuthPanelProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

export function AuthPanel({ eyebrow, title, children }: AuthPanelProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(49,46,129,0.22),transparent_32rem),linear-gradient(180deg,#020617,#0f172a_55%,#111827)] px-5 py-10 text-slate-300">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center">
        <div className="w-full rounded-lg border border-slate-800/80 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30 sm:p-8">
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-100">
            {title}
          </h1>
          {children}
        </div>
      </section>
    </main>
  );
}
