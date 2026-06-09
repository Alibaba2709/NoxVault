import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import {
  isBudgetCategory,
  isPositiveCents,
  isRecord,
} from "@/lib/validation";
import { ExpenseModel } from "@/models/expense";
import { UserModel } from "@/models/user";
import type { CreateExpenseInput } from "@/types/finance";

export const dynamic = "force-dynamic";

type ValidationResult =
  | { ok: true; data: CreateExpenseInput }
  | { ok: false; message: string };

function validateCreateExpenseInput(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, message: "Il corpo della richiesta non e valido." };
  }

  const { userId, category, description, amount, spentAt } = payload;

  if (typeof userId !== "string" || !Types.ObjectId.isValid(userId)) {
    return { ok: false, message: "Utente non valido." };
  }

  if (!isBudgetCategory(category)) {
    return { ok: false, message: "Categoria non valida." };
  }

  if (typeof description !== "string" || description.trim().length < 2) {
    return { ok: false, message: "Descrizione troppo corta." };
  }

  if (!isPositiveCents(amount) || amount <= 0) {
    return { ok: false, message: "amount deve essere un intero positivo." };
  }

  if (spentAt !== undefined) {
    if (typeof spentAt !== "string" || Number.isNaN(Date.parse(spentAt))) {
      return { ok: false, message: "spentAt deve essere una data valida." };
    }
  }

  return {
    ok: true,
    data: {
      userId,
      category,
      description: description.trim(),
      amount,
      spentAt,
    },
  };
}

export async function POST(request: Request) {
  const sessionUserId = await getSessionUserId();
  const payload = await request.json().catch(() => null);
  const validation = validateCreateExpenseInput(payload);

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

    const expense = await ExpenseModel.create({
      ...validation.data,
      spentAt: validation.data.spentAt
        ? new Date(validation.data.spentAt)
        : new Date(),
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Errore imprevisto durante il salvataggio della spesa.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
