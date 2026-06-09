import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  isBudgetCategory,
  isPositiveCents,
  isRecord,
  isRecurringFrequency,
} from "@/lib/validation";
import { RecurringExpenseModel } from "@/models/recurring-expense";
import { UserModel } from "@/models/user";
import type { CreateRecurringExpenseInput } from "@/types/finance";

export const dynamic = "force-dynamic";

type ValidationResult =
  | { ok: true; data: CreateRecurringExpenseInput }
  | { ok: false; message: string };

function validateRecurringExpenseInput(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, message: "Dati della rata non validi." };
  }

  const { userId, name, amount, frequency, dueDate, category } = payload;

  if (typeof userId !== "string" || !Types.ObjectId.isValid(userId)) {
    return { ok: false, message: "Utente non valido." };
  }

  if (typeof name !== "string" || name.trim().length < 2) {
    return { ok: false, message: "Nome rata non valido." };
  }

  if (!isPositiveCents(amount) || amount <= 0) {
    return { ok: false, message: "Importo rata non valido." };
  }

  if (!isRecurringFrequency(frequency)) {
    return { ok: false, message: "Frequenza non valida." };
  }

  if (
    typeof dueDate !== "number" ||
    !Number.isInteger(dueDate) ||
    dueDate < 1 ||
    dueDate > 31
  ) {
    return { ok: false, message: "Giorno di scadenza non valido." };
  }

  if (!isBudgetCategory(category)) {
    return { ok: false, message: "Categoria non valida." };
  }

  return {
    ok: true,
    data: {
      userId,
      name: name.trim(),
      amount,
      frequency,
      dueDate,
      category,
    },
  };
}

export async function POST(request: Request) {
  const sessionUserId = await getSessionUserId();
  const payload = await request.json().catch(() => null);
  const validation = validateRecurringExpenseInput(payload);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  if (!sessionUserId || sessionUserId !== validation.data.userId) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const userExists = await UserModel.exists({ _id: validation.data.userId });

    if (!userExists) {
      return NextResponse.json(
        { error: "Utente non trovato." },
        { status: 404 },
      );
    }

    const recurringExpense = await RecurringExpenseModel.create(validation.data);

    return NextResponse.json({ recurringExpense }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore nel salvataggio rata.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const sessionUserId = await getSessionUserId();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId || !Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Utente non valido." }, { status: 400 });
  }

  if (!sessionUserId || sessionUserId !== userId) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const recurringExpenses = await RecurringExpenseModel.find({ userId })
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json({ recurringExpenses });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore nel recupero rate.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
