import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { isRecord } from "@/lib/validation";
import { UserModel } from "@/models/user";
import type { RegisterInput } from "@/types/finance";

export const dynamic = "force-dynamic";

type ValidationResult =
  | { ok: true; data: RegisterInput }
  | { ok: false; message: string };

function validateRegisterInput(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, message: "Dati di registrazione non validi." };
  }

  const { name, email, password } = payload;

  if (typeof name !== "string" || name.trim().length < 2) {
    return { ok: false, message: "Inserisci un nome valido." };
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { ok: false, message: "Inserisci una email valida." };
  }

  if (typeof password !== "string" || password.length < 8) {
    return {
      ok: false,
      message: "La password deve contenere almeno 8 caratteri.",
    };
  }

  return {
    ok: true,
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    },
  };
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validation = validateRegisterInput(payload);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const { name, email, password } = validation.data;

  try {
    await connectToDatabase();

    const existingUser = await UserModel.exists({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Esiste gia un account con questa email." },
        { status: 409 },
      );
    }

    const user = await UserModel.create({
      name,
      email,
      password: await hashPassword(password),
    });

    return NextResponse.json(
      {
        userId: user._id.toString(),
        nextStep: `/onboarding/economy?userId=${user._id.toString()}`,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Errore durante la registrazione.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
