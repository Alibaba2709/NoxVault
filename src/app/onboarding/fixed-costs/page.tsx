import { FixedCostsOnboardingForm } from "@/components/FixedCostsOnboardingForm";

interface FixedCostsOnboardingPageProps {
  searchParams: Promise<{
    userId?: string;
  }>;
}

export default async function FixedCostsOnboardingPage({
  searchParams,
}: FixedCostsOnboardingPageProps) {
  const { userId = "" } = await searchParams;

  return <FixedCostsOnboardingForm userId={userId} />;
}
