import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Utente mancante." }, { status: 400 });
  }

  try {
    const dashboard = await getDashboardData(userId);

    if (!dashboard) {
      return NextResponse.json(
        { error: "Dashboard non trovata." },
        { status: 404 },
      );
    }

    return NextResponse.json({ dashboard });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Errore durante il caricamento dashboard.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
