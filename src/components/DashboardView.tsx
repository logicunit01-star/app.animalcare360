"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  LayoutGrid,
  Plus,
  Calendar,
  Activity,
  Building2,
  Mail,
} from "lucide-react";
import { getUser, isLoggedIn } from "@/lib/auth";
import { getAppImage, getAppLaunchUrl, getAppMeta, getProductDisplayName } from "@/lib/apps";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useCompanyProducts } from "@/hooks/useCompanyProducts";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function DashboardView() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const user = getUser();
  const {
    company,
    loading: companyLoading,
    needsEmailVerification,
    reload: reloadCompany,
  } = useCompanyProfile();
  const {
    products,
    loading: productsLoading,
    error: productsError,
    reload: reloadProducts,
  } = useCompanyProducts(company?.CID ?? user?.cid);

  const trialDays = useMemo(() => {
    const days = products
      .map((p) => daysUntil(p.TValidTill))
      .filter((d): d is number => d !== null);
    if (days.length === 0) return null;
    return Math.min(...days);
  }, [products]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login?redirect=/dashboard");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (ready && user?.cid && !company?.CID) {
      reloadCompany();
    }
  }, [ready, user?.cid, company?.CID, reloadCompany]);

  const loading = !ready || companyLoading || productsLoading;

  if (loading) {
    return (
      <div className="section-container py-24 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-muted font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-hero !py-12">
        <div className="section-container relative z-10 !py-0">
          <p className="text-brand-primary font-bold text-xs tracking-[0.2em] uppercase mb-2">
            Control Center
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome back, {user?.username}
          </h1>
          <p className="text-slate-300 max-w-xl">
            Manage your subscribed applications. Launch any module to open it in the Hulm ERP workspace.
          </p>
        </div>
      </div>

      <section className="section-container -mt-6 relative z-10">
        {needsEmailVerification && company && (
          <EmailVerificationBanner company={company} />
        )}

        {company && (
          <div className="industrial-card p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-brand-navy">{company.CName}</h2>
                <p className="text-sm text-brand-muted mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {company.UEmail}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="rounded-lg bg-brand-background border border-brand-border px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">CID</p>
                <p className="font-bold text-brand-navy">{company.CID}</p>
              </div>
              <div className="rounded-lg bg-brand-background border border-brand-border px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Account</p>
                <p className="font-bold text-brand-navy">{company.accountType}</p>
              </div>
              <div className="rounded-lg bg-brand-background border border-brand-border px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Business</p>
                <p className="font-bold text-brand-navy">{company.CBusinessType}</p>
              </div>
              <div className="rounded-lg bg-brand-background border border-brand-border px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Country</p>
                <p className="font-bold text-brand-navy">{company.CCountry}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="stat-tile flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-navy">{products.length}</p>
              <p className="text-xs text-brand-muted font-semibold uppercase tracking-wider">
                Active subscriptions
              </p>
            </div>
          </div>
          <div className="stat-tile flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Activity className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-navy">Live</p>
              <p className="text-xs text-brand-muted font-semibold uppercase tracking-wider">
                All systems operational
              </p>
            </div>
          </div>
          <div className="stat-tile flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-navy">
                {trialDays !== null ? `${trialDays} days` : "—"}
              </p>
              <p className="text-xs text-brand-muted font-semibold uppercase tracking-wider">
                Valid until renewal
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">Your Applications</h2>
            <p className="text-sm text-brand-muted mt-1">
              Purchased modules from your company account
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                reloadCompany();
                reloadProducts();
              }}
              className="btn-outline !py-2 !px-4 text-sm"
            >
              Refresh
            </button>
            <Link href="/apps" className="btn-outline flex items-center gap-2 w-fit !py-2">
              <Plus className="w-4 h-4" /> Add more apps
            </Link>
          </div>
        </div>

        {productsError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
            {productsError}
          </p>
        )}

        {products.length === 0 ? (
          <div className="industrial-card p-12 text-center">
            <LayoutGrid className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-bold text-brand-navy mb-2">No applications yet</h3>
            <p className="text-brand-muted text-sm mb-6 max-w-md mx-auto">
              Browse the marketplace and subscribe to Cattle Pro or POS Pharmacy to see them here.
            </p>
            <Link href="/apps" className="btn-primary inline-flex items-center gap-2">
              Browse Applications
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {products.map((product) => {
              const appType = product.PType.toUpperCase();
              const label = getProductDisplayName(product.PType, product.PName);
              const meta = getAppMeta(appType);
              const image = getAppImage(appType);
              const accountUsername =
                user?.username ?? company?.UUsername ?? "";
              const launchUrl = getAppLaunchUrl({
                companyName: accountUsername,
                instanceId: product.PInstanceID,
                appType: product.PType,
              });

              return (
                <div key={product.PID} className="industrial-card overflow-hidden flex flex-col">
                  <div className="flex items-center gap-4 p-6 border-b border-brand-border bg-gradient-to-r from-brand-background to-white">
                    <div className="w-16 h-16 rounded-xl bg-white border border-brand-border flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={label} className="max-h-12 max-w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-flex mb-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          product.PStatus === "Active"
                            ? "text-brand-primary bg-green-50 border-green-100"
                            : "text-brand-muted bg-brand-background border-brand-border"
                        }`}
                      >
                        {product.PStatus}
                      </span>
                      <h3 className="text-lg font-bold text-brand-navy truncate">{label}</h3>
                      <p className="text-xs text-brand-muted mt-0.5">
                        {meta.tagline || product.PName}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="grid grid-cols-2 gap-2 text-xs text-brand-muted mb-4">
                      <div className="rounded-lg bg-brand-background px-3 py-2 border border-brand-border">
                        <p className="font-bold uppercase tracking-wider text-[10px]">PID</p>
                        <p className="font-semibold text-brand-navy">{product.PID}</p>
                      </div>
                      <div className="rounded-lg bg-brand-background px-3 py-2 border border-brand-border">
                        <p className="font-bold uppercase tracking-wider text-[10px]">AID</p>
                        <p className="font-semibold text-brand-navy">{product.AID}</p>
                      </div>
                    </div>
                    <p className="text-xs text-brand-muted mb-4">
                      Valid until{" "}
                      <span className="font-semibold text-brand-navy">
                        {formatDate(product.TValidTill)}
                      </span>
                    </p>

                    {meta.features.length > 0 && (
                      <ul className="space-y-2 mb-6 flex-1">
                        {meta.features.slice(0, 2).map((f) => (
                          <li
                            key={f}
                            className="text-xs font-medium text-brand-navy flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {launchUrl ? (
                      <a
                        href={launchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 text-base mt-auto"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Launch Application
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="Instance ID is not available for this app yet."
                        className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 text-base mt-auto opacity-50 cursor-not-allowed"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Launch unavailable
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
