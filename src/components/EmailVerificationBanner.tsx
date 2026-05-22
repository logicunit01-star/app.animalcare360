"use client";

import { useState } from "react";
import { Mail, MailCheck } from "lucide-react";
import type { CompanyInfo } from "@/lib/company";
import { HulmApiError, sendVerificationLink } from "@/lib/user";

interface EmailVerificationBannerProps {
  company: CompanyInfo;
  onVerified?: () => void;
}

export default function EmailVerificationBanner({
  company,
  onVerified,
}: EmailVerificationBannerProps) {
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [verifyError, setVerifyError] = useState("");

  async function handleVerifyEmail() {
    if (!company.UEmail) {
      setVerifyError("No email address found on your account.");
      return;
    }

    setVerifyLoading(true);
    setVerifyMessage("");
    setVerifyError("");

    try {
      const data = await sendVerificationLink(company.UEmail.trim());
      setVerifyMessage(data.message || "Verification link sent successfully");
      onVerified?.();
    } catch (err) {
      setVerifyError(
        err instanceof HulmApiError
          ? err.message
          : "Unable to reach the server. Please try again.",
      );
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h3 className="font-bold text-brand-navy">Verify your email</h3>
          <p className="text-sm text-brand-muted mt-0.5">
            Your account email{" "}
            <span className="font-medium text-brand-navy">{company.UEmail}</span> is not verified yet.
            Click the button to receive a verification link in your inbox.
          </p>
          {verifyMessage && (
            <p className="text-sm text-green-700 mt-2 flex items-center gap-1.5">
              <MailCheck className="w-4 h-4 shrink-0" />
              {verifyMessage}
            </p>
          )}
          {verifyError && <p className="text-sm text-red-600 mt-2">{verifyError}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={handleVerifyEmail}
        disabled={verifyLoading}
        className="btn-primary shrink-0 !py-3 !px-6 disabled:opacity-60"
      >
        {verifyLoading ? "Sending..." : "Verify Email"}
      </button>
    </div>
  );
}
