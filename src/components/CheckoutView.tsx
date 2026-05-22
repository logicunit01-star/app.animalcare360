"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { getUser, isLoggedIn } from "@/lib/auth";
import {
  CompanyError,
  getCompanyInfo,
  purchaseCompanyApp,
  type CompanyInfo,
} from "@/lib/company";
import { addPurchase, hasPurchased } from "@/lib/purchases";
import {
  getAppLabel,
  getAppMeta,
  getProductIcon,
  type AppProduct,
} from "@/lib/apps";

export default function CheckoutView({ app }: { app: AppProduct }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");
  const user = getUser();
  const label = getAppLabel(app);
  const image = getProductIcon(app);
  const meta = getAppMeta(app.AppType);
  const alreadyOwned = hasPurchased(app.AppType);

  useEffect(() => {
    if (!isLoggedIn()) {
      const redirect = `/apps/${app.AppType.toUpperCase()}/checkout`;
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    async function loadCompany() {
      const session = getUser();
      if (!session?.username) return;

      try {
        const profile = await getCompanyInfo(session.username, session.accessToken);
        setCompany(profile);
      } catch {
        setPurchaseError("Unable to load company profile. Please refresh and try again.");
      } finally {
        setCompanyLoading(false);
        setReady(true);
      }
    }

    loadCompany();
  }, [app.AppType, router]);

  async function handlePurchase() {
    if (alreadyOwned) {
      router.push("/dashboard");
      return;
    }

    if (!company?.CID) {
      setPurchaseError("Company profile not loaded. Please refresh the page.");
      return;
    }

    setPurchasing(true);
    setPurchaseError("");
    setPurchaseSuccess("");

    try {
      const session = getUser();
      const data = await purchaseCompanyApp(
        company.CID,
        app.AID,
        session?.accessToken,
      );

      addPurchase(app, data);
      setPurchaseSuccess(data.message || "App purchased successfully.");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setPurchaseError(
        err instanceof CompanyError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to reach the server. Please try again.",
      );
      setPurchasing(false);
    }
  }

  if (!ready || companyLoading) {
    return (
      <div className="section-container py-24 flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-brand-muted font-medium">Preparing secure checkout...</p>
      </div>
    );
  }

  return (
    <>
      {purchasing && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-brand-border shadow-panel p-8 sm:p-10 max-w-md w-full text-center">
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brand-navy mb-2">Processing purchase</h3>
            <p className="text-sm text-brand-muted">
              Activating <span className="font-semibold text-brand-navy">{label}</span> for{" "}
              <span className="font-semibold text-brand-navy">{company?.CName ?? user?.username}</span>
              …
            </p>
            <p className="text-xs text-brand-muted mt-3">Please do not close this window.</p>
          </div>
        </div>
      )}

      <div className="page-hero !py-10">
        <div className="section-container relative z-10 !py-0">
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </Link>
          <p className="text-brand-primary font-bold text-xs tracking-[0.2em] uppercase mb-2">
            Secure Checkout
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold">{label}</h1>
        </div>
      </div>

      <section className="section-container -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-3 space-y-6">
            <div className="industrial-card p-6 sm:p-8">
              <div className="flex items-start gap-5 pb-6 border-b border-brand-border">
                <div className="w-24 h-24 rounded-2xl bg-brand-background border border-brand-border flex items-center justify-center shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={label} className="max-h-20 max-w-full object-contain" />
                </div>
                <div>
                  <span className="badge-active mb-2">{app.AStatus}</span>
                  <h2 className="text-2xl font-bold text-brand-navy">{label}</h2>
                  <p className="text-sm text-brand-muted mt-1">{meta.tagline}</p>
                  <p className="text-xs text-brand-muted mt-2 line-clamp-2">{app.ADescription}</p>
                </div>
              </div>

              <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-4">
                Included capabilities
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {meta.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm font-medium text-brand-navy bg-brand-background rounded-xl px-4 py-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 text-sm text-brand-muted px-1">
              <Lock className="w-4 h-4 text-brand-primary" />
              <span>256-bit encrypted checkout · Your data stays in Pakistan cloud regions</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="panel-dark sticky top-24 space-y-6 relative">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                  Subscription
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{meta.pricing.price}</span>
                  <span className="text-slate-400 text-sm">{meta.pricing.period}</span>
                </div>
              </div>

              <div className="space-y-3 py-4 border-y border-white/10 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>14-day free trial</span>
                  <span className="text-brand-primary font-bold">Included</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Setup fee</span>
                  <span className="font-bold text-white">PKR 0</span>
                </div>
                <div className="flex justify-between font-bold text-white text-base pt-1">
                  <span>Due today</span>
                  <span>PKR 0</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Account
                  </p>
                  <p className="font-semibold">{user?.username}</p>
                </div>
                {company && (
                  <>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Company
                      </p>
                      <p className="font-semibold text-sm">{company.CName}</p>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Company ID (CID)</span>
                      <span className="font-mono text-white">{company.CID}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Application ID (AID)</span>
                      <span className="font-mono text-white">{app.AID}</span>
                    </div>
                  </>
                )}
              </div>

              {purchaseError && (
                <p className="text-sm text-red-300 bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-3">
                  {purchaseError}
                </p>
              )}
              {purchaseSuccess && (
                <p className="text-sm text-green-200 bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {purchaseSuccess}
                </p>
              )}

              <button
                type="button"
                disabled={purchasing || !company?.CID}
                onClick={handlePurchase}
                className="btn-primary w-full !py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {alreadyOwned ? "Go to Dashboard" : "Complete Purchase"}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                No credit card required for trial
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
