"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthPanel } from "@/components/AuthPanel";

type FormStatus = "idle" | "saving" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("saving");
    setMessage("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });

    const result = (await response.json().catch(() => null)) as {
      nextStep?: string;
      error?: string;
    } | null;

    if (!response.ok || !result?.nextStep) {
      setStatus("error");
      setMessage(result?.error ?? "Login non riuscito.");
      return;
    }

    router.replace(result.nextStep);
    router.refresh();
  }

  return (
    <AuthPanel eyebrow="Accesso" title="Accedi a NoxVault">
      <form action={handleSubmit} className="mt-7 grid gap-4">
        <label className="grid gap-2 text-sm text-slate-400">
          Email
          <input
            name="email"
            required
            type="email"
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
          />
        </label>
        <label className="grid gap-2 text-sm text-slate-400">
          Password
          <input
            name="password"
            required
            type="password"
            className="h-11 rounded-md border border-slate-800 bg-slate-950/60 px-3 text-slate-300 outline-none transition focus:border-indigo-400/60"
          />
        </label>

        <button
          type="submit"
          disabled={status === "saving"}
          className="mt-2 h-11 rounded-md bg-indigo-400/85 px-4 text-sm font-medium text-slate-950 transition hover:bg-indigo-300 disabled:cursor-wait disabled:bg-slate-700 disabled:text-slate-400"
        >
          {status === "saving" ? "Accesso..." : "Accedi"}
        </button>

        {message ? <p className="text-sm text-rose-300">{message}</p> : null}
      </form>

      <p className="mt-5 text-sm text-slate-500">
        Non hai un account?{" "}
        <Link href="/register" className="text-sky-300 hover:text-sky-200">
          Registrati
        </Link>
      </p>
    </AuthPanel>
  );
}
