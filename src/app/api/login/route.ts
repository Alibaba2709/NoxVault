import { NextResponse } from "next/server";
import { attachSessionCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";
import { isRecord } from "@/lib/validation";
import { UserModel } from "@/models/user";
import type { LoginInput } from "@/types/finance";

export const dynamic = "force-dynamic";

type ValidationResult =
  | { ok: true; data: LoginInput }
  | { ok: false; message: string };

function validateLoginInput(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return { ok: false, message: "Dati di login non validi." };
  }

  const { email, password } = payload;

  if (typeof email !== "string" || email.trim().length === 0) {
    return { ok: false, message: "Inserisci la tua email." };
  }

  if (typeof password !== "string" || password.length === 0) {
    return { ok: false, message: "Inserisci la tua password." };
  }

  return {
    ok: true,
    data: {
      email: email.trim().toLowerCase(),
      password,
    },
  };
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validation = validateLoginInput(payload);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const { email, password } = validation.data;

  try {
    await connectToDatabase();

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: "Email o password non corretti." },
        { status: 401 },
      );
    }

    return attachSessionCookie(
      NextResponse.json({
        userId: user._id.toString(),
        nextStep: "/dashboard",
      }),
      user._id.toString(),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Errore durante il login.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
