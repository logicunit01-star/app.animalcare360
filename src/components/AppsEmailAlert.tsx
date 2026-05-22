"use client";

import { isLoggedIn } from "@/lib/auth";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

export default function AppsEmailAlert() {
  const loggedIn = isLoggedIn();
  const { company, loading, needsEmailVerification } = useCompanyProfile();

  if (!loggedIn || loading || !needsEmailVerification || !company) return null;

  return <EmailVerificationBanner company={company} />;
}
