import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { formatCurrency } from "@/lib/money";
import { ExpenseModel } from "@/models/expense";
import {
  allBudgetCategories,
  budgetCategoryLabels,
  type BudgetCategory,
  type Expense,
} from "@/types/finance";

interface HistoryPageProps {
  searchParams: Promise<{
    category?: string;
    month?: string;
  }>;
}

function isBudgetCategory(value: string | undefined): value is BudgetCategory {
  return allBudgetCategories.includes(value as BudgetCategory);
}

function getMonthRange(month: string | undefined) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return null;
  }

  const [year, monthIndex] = month.split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);

  return { start, end };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const { category, month } = await searchParams;
  const selectedCategory = isBudgetCategory(category) ? category : "";
  const monthRange = getMonthRange(month);

  await connectToDatabase();

  const query: Record<string, unknown> = { userId };

  if (selectedCategory) {
    query.category = selectedCategory;
  }

  if (monthRange) {
    query.spentAt = {
      $gte: monthRange.start,
      $lt: monthRange.end,
    };
  }

  const expenseDocuments = await ExpenseModel.find(query)
    .sort({ spentAt: -1 })
    .lean();

  const expenses: Expense[] = expenseDocuments.map((expense) => ({
    id: expense._id.toString(),
    userId: expense.userId.toString(),
    category: expense.category as BudgetCategory,
    description: expense.description,
    amount: expense.amount,
    spentAt:
      expense.spentAt instanceof Date
        ? expense.spentAt.toISOString()
        : new Date().toISOString(),
    createdAt:
      expense.createdAt instanceof Date
        ? expense.createdAt.toISOString()
        : new Date().toISOString(),
    updatedAt:
      expense.updatedAt instanceof Date
        ? expense.updatedAt.toISOString()
        : new Date().toISOString(),
  }));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(49,46,129,0.22),transparent_32rem),linear-gradient(180deg,#020617,#0f172a_52%,#111827)] text-slate-300">
      <AppNavbar />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-normal text-slate-100">
              Storico movimenti
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              Consulta tutte le spese registrate e filtra rapidamente per
              categoria o mese.
            </p>
          </div>
          <Link
            href="/dashboard/manage"
            className="inline-flex h-11 items-center justify-center rounded-md bg-sky-400/85 px-4 text-sm font-medium text-slate-950 transition hover:bg-sky-300"
          >
            Nuovo movimento
          </Link>
        </div>

        <form className="grid gap-4 rounded-lg border border-slate-800/80 bg-slate-900/55 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="grid gap-2 text-sm text-slate-400">
            Categoria
            <select
              name="category"
              defaultValue={selectedCategory}
              className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
            >
              <option value="">Tutte</option>
              {allBudgetCategories.map((budgetCategory) => (
                <option key={budgetCategory} value={budgetCategory}>
                  {budgetCategoryLabels[budgetCategory]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-400">
            Mese
            <input
              name="month"
              type="month"
              defaultValue={month ?? ""}
              className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-90 [&::-webkit-calendar-picker-indicator]:invert"
            />
          </label>

          <button
            type="submit"
            className="h-11 rounded-md bg-indigo-400/85 px-5 text-sm font-medium text-slate-950 transition hover:bg-indigo-300"
          >
            Filtra
          </button>
        </form>

        <section className="overflow-hidden rounded-lg border border-slate-800/80 bg-slate-900/55">
          <div className="grid grid-cols-[1fr_auto] border-b border-slate-800 px-5 py-4">
            <h2 className="text-base font-medium text-slate-200">
              Movimenti registrati
            </h2>
            <span className="text-sm text-slate-500">
              {expenses.length} risultati
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-950/45 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Descrizione</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 text-right font-medium">Importo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(expense.spentAt)}
                    </td>
                    <td className="px-5 py-4 text-slate-200">
                      {expense.description}
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {budgetCategoryLabels[expense.category]}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-rose-300">
                      -{formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan={4}>
                      Nessun movimento trovato con questi filtri.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
