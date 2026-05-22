import { NextResponse } from "next/server";
import { getCompanyInfo, getCompanyProducts } from "@/lib/company";
import { fetchUserMe, HulmApiError, loginUser, parseLoginResult } from "@/lib/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loginId = String(body.username ?? body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!loginId || !password) {
      return NextResponse.json(
        {
          status: 400,
          success: false,
          message: "Please enter username or email and password.",
          result: null,
          error: "Missing credentials",
        },
        { status: 400 },
      );
    }

    const result = await loginUser({ username: loginId, password });
    const { tokens } = parseLoginResult(result.result);
    const accessToken = tokens?.access_token;

    if (!accessToken) {
      return NextResponse.json(
        {
          status: 401,
          success: false,
          message: "Login succeeded but no access token was returned.",
          result: null,
          error: "Missing access token",
        },
        { status: 401 },
      );
    }

    const user = await fetchUserMe(accessToken);

    let company = null;
    let products: Awaited<ReturnType<typeof getCompanyProducts>> = [];

    try {
      company = await getCompanyInfo(user.username, accessToken);
      if (company.CID) {
        products = await getCompanyProducts(company.CID, accessToken);
      }
    } catch {
      /* client can retry bootstrap */
    }

    return NextResponse.json(
      {
        ...result,
        username: user.username,
        accessToken,
        refreshToken: tokens?.refresh_token ?? null,
        user,
        company,
        products,
      },
      { status: result.status },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed. Please try again.";
    const status = err instanceof HulmApiError ? err.status : 400;
    return NextResponse.json(
      { status, success: false, message, result: null, error: message },
      { status },
    );
  }
}
