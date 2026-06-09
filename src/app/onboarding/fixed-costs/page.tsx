import { redirect } from "next/navigation";
import { FixedCostsOnboardingForm } from "@/components/FixedCostsOnboardingForm";
import { getSessionUserId } from "@/lib/auth";

interface FixedCostsOnboardingPageProps {
  searchParams: Promise<{
    userId?: string;
  }>;
}

export default async function FixedCostsOnboardingPage({
  searchParams,
}: FixedCostsOnboardingPageProps) {
  const { userId } = await searchParams;
  const sessionUserId = await getSessionUserId();
  const resolvedUserId = userId ?? sessionUserId;

  if (!resolvedUserId) {
    redirect("/login");
  }

  return <FixedCostsOnboardingForm userId={resolvedUserId} />;
}
