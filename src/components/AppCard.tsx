import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  getAppLabel,
  getAppMeta,
  getProductIcon,
  type AppProduct,
} from "@/lib/apps";

export default function AppCard({ app }: { app: AppProduct }) {
  const appType = app.AppType.toUpperCase();
  const href = `/apps/${appType}/checkout`;
  const meta = getAppMeta(appType);

  return (
    <Link href={href} className="industrial-card group flex flex-col h-full overflow-hidden">
      <div className="relative bg-gradient-to-br from-brand-background to-white p-6 border-b border-brand-border">
        <span className="badge-active absolute top-4 right-4">{app.AStatus}</span>
        <div className="h-32 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getProductIcon(app)}
            alt={getAppLabel(app)}
            className="max-h-28 max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h2 className="text-lg font-bold text-brand-navy mb-1">{getAppLabel(app)}</h2>
        <p className="text-xs text-brand-muted leading-relaxed mb-4 line-clamp-2">
          {meta.tagline}
        </p>

        <ul className="space-y-1.5 mb-5 flex-1">
          {meta.features.slice(0, 3).map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-brand-navy font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-4 border-t border-brand-border">
          <div>
            <p className="text-lg font-bold text-brand-navy">{meta.pricing.price}</p>
            <p className="text-[10px] text-brand-muted font-semibold uppercase tracking-wider">
              {meta.pricing.period}
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-bold text-brand-primary group-hover:gap-2 transition-all">
            Subscribe <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
