import { hulmFetch } from "@/lib/api";

export const API_URL = "https://api.hulmsolutions.com/apps/getAllProducts";
export const ALLOWED = ["CATTLEPRO", "FMCH"];

export const APP_IMAGES: Record<string, string> = {
  CATTLEPRO: "/cattle-pro.png",
  FMCH: "/pos-pharmacy.png",
};

export const APP_LABELS: Record<string, string> = {
  CATTLEPRO: "Cattle Pro",
  FMCH: "POS Pharmacy",
};

export const APP_TAGLINES: Record<string, string> = {
  CATTLEPRO: "Enterprise cattle farm ERP for Pakistan",
  FMCH: "POS & inventory for feed retail and pharmacies",
};

export const APP_FEATURES: Record<string, string[]> = {
  CATTLEPRO: ["Herd & health records", "Milk production", "Breeding logs", "Farm finance"],
  FMCH: ["FBR POS billing", "Expiry tracking", "Multi-branch stock", "Customer CRM"],
};

export const APP_PRICING: Record<string, { price: string; period: string }> = {
  CATTLEPRO: { price: "PKR 12,000", period: "/month" },
  FMCH: { price: "PKR 2,999", period: "/month" },
};

export const HULM_POS_URL =
  process.env.NEXT_PUBLIC_HULM_POS_URL ??
  process.env.NEXT_PUBLIC_HULM_APP_URL ??
  "https://pos.hulmsolutions.com";

export interface AppLaunchParams {
  /** Hulm POS expects the account username in `companyName`. */
  companyName: string;
  instanceId: string;
  appType: string;
}

/** e.g. https://pos.hulmsolutions.com/?companyName=...&instanceId=...&appType=CATTLEPRO */
export function getAppLaunchUrl(params: AppLaunchParams): string | null {
  const companyName = params.companyName.trim();
  const instanceId = params.instanceId.trim();
  const appType = params.appType.trim().toUpperCase();

  if (!companyName || !instanceId || !appType) return null;

  const query = new URLSearchParams({
    companyName,
    instanceId,
    appType,
  });

  return `${HULM_POS_URL}/?${query.toString()}`;
}

export interface AppProduct {
  AID: number;
  AppType: string;
  AName: string;
  AStatus: string;
  ADescription: string;
  AIconUrl: string;
}

export function sanitizeIconUrl(url: string | undefined) {
  if (!url) return "";
  return url
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/%27$/i, "")
    .trim();
}

/** Prefer portal assets for known apps; API icons are often malformed. */
export function getProductIcon(app: AppProduct) {
  const local = getAppImage(app.AppType);
  if (APP_IMAGES[app.AppType.toUpperCase()]) {
    return local;
  }

  const remote = sanitizeIconUrl(app.AIconUrl);
  if (remote.startsWith("http")) return remote;

  return local;
}

export async function getApps(): Promise<AppProduct[]> {
  const res = await hulmFetch(API_URL);
  const data: AppProduct[] = await res.json();
  return data
    .filter((app) => ALLOWED.includes(app.AppType.toUpperCase()))
    .map((app) => ({
      ...app,
      AName: app.AName.trim(),
      AIconUrl: sanitizeIconUrl(app.AIconUrl),
    }));
}

export function getAppImage(appType: string) {
  return APP_IMAGES[appType.toUpperCase()] ?? "/user-icon.png";
}

export function getAppLabel(app: AppProduct) {
  return APP_LABELS[app.AppType.toUpperCase()] ?? app.AName.trim();
}

export function getProductDisplayName(pType: string, pName?: string) {
  const key = pType.toUpperCase();
  return APP_LABELS[key] ?? pName?.trim() ?? pType;
}

export function getAppMeta(appType: string) {
  const key = appType.toUpperCase();
  return {
    tagline: APP_TAGLINES[key] ?? "",
    features: APP_FEATURES[key] ?? [],
    pricing: APP_PRICING[key] ?? { price: "Contact us", period: "" },
  };
}
