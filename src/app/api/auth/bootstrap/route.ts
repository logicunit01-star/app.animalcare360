import { NextResponse } from "next/server";
import { CompanyError, getCompanyInfo, getCompanyProducts } from "@/lib/company";
import { fetchUserMe, HulmApiError } from "@/lib/user";

/** Reload /user/me + company profile + purchased apps for an authenticated user. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userName = searchParams.get("userName")?.trim() ?? "";

    const authHeader = request.headers.get("authorization") ?? undefined;
    const accessToken = authHeader?.replace(/^Bearer\s+/i, "").trim();

    let user = null;
    if (accessToken) {
      try {
        user = await fetchUserMe(accessToken);
        if (!userName) userName = user.username;
      } catch {
        if (!userName) {
          return NextResponse.json(
            { success: false, message: "Unable to resolve user from token." },
            { status: 401 },
          );
        }
      }
    }

    if (!userName) {
      return NextResponse.json(
        { success: false, message: "Username or authorization token is required." },
        { status: 400 },
      );
    }

    const company = await getCompanyInfo(userName, accessToken);

    let products: Awaited<ReturnType<typeof getCompanyProducts>> = [];
    if (company.CID) {
      products = await getCompanyProducts(company.CID, accessToken);
    }

    return NextResponse.json({ success: true, user, company, products });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load session data.";
    const status =
      err instanceof CompanyError || err instanceof HulmApiError ? err.status : 500;
    return NextResponse.json(
      { success: false, message, company: null, products: [] },
      { status },
    );
  }
}
