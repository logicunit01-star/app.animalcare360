import { NextResponse } from "next/server";
import { CompanyError, getCompanyInfo, normalizeCompanyResponse } from "@/lib/company";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("userName")?.trim();

    if (!userName) {
      return NextResponse.json(
        { success: false, message: "Username is required." },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get("authorization") ?? undefined;
    const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

    const company = await getCompanyInfo(userName, accessToken || undefined);

    return NextResponse.json({ success: true, company: normalizeCompanyResponse(company) ?? company });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load company profile.";
    const status = err instanceof CompanyError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
