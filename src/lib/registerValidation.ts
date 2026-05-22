import {
  formatPhoneTo15Digits,
  getCountryByCode,
  getCountryByName,
  getPhoneValidationMessage,
  type CountryOption,
} from "@/lib/countries";

export type RegisterField =
  | "companyName"
  | "firstName"
  | "lastName"
  | "userName"
  | "email"
  | "phoneNumber"
  | "country"
  | "password";

export interface RegisterFormValues {
  companyName: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  country: string;
  countryCode?: string;
  password: string;
}

export type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

export interface RegisterValidationResult {
  valid: boolean;
  errors: RegisterFieldErrors;
  message: string;
  /** Normalized values with 15-digit phone when valid. */
  normalized?: RegisterFormValues;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/** Letters, numbers, and underscore only — no spaces or other special characters. */
export const ALPHANUMERIC_UNDERSCORE_RE = /^[a-zA-Z0-9_]+$/;

export function sanitizeAlphanumeric(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, "");
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const NAME_RE = /^[a-zA-Z0-9_]{2,50}$/;
const COMPANY_RE = /^[a-zA-Z0-9_]{2,100}$/;

function required(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required.`;
  return undefined;
}

export function validateRegisterForm(values: RegisterFormValues): RegisterValidationResult {
  const errors: RegisterFieldErrors = {};

  const companyName = values.companyName.trim();
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const userName = values.userName.trim();
  const email = values.email.trim();
  const phoneInput = values.phoneNumber.trim();
  const countryName = values.country.trim();
  const password = values.password;

  const companyRequired = required(companyName, "Company name");
  if (companyRequired) errors.companyName = companyRequired;
  else if (companyName.length < 2) errors.companyName = "Company name must be at least 2 characters.";
  else if (companyName.length > 100) errors.companyName = "Company name must be 100 characters or less.";
  else if (!COMPANY_RE.test(companyName)) {
    errors.companyName = "Use letters, numbers, and underscore only (no spaces or other special characters).";
  }

  const firstRequired = required(firstName, "First name");
  if (firstRequired) errors.firstName = firstRequired;
  else if (!NAME_RE.test(firstName)) {
    errors.firstName = "Use letters, numbers, and underscore only (no spaces or other special characters).";
  }

  const lastRequired = required(lastName, "Last name");
  if (lastRequired) errors.lastName = lastRequired;
  else if (!NAME_RE.test(lastName)) {
    errors.lastName = "Use letters, numbers, and underscore only (no spaces or other special characters).";
  }

  const userRequired = required(userName, "Username");
  if (userRequired) errors.userName = userRequired;
  else if (!USERNAME_RE.test(userName)) {
    errors.userName =
      "Username must be 3–30 characters (letters, numbers, underscore only).";
  }

  const emailRequired = required(email, "Email");
  if (emailRequired) errors.email = emailRequired;
  else if (email.length > 254) errors.email = "Email is too long.";
  else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  const countryRequired = required(countryName, "Country");
  let countryMeta: CountryOption | undefined;
  if (countryRequired) {
    errors.country = countryRequired;
  } else {
    countryMeta =
      getCountryByCode(values.countryCode ?? "") ?? getCountryByName(countryName);
    if (!countryMeta) {
      errors.country = "Please select a valid country.";
    }
  }

  const phoneRequired = required(phoneInput, "Phone number");
  let formattedPhone: string | null = null;
  if (phoneRequired) {
    errors.phoneNumber = phoneRequired;
  } else if (!countryMeta) {
    errors.phoneNumber = "Select a country before entering your phone number.";
  } else {
    formattedPhone = formatPhoneTo15Digits(countryMeta, phoneInput);
    if (!formattedPhone) {
      errors.phoneNumber =
        countryMeta.code === "PK"
          ? "Enter 10 digits starting with 3 (e.g. 3001234567). Do not include +92."
          : getPhoneValidationMessage(countryMeta);
    }
  }

  if (!password) errors.password = "Password is required.";
  else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (password.length > 128) {
    errors.password = "Password must be 128 characters or less.";
  } else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    errors.password = "Password must include at least one letter and one number.";
  }

  const firstError = Object.values(errors)[0];
  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    message: firstError ?? "",
    normalized: valid
      ? {
          companyName,
          firstName,
          lastName,
          userName,
          email,
          phoneNumber: formattedPhone!,
          country: countryMeta!.name,
          password,
        }
      : undefined,
  };
}
