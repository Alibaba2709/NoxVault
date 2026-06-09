import { EconomyOnboardingForm } from "@/components/EconomyOnboardingForm";

interface EconomyOnboardingPageProps {
  searchParams: Promise<{
    userId?: string;
  }>;
}

export default async function EconomyOnboardingPage({
  searchParams,
}: EconomyOnboardingPageProps) {
  const { userId = "" } = await searchParams;

  return <EconomyOnboardingForm userId={userId} />;
}
