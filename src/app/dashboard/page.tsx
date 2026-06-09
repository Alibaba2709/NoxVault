import Link from "next/link";
import { CategoryProgress } from "@/components/CategoryProgress";
import { DashboardGate } from "@/components/DashboardGate";
import { ExpenseForm } from "@/components/ExpenseForm";
import { NoxVaultLogo } from "@/components/NoxVaultLogo";
import { getDashboardData } from "@/lib/dashboard";
import { formatCurrency } from "@/lib/money";
import { budgetCategoryLabels } from "@/types/finance";

interface DashboardPageProps {
  searchParams: Promise<{
    userId?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await searchParams;

  if (!userId) {
    return <DashboardGate />;
  }

  let dashboard = null;
  let loadingError = "";

  try {
    dashboard = await getDashboardData(userId);
  } catch (error) {
    loadingError =
      error instanceof Error
        ? error.message
        : "Non riesco a caricare la dashboard.";
  }

  if (loadingError) {
    return <EmptyState message={loadingError} />;
  }

  if (!dashboard) {
    return <EmptyState message="Non trovo i dati per questo utente." />;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(49,46,129,0.22),transparent_32rem),linear-gradient(180deg,#020617,#0f172a_52%,#111827)] px-5 py-8 text-slate-300 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <NoxVaultLogo compact />
            <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-normal text-slate-100 sm:text-5xl">
              Ciao {dashboard.user.name}, ecco il tuo mese.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Il budget disponibile reale nasce dallo stipendio meno costi
              fissi. Le barre mostrano quanto stai usando rispetto ai budget
              impostati nell&apos;onboarding.
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-700 px-4 text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Nuovo profilo
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <SummaryTile
            label="Stipendio"
            tone="text-emerald-300"
            value={formatCurrency(dashboard.user.monthlyIncome)}
          />
          <SummaryTile
            label="Costi fissi"
            tone="text-rose-300"
            value={formatCurrency(dashboard.monthlyRecurringTotal)}
          />
          <SummaryTile
            label="Disponibile reale"
            tone="text-sky-300"
            value={formatCurrency(dashboard.realAvailableBudget)}
          />
          <SummaryTile
            label="Dopo spese variabili"
            tone="text-indigo-300"
            value={formatCurrency(dashboard.remainingAvailableBudget)}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-slate-200">
                  Budget categorie
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Arancione e rosso indicano categorie vicine al limite.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {dashboard.categories.map((category) => (
                <CategoryProgress key={category.category} category={category} />
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <ExpenseForm
              userId={dashboard.user.id}
              categories={dashboard.categories}
            />

            <section className="rounded-lg border border-slate-800/80 bg-slate-900/55 p-5">
              <h2 className="text-base font-medium text-slate-200">
                Costi fissi
              </h2>
              <div className="mt-4 space-y-3">
                {dashboard.recurringExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-slate-950/45 px-3 py-3"
                  >
                    <div>
                      <p className="text-sm text-slate-300">{expense.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {budgetCategoryLabels[expense.category]} · giorno{" "}
                        {expense.dueDate}
                      </p>
                    </div>
                    <span className="text-sm tabular-nums text-rose-300">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-800/80 bg-slate-900/55 p-5">
              <h2 className="text-base font-medium text-slate-200">
                Ultime spese
              </h2>
              <div className="mt-4 space-y-3">
                {dashboard.recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-slate-950/45 px-3 py-3"
                  >
                    <div>
                      <p className="text-sm text-slate-300">
                        {expense.description}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {budgetCategoryLabels[expense.category]}
                      </p>
                    </div>
                    <span className="text-sm tabular-nums text-rose-300">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

interface SummaryTileProps {
  label: string;
  value: string;
  tone: string;
}

function SummaryTile({ label, value, tone }: SummaryTileProps) {
  return (
    <article className="rounded-lg border border-slate-800/80 bg-slate-900/55 p-5 shadow-sm shadow-slate-950/20">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold tabular-nums ${tone}`}>
        {value}
      </p>
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-300">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col justify-center">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <NoxVaultLogo compact />
          <h1 className="mt-3 text-2xl font-semibold text-slate-100">
            Dashboard non pronta
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>
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
