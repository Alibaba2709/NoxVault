import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { isPositiveCents, isRecord } from "@/lib/validation";
import { UserModel } from "@/models/user";
import {
  allBudgetCategories,
  type CategoryBudgets,
  type EconomyOnboardingInput,
} from "@/types/finance";

export const dynamic = "force-dynamic";

type ValidationResult =
  | { ok: true; data: EconomyOnboardingInput }
  | { ok: false; message: string };

function validateEconomyInput(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, message: "Dati economici non validi." };
  }

  const { userId, monthlyIncome, budgets } = payload;

  if (typeof userId !== "string" || !Types.ObjectId.isValid(userId)) {
    return { ok: false, message: "Utente non valido." };
  }

  if (!isPositiveCents(monthlyIncome) || monthlyIncome <= 0) {
    return { ok: false, message: "Lo stipendio deve essere maggiore di zero." };
  }

  if (!isRecord(budgets)) {
    return { ok: false, message: "Budget categorie non validi." };
  }

  const normalizedBudgets = allBudgetCategories.reduce(
    (result, category) => ({
      ...result,
      [category]: isPositiveCents(budgets[category])
        ? budgets[category]
        : 0,
    }),
    {} as CategoryBudgets,
  );

  return {
    ok: true,
    data: {
      userId,
      monthlyIncome,
      budgets: normalizedBudgets,
    },
  };
}

export async function POST(request: Request) {
  const sessionUserId = await getSessionUserId();
  const payload = await request.json().catch(() => null);
  const validation = validateEconomyInput(payload);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const { userId, monthlyIncome, budgets } = validation.data;

  if (!sessionUserId || sessionUserId !== userId) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          monthlyIncome,
          budgets,
        },
      },
      { new: true },
    );

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      userId: user._id.toString(),
      nextStep: `/onboarding/fixed-costs?userId=${user._id.toString()}`,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Errore durante il salvataggio dell'onboarding.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
