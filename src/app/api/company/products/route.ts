import { NextResponse } from "next/server";
import { CompanyError, getCompanyProducts } from "@/lib/company";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = Number(searchParams.get("CID") ?? searchParams.get("cid"));

    if (!cid) {
      return NextResponse.json(
        { success: false, message: "Company ID (CID) is required." },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get("authorization") ?? undefined;
    const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

    const products = await getCompanyProducts(cid, accessToken);

    return NextResponse.json({ success: true, products });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load applications.";
    const status = err instanceof CompanyError ? err.status : 500;
    return NextResponse.json({ success: false, message, products: [] }, { status });
  }
}
