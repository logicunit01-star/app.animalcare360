import { NextResponse } from "next/server";
import { fetchUserMe, HulmApiError } from "@/lib/user";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.replace(/^Bearer\s+/i, "").trim();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Authorization token is required." },
        { status: 401 },
      );
    }

    const user = await fetchUserMe(accessToken);

    return NextResponse.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load user profile.";
    const status = err instanceof HulmApiError ? err.status : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
