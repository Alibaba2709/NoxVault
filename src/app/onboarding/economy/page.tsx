import { redirect } from "next/navigation";
import { EconomyOnboardingForm } from "@/components/EconomyOnboardingForm";
import { getSessionUserId } from "@/lib/auth";

interface EconomyOnboardingPageProps {
  searchParams: Promise<{
    userId?: string;
  }>;
}

export default async function EconomyOnboardingPage({
  searchParams,
}: EconomyOnboardingPageProps) {
  const { userId } = await searchParams;
  const sessionUserId = await getSessionUserId();
  const resolvedUserId = userId ?? sessionUserId;

  if (!resolvedUserId) {
    redirect("/login");
  }

  return <EconomyOnboardingForm userId={resolvedUserId} />;
}
