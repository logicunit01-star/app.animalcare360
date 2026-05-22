"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  User,
  BadgeCheck,
  Briefcase,
} from "lucide-react";
import { getUser, isLoggedIn, type UserSession } from "@/lib/auth";
import { fetchSessionFromApi } from "@/lib/syncProfile";
import { parseEmailVerified } from "@/lib/company";

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-background border border-brand-border">
      <div className="w-10 h-10 rounded-lg bg-white border border-brand-border flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">{label}</p>
        <p className="text-sm font-semibold text-brand-navy mt-0.5 break-words">
          {value?.trim() || "—"}
        </p>
      </div>
    </div>
  );
}

export default function SettingsView() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login?redirect=/settings");
      return;
    }

    async function load() {
      const { session } = await fetchSessionFromApi();
      setUser(session ?? getUser());
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="section-container py-24 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-muted font-medium">Loading account settings...</p>
      </div>
    );
  }

  if (!user) return null;

  const emailVerified = parseEmailVerified(user.emailVerified);

  return (
    <>
      <div className="page-hero !py-12">
        <div className="section-container relative z-10 !py-0">
          <p className="text-brand-primary font-bold text-xs tracking-[0.2em] uppercase mb-2">
            Account
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Settings</h1>
          <p className="text-slate-300 max-w-xl">
            Your registration and company profile details.
          </p>
        </div>
      </div>

      <section className="section-container -mt-6 relative z-10 max-w-3xl">
        <div className="industrial-card p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-brand-border">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Profile overview</h2>
              <p className="text-sm text-brand-muted mt-1">
                Signed in as <span className="font-semibold text-brand-navy">{user.username}</span>
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                emailVerified
                  ? "text-brand-primary bg-green-50 border-green-100"
                  : "text-amber-700 bg-amber-50 border-amber-100"
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              {emailVerified ? "Email verified" : "Email not verified"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="First name" value={user.firstName} icon={User} />
            <Field label="Last name" value={user.lastName} icon={User} />
            <Field label="Username" value={user.username} icon={User} />
            <Field label="Email" value={user.email} icon={Mail} />
            <Field label="Company / Store" value={user.companyName} icon={Building2} />
            <Field label="Phone" value={user.phoneNumber} icon={Phone} />
            <Field label="Country" value={user.country} icon={Globe} />
            <Field label="Business type" value={user.businessType} icon={Briefcase} />
            <Field label="Account type" value={user.accountType} icon={Briefcase} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="btn-outline">
            Back to dashboard
          </Link>
          {!emailVerified && (
            <Link href="/dashboard" className="btn-primary">
              Verify email on dashboard
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
