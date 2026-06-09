"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { euroInputToCents } from "@/lib/client-money";
import { allBudgetCategories, budgetCategoryLabels } from "@/types/finance";

type FormStatus = "idle" | "saving" | "error";

interface EconomyOnboardingFormProps {
  userId: string;
}

export function EconomyOnboardingForm({ userId }: EconomyOnboardingFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    setMessage("");

    const response = await fetch("/api/onboarding/economy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        monthlyIncome: euroInputToCents(formData.get("monthlyIncome")),
        budgets: Object.fromEntries(
          allBudgetCategories.map((category) => [
            category,
            euroInputToCents(formData.get(category)),
          ]),
        ),
      }),
    });

    const result = (await response.json().catch(() => null)) as {
      nextStep?: string;
      error?: string;
    } | null;

    if (!response.ok || !result?.nextStep) {
      setStatus("error");
      setMessage(result?.error ?? "Onboarding non riuscito.");
      return;
    }

    router.push(result.nextStep);
  }

  return (
    <AuthPanel eyebrow="Step 2" title="Imposta stipendio e budget">
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Inserisci gli importi in euro. NoxVault li salva in centesimi nel database.
      </p>

      <form action={handleSubmit} className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm text-slate-400">
          Stipendio mensile
          <input
            name="monthlyIncome"
            required
            min="0.01"
            step="0.01"
            type="number"
            placeholder="1500.00"
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          {allBudgetCategories.map((category) => (
            <label key={category} className="grid gap-2 text-sm text-slate-400">
              {budgetCategoryLabels[category]}
              <input
                name={category}
                required
                min="0"
                step="0.01"
                type="number"
                placeholder="250.00"
                className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={status === "saving" || !userId}
          className="mt-2 h-11 rounded-md bg-indigo-400/85 px-4 text-sm font-medium text-slate-950 transition hover:bg-indigo-300 disabled:cursor-wait disabled:bg-slate-700 disabled:text-slate-400"
        >
          {status === "saving" ? "Salvataggio..." : "Continua alle rate"}
        </button>

        {message ? <p className="text-sm text-rose-300">{message}</p> : null}
      </form>
    </AuthPanel>
  );
}
