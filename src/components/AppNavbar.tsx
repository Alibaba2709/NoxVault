import Link from "next/link";
import { NoxVaultLogo } from "@/components/NoxVaultLogo";
import { PersonalAreaMenu } from "@/components/PersonalAreaMenu";
import { getSessionUserId } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/user";

interface AppNavbarProps {
  metricLabel?: string;
  metricValue?: string;
  userName?: string;
}

async function getNavbarUserName() {
  const userId = await getSessionUserId();

  if (!userId) {
    return "";
  }

  await connectToDatabase();
  const user = await UserModel.findById(userId).select("name").lean();

  return typeof user?.name === "string" ? user.name : "";
}

export async function AppNavbar({
  metricLabel,
  metricValue,
  userName,
}: AppNavbarProps) {
  const resolvedUserName = userName ?? (await getNavbarUserName());

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 px-5 py-3 backdrop-blur sm:px-8 lg:px-12">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            aria-label="Vai alla dashboard"
            className="rounded-md outline-none transition hover:opacity-85 focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <NoxVaultLogo compact />
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {metricLabel && metricValue ? (
            <div className="hidden text-right lg:block">
              <p className="text-xs text-slate-500">{metricLabel}</p>
              <p className="text-sm font-semibold tabular-nums text-sky-300">
                {metricValue}
              </p>
            </div>
          ) : null}
          <PersonalAreaMenu userName={resolvedUserName} />
        </div>
      </nav>
    </header>
  );
}
