import { NextResponse } from "next/server";
import { HulmApiError, sendVerificationLink } from "@/lib/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();

    if (!email) {
      return NextResponse.json(
        { status: 400, success: false, message: "Email is required.", result: null, error: "Missing email" },
        { status: 400 },
      );
    }

    const result = await sendVerificationLink(email);
    return NextResponse.json(result, { status: result.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to send verification email.";
    const status = err instanceof HulmApiError ? err.status : 400;
    return NextResponse.json(
      { status, success: false, message, result: null, error: message },
      { status },
    );
  }
}
