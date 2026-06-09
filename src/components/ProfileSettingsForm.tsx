"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { euroInputToCents } from "@/lib/client-money";
import { formatCurrency } from "@/lib/money";
import {
  allBudgetCategories,
  budgetCategoryLabels,
  type CategoryBudgets,
  type User,
} from "@/types/finance";

interface ProfileSettingsFormProps {
  user: User;
}

type FormStatus = "idle" | "saving" | "success" | "error";

function centsToEuroInput(value: number): string {
  return (value / 100).toFixed(2);
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    setMessage("");

    const budgets = allBudgetCategories.reduce(
      (result, category) => ({
        ...result,
        [category]: euroInputToCents(formData.get(category)),
      }),
      {} as CategoryBudgets,
    );

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        monthlyIncome: euroInputToCents(formData.get("monthlyIncome")),
        budgets,
      }),
    });

    const result = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      setStatus("error");
      setMessage(result?.error ?? "Non sono riuscito a salvare il profilo.");
      return;
    }

    setStatus("success");
    setMessage("Impostazioni aggiornate.");
    router.refresh();
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-lg border border-slate-800/80 bg-slate-900/70 p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
            Impostazioni
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-100">
            Gestisci profilo
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {user.name} · {user.email}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-md border border-slate-700 px-4 text-sm text-slate-300 transition hover:border-slate-500 hover:bg-slate-900"
        >
          Dashboard
        </Link>
      </div>

      <label className="mt-7 grid gap-2 text-sm text-slate-400">
        Stipendio mensile
        <input
          name="monthlyIncome"
          required
          min="0.01"
          step="0.01"
          type="number"
          defaultValue={centsToEuroInput(user.monthlyIncome)}
          className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
        />
      </label>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allBudgetCategories.map((category) => (
          <label key={category} className="grid gap-2 text-sm text-slate-400">
            {budgetCategoryLabels[category]}
            <input
              name={category}
              min="0"
              step="0.01"
              type="number"
              defaultValue={centsToEuroInput(user.budgets[category] ?? 0)}
              className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 rounded-md bg-slate-950/45 p-4 text-sm text-slate-400">
        Budget attuale totale:{" "}
        <span className="text-slate-200">
          {formatCurrency(
            Object.values(user.budgets).reduce((total, value) => total + value, 0),
          )}
        </span>
      </div>

      <button
        type="submit"
        disabled={status === "saving"}
        className="mt-6 h-11 w-full rounded-md bg-indigo-400/85 px-4 text-sm font-medium text-slate-950 transition hover:bg-indigo-300 disabled:cursor-wait disabled:bg-slate-700 disabled:text-slate-400"
      >
        {status === "saving" ? "Salvataggio..." : "Salva impostazioni"}
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
