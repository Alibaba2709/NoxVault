"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { euroInputToCents } from "@/lib/client-money";
import {
  allBudgetCategories,
  budgetCategoryLabels,
  type BudgetCategory,
} from "@/types/finance";

type FormStatus = "idle" | "saving" | "success" | "error";

interface FixedCostsOnboardingFormProps {
  userId: string;
}

export function FixedCostsOnboardingForm({
  userId,
}: FixedCostsOnboardingFormProps) {
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
        frequency: "monthly",
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
    setMessage("Rata salvata. Puoi aggiungerne un'altra o aprire la dashboard.");
  }

  return (
    <AuthPanel eyebrow="Step 3" title="Aggiungi i costi fissi">
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Rate, affitto e abbonamenti vengono sottratti dallo stipendio per
        ottenere il budget disponibile reale.
      </p>

      <form action={handleSubmit} className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm text-slate-400">
          Nome costo fisso
          <input
            name="name"
            required
            minLength={2}
            placeholder="Rata macchina"
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-slate-400">
            Importo mensile
            <input
              name="amount"
              required
              min="0.01"
              step="0.01"
              type="number"
              placeholder="370.00"
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

        <label className="grid gap-2 text-sm text-slate-400">
          Categoria
          <select
            name="category"
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
          >
            {allBudgetCategories.map((category) => (
              <option key={category} value={category}>
                {budgetCategoryLabels[category]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={status === "saving" || !userId}
          className="mt-2 h-11 rounded-md bg-indigo-400/85 px-4 text-sm font-medium text-slate-950 transition hover:bg-indigo-300 disabled:cursor-wait disabled:bg-slate-700 disabled:text-slate-400"
        >
          {status === "saving" ? "Salvataggio..." : "Aggiungi rata"}
        </button>

        {message ? (
          <p
            className={`text-sm ${
              status === "error" ? "text-rose-300" : "text-emerald-300"
            }`}
          >
            {message}
          </p>
        ) : null}
      </form>

      <Link
        href={`/dashboard?userId=${userId}`}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-700 px-4 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
      >
        Apri dashboard
      </Link>
    </AuthPanel>
  );
}
