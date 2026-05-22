import type { CompanyInfo } from "@/lib/company";
import { normalizeCompanyProductsList, type CompanyProduct } from "@/lib/company";
import { loadBootstrapData } from "@/lib/hulmClient";
import type { UserMeData } from "@/lib/user";
import {
  AUTH_KEY,
  getUser,
  mergeCompanyIntoSession,
  mergeUserMeIntoSession,
  setUser,
  type UserSession,
} from "@/lib/auth";

export interface LoginBootstrapData {
  username: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  user?: UserMeData | null;
  company?: CompanyInfo | null;
  products?: CompanyProduct[];
}

/** After login: save tokens, /user/me profile, then company from Hulm API. */
export async function applyLoginSession(data: LoginBootstrapData): Promise<UserSession | null> {
  const accessToken = data.accessToken ?? undefined;
  const refreshToken = data.refreshToken ?? undefined;

  setUser({
    username: data.user?.username ?? data.username,
    accessToken,
    refreshToken,
  });

  let session: UserSession | null = getUser();

  if (data.user) {
    session = mergeUserMeIntoSession(data.user, session);
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  }

  const apiUsername = session?.username ?? data.user?.username ?? data.username;

  if (data.company) {
    session = mergeCompanyIntoSession(data.company, session);
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  } else if (apiUsername && accessToken) {
    await syncProfileWithToken(apiUsername, accessToken);
    session = getUser();
  }

  return session;
}

async function syncProfileWithToken(username: string, accessToken: string) {
  const data = await loadBootstrapData(accessToken, username);

  if (data.user) {
    const current = getUser();
    const merged = mergeUserMeIntoSession(data.user, current);
    localStorage.setItem(AUTH_KEY, JSON.stringify(merged));
  }

  if (data.company) {
    const current = getUser();
    const merged = mergeCompanyIntoSession(data.company, current);
    localStorage.setItem(AUTH_KEY, JSON.stringify(merged));
  }
}

/** Dashboard / settings: reload from Hulm /user/me + company + products. */
export async function fetchSessionFromApi(): Promise<{
  session: UserSession | null;
  company: CompanyInfo | null;
  products: CompanyProduct[];
}> {
  const current = getUser();
  if (!current?.accessToken) {
    return { session: current, company: null, products: [] };
  }

  const data = await loadBootstrapData(current.accessToken, current.username);

  if (data.user) {
    const merged = mergeUserMeIntoSession(data.user, current);
    localStorage.setItem(AUTH_KEY, JSON.stringify(merged));
  }

  let session = getUser();
  const company = data.company;
  const products = normalizeCompanyProductsList(data.products);

  if (company && session) {
    session = mergeCompanyIntoSession(company, session);
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  }

  return { session: getUser(), company, products };
}

export async function refreshUserProfile() {
  const { session } = await fetchSessionFromApi();
  return session;
}
