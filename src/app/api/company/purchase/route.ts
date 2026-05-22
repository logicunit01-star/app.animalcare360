import { NextResponse } from "next/server";
import { CompanyError, purchaseCompanyApp } from "@/lib/company";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cid = Number(body.CID ?? body.cid);
    const aid = Number(body.AID ?? body.aid);

    if (!cid || !aid) {
      return NextResponse.json(
        { success: false, message: "Company ID and application ID are required." },
        { status: 400 },
      );
    }

    const authHeader = request.headers.get("authorization") ?? undefined;
    const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

    const result = await purchaseCompanyApp(cid, aid, accessToken);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to complete purchase.";
    const status = err instanceof CompanyError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
