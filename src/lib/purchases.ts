import { getUser } from "./auth";
import { getAppLabel, type AppProduct } from "./apps";
import type { PurchaseAppResponse } from "./company";

export interface PurchasedApp {
  appType: string;
  aid: number;
  label: string;
  purchasedAt: string;
  pids?: number[];
  message?: string;
  createdApps?: string[];
}

function storageKey(username: string) {
  return `ac360_purchases_${username}`;
}

export function addPurchase(app: AppProduct, result?: PurchaseAppResponse) {
  const user = getUser();
  if (!user || typeof window === "undefined") return;

  const key = storageKey(user.username);
  const existing = getPurchases();
  const appType = app.AppType.toUpperCase();

  const entry: PurchasedApp = {
    appType,
    aid: app.AID,
    label: getAppLabel(app),
    purchasedAt: new Date().toISOString(),
    pids: result?.createdPIDs,
    message: result?.message,
    createdApps: result?.createdApps,
  };

  const next = existing.some((p) => p.appType === appType)
    ? existing.map((p) => (p.appType === appType ? { ...p, ...entry } : p))
    : [...existing, entry];

  localStorage.setItem(key, JSON.stringify(next));
}

export function getPurchases(): PurchasedApp[] {
  const user = getUser();
  if (!user || typeof window === "undefined") return [];

  const raw = localStorage.getItem(storageKey(user.username));
  if (!raw) return [];

  try {
    return JSON.parse(raw) as PurchasedApp[];
  } catch {
    return [];
  }
}

export function hasPurchased(appType: string) {
  return getPurchases().some((p) => p.appType === appType.toUpperCase());
}

export function clearPurchases(username: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(username));
}
