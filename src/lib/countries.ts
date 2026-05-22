export interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
  minNationalLength: number;
  maxNationalLength: number;
  placeholder: string;
  /** National number must start with these digits (e.g. Pakistan mobile "3"). */
  mobileStartsWith?: string[];
}

export const COUNTRIES: CountryOption[] = [
  {
    code: "PK",
    name: "Pakistan",
    dialCode: "92",
    minNationalLength: 10,
    maxNationalLength: 10,
    placeholder: "3001234567",
    mobileStartsWith: ["3"],
  },
  {
    code: "IN",
    name: "India",
    dialCode: "91",
    minNationalLength: 10,
    maxNationalLength: 10,
    placeholder: "9876543210",
    mobileStartsWith: ["6", "7", "8", "9"],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "971",
    minNationalLength: 9,
    maxNationalLength: 9,
    placeholder: "501234567",
    mobileStartsWith: ["5"],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "966",
    minNationalLength: 9,
    maxNationalLength: 9,
    placeholder: "512345678",
    mobileStartsWith: ["5"],
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "44",
    minNationalLength: 10,
    maxNationalLength: 10,
    placeholder: "7400123456",
    mobileStartsWith: ["7"],
  },
  {
    code: "US",
    name: "United States",
    dialCode: "1",
    minNationalLength: 10,
    maxNationalLength: 10,
    placeholder: "2025550123",
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "1",
    minNationalLength: 10,
    maxNationalLength: 10,
    placeholder: "4165550123",
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "61",
    minNationalLength: 9,
    maxNationalLength: 9,
    placeholder: "412345678",
    mobileStartsWith: ["4"],
  },
  {
    code: "BD",
    name: "Bangladesh",
    dialCode: "880",
    minNationalLength: 10,
    maxNationalLength: 10,
    placeholder: "1712345678",
    mobileStartsWith: ["1"],
  },
  {
    code: "AF",
    name: "Afghanistan",
    dialCode: "93",
    minNationalLength: 9,
    maxNationalLength: 9,
    placeholder: "701234567",
    mobileStartsWith: ["7"],
  },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export function getCountryByName(name: string): CountryOption | undefined {
  const trimmed = name.trim();
  return COUNTRIES.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
}

export function getCountryByCode(code: string): CountryOption | undefined {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return undefined;
  return COUNTRIES.find((c) => c.code.toUpperCase() === normalized);
}

/** Parse Pakistan mobile to 10 national digits (3XXXXXXXXX). */
export function parsePakistanMobileDigits(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("92")) {
    digits = digits.slice(2);
  }

  while (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length > 10) {
    const match = digits.match(/3\d{9}$/);
    if (match) digits = match[0];
  }

  if (/^3\d{9}$/.test(digits)) {
    return digits;
  }

  return null;
}

/** Strip formatting; remove leading 0, country code, or 00 prefix from user input. */
export function extractNationalDigits(country: CountryOption, input: string): string {
  let digits = input.replace(/\D/g, "");
  const dial = country.dialCode;

  if (digits.startsWith(`00${dial}`)) {
    const rest = digits.slice(2 + dial.length);
    if (rest.length >= country.minNationalLength) digits = rest;
  } else if (digits.startsWith(dial) && digits.length > country.maxNationalLength) {
    const rest = digits.slice(dial.length);
    if (rest.length >= country.minNationalLength && rest.length <= country.maxNationalLength) {
      digits = rest;
    }
  } else if (digits.startsWith("0") && digits.length === country.maxNationalLength + 1) {
    digits = digits.slice(1);
  }

  return digits;
}

/**
 * Build international number (country code + national) and left-pad to 15 digits.
 * Example (Pakistan): 3353684815 → 000923353684815
 */
export function formatPhoneTo15Digits(
  country: CountryOption,
  input: string,
): string | null {
  const digitsOnly = input.replace(/\D/g, "");

  if (country.code === "PK" && digitsOnly.length === 15) {
    const national = parsePakistanMobileDigits(digitsOnly);
    if (national) {
      return `${country.dialCode}${national}`.padStart(15, "0");
    }
  }

  let national: string | null;

  if (country.code === "PK") {
    national = parsePakistanMobileDigits(input);
    if (!national) return null;
  } else {
    const extracted = extractNationalDigits(country, input);
    if (
      extracted.length < country.minNationalLength ||
      extracted.length > country.maxNationalLength
    ) {
      return null;
    }
    if (country.mobileStartsWith?.length) {
      const validPrefix = country.mobileStartsWith.some((p) => extracted.startsWith(p));
      if (!validPrefix) return null;
    }
    national = extracted;
  }

  const international = `${country.dialCode}${national}`;
  if (international.length > 15) return null;

  return international.padStart(15, "0");
}

export function isValidPhoneForCountry(country: CountryOption, input: string): boolean {
  return formatPhoneTo15Digits(country, input) !== null;
}

export function getPhoneValidationMessage(country: CountryOption): string {
  if (country.code === "PK") {
    return "Enter 10 digits starting with 3 (e.g. 3001234567). Do not include +92.";
  }
  const prefixHint = country.mobileStartsWith?.length
    ? ` starting with ${country.mobileStartsWith.join(" or ")}`
    : "";
  return `Enter a valid ${country.name} mobile number (${country.minNationalLength} digits${prefixHint}, without country code).`;
}
