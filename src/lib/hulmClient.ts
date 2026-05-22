import type { CompanyInfo, CompanyProduct } from "@/lib/company";
import { getCompanyInfo, getCompanyProducts } from "@/lib/company";
import {
  fetchUserMe,
  HulmApiError,
  loginUser,
  parseLoginResult,
  type UserMeData,
} from "@/lib/user";

export interface LoginBootstrapResult {
  success: boolean;
  message: string;
  username: string;
  accessToken: string;
  refreshToken: string | null;
  user: UserMeData;
  company: CompanyInfo | null;
  products: CompanyProduct[];
}

export async function loginAndBootstrap(
  loginId: string,
  password: string,
): Promise<LoginBootstrapResult> {
  const result = await loginUser({ username: loginId, password });
  const { tokens } = parseLoginResult(result.result);
  const accessToken = tokens?.access_token;

  if (!accessToken) {
    throw new HulmApiError("Login succeeded but no access token was returned.", 401);
  }

  const user = await fetchUserMe(accessToken);

  let company: CompanyInfo | null = null;
  let products: CompanyProduct[] = [];

  try {
    company = await getCompanyInfo(user.username, accessToken);
    if (company.CID) {
      products = await getCompanyProducts(company.CID, accessToken);
    }
  } catch {
    /* client can retry bootstrap */
  }

  return {
    success: true,
    message: result.message,
    username: user.username,
    accessToken,
    refreshToken: tokens?.refresh_token ?? null,
    user,
    company,
    products,
  };
}

export async function loadBootstrapData(
  accessToken: string,
  userName?: string,
): Promise<{
  success: boolean;
  user: UserMeData | null;
  company: CompanyInfo | null;
  products: CompanyProduct[];
  message?: string;
}> {
  let user: UserMeData | null = null;

  try {
    user = await fetchUserMe(accessToken);
  } catch (err) {
    if (!userName) {
      const message = err instanceof Error ? err.message : "Unable to resolve user from token.";
      return { success: false, user: null, company: null, products: [], message };
    }
  }

  const apiUsername = user?.username ?? userName;
  if (!apiUsername) {
    return {
      success: false,
      user: null,
      company: null,
      products: [],
      message: "Username or authorization token is required.",
    };
  }

  let company: CompanyInfo | null = null;
  let products: CompanyProduct[] = [];

  try {
    company = await getCompanyInfo(apiUsername, accessToken);
    if (company.CID) {
      products = await getCompanyProducts(company.CID, accessToken);
    }
  } catch {
    /* partial load */
  }

  return { success: true, user, company, products };
}
