"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { euroInputToCents } from "@/lib/client-money";
import {
  allBudgetCategories,
  budgetCategoryLabels,
  type BudgetCategory,
} from "@/types/finance";

interface RecurringExpenseFormProps {
  userId: string;
}

type FormStatus = "idle" | "saving" | "success" | "error";

export function RecurringExpenseForm({ userId }: RecurringExpenseFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    setMessage("");

    const response = await fetch("/api/recurring-expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        name: String(formData.get("name") ?? ""),
        amount: euroInputToCents(formData.get("amount")),
        frequency: String(formData.get("frequency") ?? "monthly"),
        dueDate: Number(formData.get("dueDate")),
        category: String(formData.get("category")) as BudgetCategory,
      }),
    });

    const result = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setStatus("error");
      setMessage(result?.error ?? "Non sono riuscito a salvare la rata.");
      return;
    }

    setStatus("success");
    setMessage("Costo fisso salvato.");
    router.refresh();
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-5"
    >
      <h2 className="text-base font-medium text-slate-200">Nuovo costo fisso</h2>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm text-slate-400">
          Nome
          <input
            name="name"
            required
            minLength={2}
            placeholder="Es. Netflix, affitto, rata auto"
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
          />
        </label>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-slate-400">
            Importo mensile
            <input
              name="amount"
              required
              min="0.01"
              step="0.01"
              type="number"
              placeholder="12.99"
              className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-400">
            Giorno del mese
            <input
              name="dueDate"
              required
              min="1"
              max="31"
              type="number"
              placeholder="28"
              className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
            />
          </label>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-slate-400">
            Frequenza
            <select
              name="frequency"
              className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
            >
              <option value="monthly">Mensile</option>
              <option value="annual">Annuale</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-400">
            Categoria
            <select
              name="category"
              defaultValue="subscriptions"
              className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
            >
              {allBudgetCategories.map((category) => (
                <option key={category} value={category}>
                  {budgetCategoryLabels[category]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-5 h-11 w-full rounded-md bg-sky-400/85 px-4 text-sm font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-wait disabled:bg-slate-700 disabled:text-slate-400"
      >
        {status === "saving" ? "Salvataggio..." : "Aggiungi costo fisso"}
      </button>

      {message ? (
        <p
          className={`mt-3 text-sm ${
            status === "error" ? "text-rose-300" : "text-emerald-300"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
