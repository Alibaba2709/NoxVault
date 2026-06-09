import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(49,46,129,0.22),transparent_32rem),linear-gradient(180deg,#020617,#0f172a_52%,#111827)] px-5 py-10 text-slate-300">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Holly Finance
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-normal text-slate-100">
            Finanze personali ordinate, senza rumore visivo.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Registra il tuo profilo, imposta stipendio e budget, aggiungi i
            costi fissi e lascia che la dashboard calcoli il margine reale del
            mese.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-md bg-indigo-400/85 px-5 text-sm font-medium text-slate-950 transition hover:bg-indigo-300"
          >
            Inizia
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center rounded-md border border-slate-700 px-5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Vai alla dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
