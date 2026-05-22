import { hulmFetch } from "@/lib/api";

export const COMPANY_INFO_URL = "https://api.hulmsolutions.com/company/getCompanyInfo";
export const COMPANY_CREATE_URL = "https://api.hulmsolutions.com/company/create";
export const COMPANY_PRODUCTS_URL =
  "https://api.hulmsolutions.com/company/getAllCompanyProducts";

export interface PurchaseAppResponse {
  totalCreated: number;
  createdPIDs: number[];
  totalRequested: number;
  message: string;
  createdApps: string[];
}

export interface CompanyProduct {
  PID: number;
  PType: string;
  PName: string;
  AID: number;
  PIsActive: number;
  PStatus: string;
  PCanRequestRetrail: number;
  PCreationWasFailed: number;
  PInstanceID: string;
  CID: number;
  CName: string;
  TValidTill: string | null;
  SValidTill: string | null;
}

export interface CompanyInfo {
  CID: number;
  CName: string;
  UUsername: string;
  UEmail: string;
  UName: string;
  CBusinessType: string;
  CCountry: string;
  CCreatedOn: string;
  phoneNumber: string;
  accountType: string;
  emailVerified: boolean;
}

export class CompanyError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Handles boolean, "true"/"false", 0/1 from API */
export function parseEmailVerified(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value === null || value === undefined) return false;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
    if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  }
  return false;
}

export function normalizeCompanyResponse(raw: unknown): CompanyInfo | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;

  // Unwrap { result: {...} } or { data: {...} } envelopes
  let source = record;
  if (record.result && typeof record.result === "object") {
    source = record.result as Record<string, unknown>;
  } else if (record.data && typeof record.data === "object") {
    source = record.data as Record<string, unknown>;
  }

  const email =
    (source.UEmail as string) ??
    (source.uEmail as string) ??
    (source.email as string) ??
    "";

  const username =
    (source.UUsername as string) ??
    (source.uUsername as string) ??
    (source.userName as string) ??
    (source.username as string) ??
    "";

  if (!email && !username) return null;

  const verified =
    source.emailVerified ??
    source.EmailVerified ??
    source.isEmailVerified ??
    source.email_verified;

  return {
    CID: Number(source.CID ?? 0),
    CName: String(source.CName ?? source.cName ?? ""),
    UUsername: username,
    UEmail: email,
    UName: String(source.UName ?? source.uName ?? ""),
    CBusinessType: String(source.CBusinessType ?? source.cBusinessType ?? ""),
    CCountry: String(source.CCountry ?? source.cCountry ?? ""),
    CCreatedOn: String(source.CCreatedOn ?? source.cCreatedOn ?? ""),
    phoneNumber: String(source.phoneNumber ?? ""),
    accountType: String(source.accountType ?? ""),
    emailVerified: parseEmailVerified(verified),
  };
}

export async function getCompanyInfo(
  userName: string,
  accessToken?: string,
): Promise<CompanyInfo> {
  const url = `${COMPANY_INFO_URL}?userName=${encodeURIComponent(userName.trim())}`;
  const headers: HeadersInit = { Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await hulmFetch(url, { headers });
  const data = await res.json().catch(() => null);

  const company = normalizeCompanyResponse(data);

  if (!res.ok || !company) {
    throw new CompanyError(
      (data as { message?: string })?.message || "Unable to load company profile.",
      res.status,
    );
  }

  return company;
}

export async function purchaseCompanyApp(
  cid: number,
  aid: number,
  accessToken?: string,
): Promise<PurchaseAppResponse> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await hulmFetch(COMPANY_CREATE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ CID: cid, AID: aid }),
  });

  const data = (await res.json().catch(() => ({}))) as Partial<PurchaseAppResponse> & {
    message?: string;
  };

  if (!res.ok || data.totalCreated === undefined) {
    throw new CompanyError(
      data.message || "Unable to complete app purchase. Please try again.",
      res.status,
    );
  }

  return {
    totalCreated: data.totalCreated ?? 0,
    createdPIDs: data.createdPIDs ?? [],
    totalRequested: data.totalRequested ?? 1,
    message: data.message ?? "App purchased successfully.",
    createdApps: data.createdApps ?? [],
  };
}

function normalizeCompanyProduct(raw: Record<string, unknown>): CompanyProduct | null {
  const pid = Number(raw.PID);
  const pType = String(raw.PType ?? "").trim();
  if (!pid || !pType) return null;

  return {
    PID: pid,
    PType: pType,
    PName: String(raw.PName ?? pType).trim(),
    AID: Number(raw.AID ?? 0),
    PIsActive: Number(raw.PIsActive ?? 0),
    PStatus: String(raw.PStatus ?? "Active"),
    PCanRequestRetrail: Number(raw.PCanRequestRetrail ?? 0),
    PCreationWasFailed: Number(raw.PCreationWasFailed ?? 0),
    PInstanceID: String(raw.PInstanceID ?? ""),
    CID: Number(raw.CID ?? 0),
    CName: String(raw.CName ?? ""),
    TValidTill: raw.TValidTill ? String(raw.TValidTill) : null,
    SValidTill: raw.SValidTill ? String(raw.SValidTill) : null,
  };
}

export function normalizeCompanyProductsList(raw: unknown): CompanyProduct[] {
  let list: unknown[] = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    if (Array.isArray(record.value)) list = record.value;
    else if (Array.isArray(record.result)) list = record.result;
    else if (Array.isArray(record.data)) list = record.data;
  }

  return list
    .map((item) =>
      item && typeof item === "object"
        ? normalizeCompanyProduct(item as Record<string, unknown>)
        : null,
    )
    .filter((p): p is CompanyProduct => p !== null)
    .filter((p) => p.PIsActive === 1 && p.PCreationWasFailed === 0);
}

export async function getCompanyProducts(
  cid: number,
  accessToken?: string,
): Promise<CompanyProduct[]> {
  const url = `${COMPANY_PRODUCTS_URL}?CID=${encodeURIComponent(String(cid))}`;
  const headers: HeadersInit = { Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await hulmFetch(url, { headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new CompanyError(
      (data as { message?: string })?.message || "Unable to load company applications.",
      res.status,
    );
  }

  return normalizeCompanyProductsList(data);
}
