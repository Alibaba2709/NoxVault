import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { isPositiveCents, isRecord } from "@/lib/validation";
import { UserModel } from "@/models/user";
import {
  allBudgetCategories,
  type CategoryBudgets,
  type UpdateProfileInput,
} from "@/types/finance";

export const dynamic = "force-dynamic";

type ValidationResult =
  | { ok: true; data: UpdateProfileInput }
  | { ok: false; message: string };

function validateProfileInput(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, message: "Dati profilo non validi." };
  }

  const { monthlyIncome, budgets } = payload;

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
      monthlyIncome,
      budgets: normalizedBudgets,
    },
  };
}

export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const user = await UserModel.findById(userId).lean();

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        monthlyIncome: user.monthlyIncome,
        budgets: user.budgets,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore caricamento profilo.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const validation = validateProfileInput(payload);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          monthlyIncome: validation.data.monthlyIncome,
          budgets: validation.data.budgets,
        },
      },
      { new: true },
    );

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore salvataggio profilo.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
