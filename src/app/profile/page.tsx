import { redirect } from "next/navigation";
import { AppNavbar } from "@/components/AppNavbar";
import { ProfileSettingsForm } from "@/components/ProfileSettingsForm";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/user";
import {
  allBudgetCategories,
  type CategoryBudgets,
  type User,
} from "@/types/finance";

function normalizeBudgets(budgets: unknown): CategoryBudgets {
  const source =
    typeof budgets === "object" && budgets !== null
      ? (budgets as Record<string, unknown>)
      : {};

  return allBudgetCategories.reduce(
    (result, category) => ({
      ...result,
      [category]: typeof source[category] === "number" ? source[category] : 0,
    }),
    {} as CategoryBudgets,
  );
}

export default async function ProfilePage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  await connectToDatabase();
  const userDocument = await UserModel.findById(userId).lean();

  if (!userDocument) {
    redirect("/login");
  }

  const user: User = {
    id: userDocument._id.toString(),
    name: userDocument.name,
    email: userDocument.email,
    monthlyIncome: userDocument.monthlyIncome,
    budgets: normalizeBudgets(userDocument.budgets),
    createdAt: userDocument.createdAt.toISOString(),
    updatedAt: userDocument.updatedAt.toISOString(),
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(49,46,129,0.22),transparent_32rem),linear-gradient(180deg,#020617,#0f172a_52%,#111827)] text-slate-300">
      <AppNavbar userName={user.name} />

      <section className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-12">
        <ProfileSettingsForm user={user} />
      </section>
    </main>
  );
}
