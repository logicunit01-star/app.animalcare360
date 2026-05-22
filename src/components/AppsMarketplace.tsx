"use client";

import { useEffect, useState } from "react";
import { Shield, Cloud, Headphones } from "lucide-react";
import AppCard from "@/components/AppCard";
import AppsEmailAlert from "@/components/AppsEmailAlert";
import PageHeader from "@/components/PageHeader";
import { getApps, type AppProduct } from "@/lib/apps";

export default function AppsMarketplace() {
  const [apps, setApps] = useState<AppProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getApps()
      .then((list) => {
        if (!cancelled) setApps(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load applications.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Application Marketplace"
        title="Choose Your Business Module"
        description="Deploy industry-grade ERP modules built for Pakistan's livestock, feed retail, and pharmacy operations. Select an application to proceed to secure checkout."
      />

      <section className="section-container -mt-6 relative z-10">
        <AppsEmailAlert />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Shield, label: "FBR Compliant", sub: "QR invoicing ready" },
            { icon: Cloud, label: "Cloud Hosted", sub: "Multi-branch sync" },
            { icon: Headphones, label: "Local Support", sub: "WhatsApp + phone" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="stat-tile flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="font-bold text-brand-navy text-sm">{label}</p>
                <p className="text-xs text-brand-muted">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">Available Applications</h2>
            <p className="text-sm text-brand-muted mt-1">
              {loading ? "Loading..." : `${apps.length} modules ready to deploy`}
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-6">
            {error}
          </p>
        )}

        {loading ? (
          <div className="industrial-card p-12 text-center text-brand-muted">
            <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading applications...
          </div>
        ) : apps.length === 0 ? (
          <div className="industrial-card p-12 text-center text-brand-muted">
            No applications available at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl">
            {apps.map((app) => (
              <AppCard key={app.AID} app={app} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
