import { NextResponse } from "next/server";
import { validateRegisterForm } from "@/lib/registerValidation";
import { buildRegisterPayload, createUser, HulmApiError } from "@/lib/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const values = {
      userName: String(body.userName ?? "").trim(),
      email: String(body.email ?? "").trim(),
      companyName: String(body.companyName ?? "").trim(),
      password: String(body.password ?? ""),
      firstName: String(body.firstName ?? "").trim(),
      lastName: String(body.lastName ?? "").trim(),
      country: String(body.country ?? "").trim(),
      countryCode: String(body.countryCode ?? "").trim(),
      phoneNumber: String(body.phoneNumber ?? "").trim(),
    };

    const validation = validateRegisterForm(values);
    if (!validation.valid || !validation.normalized) {
      return NextResponse.json(
        {
          success: false,
          message: validation.message || "Please fix the highlighted fields.",
          errors: validation.errors,
        },
        { status: 400 },
      );
    }

    const { userName, email, companyName, password, firstName, lastName, country, phoneNumber } =
      validation.normalized;

    const payload = buildRegisterPayload({
      userName,
      email,
      companyName,
      password,
      firstName,
      lastName,
      country,
      phoneNumber,
    });

    const result = await createUser(payload);

    return NextResponse.json(
      {
        ...result,
        profile: {
          username: userName,
          email,
          firstName,
          lastName,
          companyName,
          phoneNumber,
          country,
        },
      },
      { status: result.status },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
    const status = err instanceof HulmApiError ? err.status : 400;
    return NextResponse.json(
      { status, success: false, message, result: null, error: message },
      { status },
    );
  }
}
