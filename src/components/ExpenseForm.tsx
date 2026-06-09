"use client";

import { useState } from "react";
import { euroInputToCents } from "@/lib/client-money";
import {
  budgetCategoryLabels,
  type BudgetCategory,
  type CategoryProgressData,
} from "@/types/finance";

interface ExpenseFormProps {
  userId: string;
  categories: CategoryProgressData[];
}

type FormStatus = "idle" | "saving" | "success" | "error";

export function ExpenseForm({ userId, categories }: ExpenseFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    setMessage("");

    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        category: String(formData.get("category")) as BudgetCategory,
        description: String(formData.get("description") ?? ""),
        amount: euroInputToCents(formData.get("amount")),
        spentAt: new Date().toISOString(),
      }),
    });

    const result = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setStatus("error");
      setMessage(result?.error ?? "Non sono riuscito a salvare la spesa.");
      return;
    }

    setStatus("success");
    setMessage("Spesa salvata. Ricarica la pagina per aggiornare i progressi.");
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-5"
    >
      <h2 className="text-base font-medium text-slate-200">Nuova spesa</h2>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm text-slate-400">
          Descrizione
          <input
            name="description"
            required
            minLength={2}
            placeholder="Es. pranzo fuori"
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-400">
          Importo in euro
          <input
            name="amount"
            required
            min="0.01"
            step="0.01"
            type="number"
            placeholder="24.50"
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
          />
        </label>

        <label className="grid gap-2 text-sm text-slate-400">
          Categoria
          <select
            name="category"
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
          >
            {categories.map((category) => (
              <option key={category.category} value={category.category}>
                {budgetCategoryLabels[category.category]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-5 h-11 w-full rounded-md bg-indigo-400/80 px-4 text-sm font-medium text-slate-950 transition hover:bg-indigo-300 disabled:cursor-wait disabled:bg-slate-700 disabled:text-slate-400"
      >
        {status === "saving" ? "Salvataggio..." : "Registra spesa"}
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
