import { hulmFetch } from "@/lib/api";

export const USER_CREATE_URL = "https://api.hulmsolutions.com/user/create";
export const USER_LOGIN_URL = "https://api.hulmsolutions.com/user/login";
export const USER_ME_URL = "https://api.hulmsolutions.com/user/me";
export const USER_SEND_VERIFICATION_URL = "https://api.hulmsolutions.com/user/send-verification-link";

/** Fixed for AnimalCare360 portal registrations */
export const REGISTER_ACCOUNT_TYPE = "BUSSINESS";
export const REGISTER_BUSINESS_TYPE = "Livestock";

export interface RegisterPayload {
  userName: string;
  email: string;
  companyName: string;
  businessType: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
  accountType: string;
}

export interface RegisterFormInput {
  userName: string;
  email: string;
  companyName: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
}

/** Hulm API envelope */
export interface HulmApiResponse<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  result: T | null;
  error: string | null;
}

export type RegisterApiResponse<T = unknown> = HulmApiResponse<T>;

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginTokenData {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}

export interface ParsedLoginResult {
  tokens: LoginTokenData | null;
}

export interface UserMeData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  companyName: string;
  businessType: string;
  country: string | null;
  registrationDate?: string | null;
}

/** Unwrap Hulm `result` field when it is a JSON string or { data: T } envelope. */
export function parseJsonResult<T>(result: unknown): T | null {
  if (result == null) return null;

  let parsed: unknown = result;
  if (typeof result === "string") {
    try {
      parsed = JSON.parse(result);
    } catch {
      return null;
    }
  }

  if (typeof parsed !== "object" || parsed === null) return null;

  const record = parsed as { data?: T };
  if (record.data !== undefined && record.data !== null) {
    return record.data as T;
  }

  return parsed as T;
}

export function buildRegisterPayload(input: RegisterFormInput): RegisterPayload {
  return {
    userName: input.userName.trim(),
    email: input.email.trim(),
    companyName: input.companyName.trim(),
    password: input.password,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    country: input.country.trim(),
    phoneNumber: input.phoneNumber.trim(),
    accountType: REGISTER_ACCOUNT_TYPE,
    businessType: REGISTER_BUSINESS_TYPE,
  };
}

export function normalizePhone(phone: string) {
  const trimmed = phone.trim().replace(/\s+/g, "");
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("0")) return `+92${trimmed.slice(1)}`;
  if (trimmed.startsWith("92")) return `+${trimmed}`;
  return `+92${trimmed}`;
}

export class HulmApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** @deprecated use HulmApiError */
export const RegisterError = HulmApiError;

export function parseLoginResult(result: unknown): ParsedLoginResult {
  const data = parseJsonResult<LoginTokenData>(result);
  if (data?.access_token && data?.refresh_token) {
    return { tokens: data };
  }
  return { tokens: null };
}

async function parseHulmResponse(res: Response): Promise<Partial<HulmApiResponse>> {
  return (await res.json().catch(() => ({}))) as Partial<HulmApiResponse>;
}

function assertHulmSuccess(data: Partial<HulmApiResponse>, res: Response, fallbackMessage: string) {
  if (!res.ok || data.success !== true) {
    throw new HulmApiError(
      data.message || data.error || fallbackMessage,
      data.status ?? res.status,
    );
  }
}

function normalizeHulmResponse(data: Partial<HulmApiResponse>, res: Response, fallbackMessage: string): HulmApiResponse {
  return {
    status: data.status ?? res.status,
    success: true,
    message: data.message ?? fallbackMessage,
    result: data.result ?? null,
    error: data.error ?? null,
  };
}

export async function createUser(payload: RegisterPayload): Promise<RegisterApiResponse> {
  const res = await hulmFetch(USER_CREATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseHulmResponse(res);
  assertHulmSuccess(data, res, "Registration failed. Please try again.");
  return normalizeHulmResponse(data, res, "User and company created successfully!");
}

export async function loginUser(payload: LoginPayload): Promise<HulmApiResponse> {
  const res = await hulmFetch(USER_LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: payload.username.trim(),
      password: payload.password,
    }),
  });

  const data = await parseHulmResponse(res);
  assertHulmSuccess(data, res, "Invalid username or password.");
  return normalizeHulmResponse(data, res, "Login successful");
}

export async function fetchUserMe(accessToken: string): Promise<UserMeData> {
  const res = await hulmFetch(USER_ME_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const data = await parseHulmResponse(res);
  assertHulmSuccess(data, res, "Unable to load user profile.");

  const me = parseJsonResult<UserMeData>(data.result);
  if (!me?.username) {
    throw new HulmApiError(
      data.message || "Unable to load user profile.",
      data.status ?? res.status,
    );
  }

  return {
    username: me.username.trim(),
    email: String(me.email ?? "").trim(),
    firstName: String(me.firstName ?? "").trim(),
    lastName: String(me.lastName ?? "").trim(),
    fullName: me.fullName,
    companyName: String(me.companyName ?? "").trim(),
    businessType: String(me.businessType ?? "").trim(),
    country: me.country,
    registrationDate: me.registrationDate,
  };
}

export async function sendVerificationLink(email: string): Promise<HulmApiResponse> {
  const res = await hulmFetch(USER_SEND_VERIFICATION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });

  const data = await parseHulmResponse(res);
  assertHulmSuccess(data, res, "Unable to send verification email.");
  return normalizeHulmResponse(data, res, "Verification link sent successfully");
}
