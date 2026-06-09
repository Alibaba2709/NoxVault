import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { ExpenseForm } from "@/components/ExpenseForm";
import { RecurringExpenseForm } from "@/components/RecurringExpenseForm";
import { getSessionUserId } from "@/lib/auth";

export default async function ManageMovementsPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(49,46,129,0.22),transparent_32rem),linear-gradient(180deg,#020617,#0f172a_52%,#111827)] text-slate-300">
      <AppNavbar />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12">
        <div>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-100">
            Gestione spese
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
            Inserisci movimenti variabili e costi fissi in uno spazio dedicato,
            senza appesantire la panoramica principale.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ExpenseForm userId={userId} />
          <RecurringExpenseForm userId={userId} />
        </div>
      </section>
    </main>
  );
}
