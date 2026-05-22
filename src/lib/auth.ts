import type { CompanyInfo } from "@/lib/company";
import { getCompanyInfo } from "@/lib/company";
import { parseEmailVerified } from "@/lib/company";

export const AUTH_KEY = "ac360_user";
const PROFILE_PREFIX = "ac360_profile_";

export interface UserSession {
  username: string;
  cid?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phoneNumber?: string;
  country?: string;
  businessType?: string;
  accountType?: string;
  emailVerified?: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export interface RegisterProfileInput {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phoneNumber: string;
  country: string;
}

import type { UserMeData } from "@/lib/user";

export function profileFromRegister(input: RegisterProfileInput): UserSession {
  return {
    username: input.userName.trim(),
    email: input.email.trim(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    companyName: input.companyName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    country: input.country.trim(),
    emailVerified: false,
  };
}

function profileStorageKey(username: string) {
  return `${PROFILE_PREFIX}${username.trim().toLowerCase()}`;
}

/** Persist registration fields per username (survives partial session overwrites). */
export function saveProfileSnapshot(session: UserSession) {
  if (typeof window === "undefined" || !session.username) return;
  const snapshot: UserSession = {
    username: session.username,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    companyName: session.companyName,
    phoneNumber: session.phoneNumber,
    country: session.country,
  };
  localStorage.setItem(profileStorageKey(session.username), JSON.stringify(snapshot));
}

export function loadProfileSnapshot(username: string): Partial<UserSession> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(profileStorageKey(username));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<UserSession>;
  } catch {
    return null;
  }
}

/** Merge session with saved registration data — registration fields win when present. */
export function enrichSession(session: UserSession | null): UserSession | null {
  if (!session?.username) return session;
  const saved = loadProfileSnapshot(session.username);

  if (!saved) return session;

  return {
    ...saved,
    ...session,
    username: session.username,
    email: session.email ?? saved.email,
    firstName: session.firstName ?? saved.firstName,
    lastName: session.lastName ?? saved.lastName,
    companyName: session.companyName ?? saved.companyName,
    phoneNumber: session.phoneNumber ?? saved.phoneNumber,
    country: session.country ?? saved.country,
    cid: session.cid ?? saved.cid,
    businessType: session.businessType ?? saved.businessType,
    accountType: session.accountType ?? saved.accountType,
    emailVerified: session.emailVerified ?? saved.emailVerified,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
}

/** Merge /user/me response into session (resolves username when logging in with email). */
export function mergeUserMeIntoSession(
  me: UserMeData,
  existing?: UserSession | null,
): UserSession {
  const base = enrichSession(existing ?? null) ?? existing;

  const merged: UserSession = {
    username: me.username,
    email: me.email || base?.email,
    firstName: me.firstName || base?.firstName,
    lastName: me.lastName || base?.lastName,
    companyName: me.companyName || base?.companyName,
    country: me.country?.trim() || base?.country,
    businessType: me.businessType || base?.businessType,
    cid: base?.cid,
    accountType: base?.accountType,
    emailVerified: base?.emailVerified,
    accessToken: base?.accessToken,
    refreshToken: base?.refreshToken,
  };

  saveProfileSnapshot(merged);
  return merged;
}

export function mergeCompanyIntoSession(
  company: CompanyInfo,
  existing?: UserSession | null,
): UserSession {
  const base = enrichSession(existing ?? null) ?? existing;
  const nameParts = company.UName?.trim().split(/\s+/) ?? [];
  const inferredFirst = nameParts[0] ?? "";
  const inferredLast = nameParts.slice(1).join(" ");

  const merged: UserSession = {
    username: company.UUsername || base?.username || "",
    cid: company.CID || base?.cid,
    email: base?.email ?? company.UEmail,
    firstName: base?.firstName ?? inferredFirst,
    lastName: base?.lastName ?? inferredLast,
    companyName: base?.companyName ?? company.CName,
    phoneNumber: base?.phoneNumber ?? company.phoneNumber?.trim(),
    country: base?.country ?? company.CCountry,
    businessType: company.CBusinessType || base?.businessType,
    accountType: company.accountType || base?.accountType,
    emailVerified: parseEmailVerified(company.emailVerified),
    accessToken: base?.accessToken,
    refreshToken: base?.refreshToken,
  };

  saveProfileSnapshot(merged);
  return merged;
}

export function setUser(session: string | UserSession) {
  if (typeof window === "undefined") return;

  if (typeof session === "string") {
    const saved = loadProfileSnapshot(session);
    const data: UserSession = enrichSession({
      ...saved,
      username: session,
    } as UserSession) ?? { username: session };
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    return;
  }

  const enriched = enrichSession(session) ?? session;
  saveProfileSnapshot(enriched);
  localStorage.setItem(AUTH_KEY, JSON.stringify(enriched));
}

export function updateUser(patch: Partial<UserSession>) {
  const current = getUser();
  if (!current) return;
  setUser({ ...current, ...patch });
}

export function getUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserSession;
    return enrichSession(parsed);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return getUser() !== null;
}

export function getDisplayName(session: UserSession | null) {
  if (!session) return "";
  if (session.firstName || session.lastName) {
    return [session.firstName, session.lastName].filter(Boolean).join(" ");
  }
  return session.username;
}

export async function syncProfileFromCompany(username: string, accessToken?: string) {
  try {
    const company = await getCompanyInfo(username, accessToken);
    const current = getUser();
    const merged = mergeCompanyIntoSession(company, current);
    localStorage.setItem(AUTH_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return enrichSession(getUser());
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  const user = getUser();
  if (user) localStorage.removeItem(`ac360_purchases_${user.username}`);
  localStorage.removeItem(AUTH_KEY);
}
