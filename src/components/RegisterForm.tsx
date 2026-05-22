"use client";

import { useState, FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, Globe, Mail, Phone, User } from "lucide-react";
import { profileFromRegister, setUser, syncProfileFromCompany } from "@/lib/auth";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  formatPhoneTo15Digits,
  getCountryByCode,
  getCountryByName,
} from "@/lib/countries";
import { buildRegisterPayload, createUser, HulmApiError } from "@/lib/user";
import {
  type RegisterField,
  type RegisterFieldErrors,
  type RegisterFormValues,
  sanitizeAlphanumeric,
  validateRegisterForm,
} from "@/lib/registerValidation";

function fieldClass(hasError: boolean, withIcon = false) {
  const base = withIcon ? "input-primary !pl-11" : "input-primary";
  return hasError ? `${base} !border-red-400 focus:!border-red-500 focus:!ring-red-100` : base;
}

function selectClass(hasError: boolean) {
  const base = "input-primary !pl-11 appearance-none cursor-pointer";
  return hasError ? `${base} !border-red-400 focus:!border-red-500 focus:!ring-red-100` : base;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-600 font-medium">{message}</p>;
}

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [country, setCountry] = useState(DEFAULT_COUNTRY.name);

  const selectedCountry = getCountryByName(country) ?? DEFAULT_COUNTRY;

  function clearFieldError(field: RegisterField) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleFieldChange(field: RegisterField) {
    return () => {
      if (fieldErrors[field]) clearFieldError(field);
      if (error) setError("");
    };
  }

  function handleAlphanumericInput(field: RegisterField) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const cleaned = sanitizeAlphanumeric(e.target.value);
      if (e.target.value !== cleaned) {
        e.target.value = cleaned;
      }
      handleFieldChange(field)();
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const form = new FormData(e.currentTarget);
    const countryCode =
      String(form.get("countryCode") ?? "").trim() || selectedCountry.code;
    const countryMeta = getCountryByCode(countryCode) ?? selectedCountry;
    const rawPhone = String(form.get("phoneNumber") ?? "").trim();

    const values: RegisterFormValues = {
      companyName: (form.get("companyName") as string)?.trim() ?? "",
      firstName: (form.get("firstName") as string)?.trim() ?? "",
      lastName: (form.get("lastName") as string)?.trim() ?? "",
      userName: (form.get("userName") as string)?.trim() ?? "",
      email: (form.get("email") as string)?.trim() ?? "",
      phoneNumber: rawPhone,
      country: countryMeta.name,
      countryCode: countryMeta.code,
      password: (form.get("password") as string) ?? "",
    };

    const formattedPhone = formatPhoneTo15Digits(countryMeta, rawPhone);
    if (!formattedPhone) {
      setFieldErrors({
        phoneNumber: `Enter a valid ${countryMeta.name} mobile number.`,
      });
      setError(
        countryMeta.code === "PK"
          ? "Enter 10 digits starting with 3 (e.g. 3001234567). Do not include +92."
          : `Enter a valid ${countryMeta.name} mobile number without +${countryMeta.dialCode}.`,
      );
      return;
    }

    const validation = validateRegisterForm({
      ...values,
      phoneNumber: formattedPhone,
    });
    if (!validation.valid || !validation.normalized) {
      setFieldErrors(validation.errors);
      setError(validation.message || "Please fix the highlighted fields.");
      return;
    }

    const payload = validation.normalized;
    setLoading(true);

    try {
      const result = await createUser(buildRegisterPayload(payload));
      const profile = profileFromRegister(payload);
      setUser(profile);
      setSuccess(result.message || "User and company created successfully!");

      await syncProfileFromCompany(profile.username);

      router.push("/");
    } catch (err) {
      const message =
        err instanceof HulmApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to reach the server. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-180px)] grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex panel-dark flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_60%,#22c55e,transparent_50%)]" />
        <div className="relative z-10">
          <Image src="/user-icon.png" alt="" width={56} height={56} className="mb-8" />
          <h2 className="text-3xl font-bold mb-4">Join 1,500+ Pakistani Businesses</h2>
          <p className="text-slate-300 leading-relaxed max-w-sm">
            Register once and subscribe to Cattle Pro, POS Pharmacy, or additional modules as your
            operation grows.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-brand-background">
        <div className="auth-card w-full max-w-lg">
          <p className="text-brand-primary font-bold text-xs tracking-[0.2em] uppercase mb-2">
            New Account
          </p>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Create Your Account</h1>
          <p className="text-brand-muted text-sm mb-8">
            Free 14-day trial · No credit card required
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Company / Store name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  name="companyName"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="organization"
                  onChange={handleAlphanumericInput("companyName")}
                  className={fieldClass(!!fieldErrors.companyName, true)}
                  placeholder="Letters, numbers, underscore"
                  pattern="[a-zA-Z0-9_]+"
                  aria-invalid={!!fieldErrors.companyName}
                  aria-describedby={fieldErrors.companyName ? "companyName-error" : undefined}
                />
              </div>
              <FieldError message={fieldErrors.companyName} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-navy mb-2">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  maxLength={50}
                  autoComplete="given-name"
                  onChange={handleAlphanumericInput("firstName")}
                  className={fieldClass(!!fieldErrors.firstName)}
                  placeholder="Letters, numbers, underscore"
                  pattern="[a-zA-Z0-9_]+"
                  aria-invalid={!!fieldErrors.firstName}
                />
                <FieldError message={fieldErrors.firstName} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-navy mb-2">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  maxLength={50}
                  autoComplete="family-name"
                  onChange={handleAlphanumericInput("lastName")}
                  className={fieldClass(!!fieldErrors.lastName)}
                  placeholder="Letters, numbers, underscore"
                  pattern="[a-zA-Z0-9_]+"
                  aria-invalid={!!fieldErrors.lastName}
                />
                <FieldError message={fieldErrors.lastName} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  name="userName"
                  type="text"
                  required
                  minLength={3}
                  maxLength={30}
                  autoComplete="username"
                  onChange={handleAlphanumericInput("userName")}
                  className={fieldClass(!!fieldErrors.userName, true)}
                  placeholder="Letters, numbers, underscore"
                  pattern="[a-zA-Z0-9_]+"
                  aria-invalid={!!fieldErrors.userName}
                />
              </div>
              <FieldError message={fieldErrors.userName} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  onChange={handleFieldChange("email")}
                  className={fieldClass(!!fieldErrors.email, true)}
                  placeholder="you@example.com"
                  aria-invalid={!!fieldErrors.email}
                />
              </div>
              <FieldError message={fieldErrors.email} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none z-10" />
                <select
                  name="country"
                  required
                  value={country}
                  onChange={(e) => {
                    const next = COUNTRIES.find((c) => c.name === e.target.value);
                    if (next) setCountry(next.name);
                    handleFieldChange("country")();
                    if (fieldErrors.phoneNumber) clearFieldError("phoneNumber");
                  }}
                  className={selectClass(!!fieldErrors.country)}
                  aria-invalid={!!fieldErrors.country}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name} (+{c.dialCode})
                    </option>
                  ))}
                </select>
                <input type="hidden" name="countryCode" value={selectedCountry.code} />
              </div>
              <FieldError message={fieldErrors.country} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative flex">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted z-10 pointer-events-none" />
                <span className="input-primary !w-auto !min-w-[4.5rem] !pl-11 !pr-3 !rounded-r-none !border-r-0 shrink-0 flex items-center text-sm font-semibold text-brand-navy bg-brand-background">
                  +{selectedCountry.dialCode}
                </span>
                <input
                  name="phoneNumber"
                  type="tel"
                  required
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={selectedCountry.code === "PK" ? 11 : 15}
                  onInput={(e) => {
                    const input = e.currentTarget;
                    const cleaned = input.value.replace(/\D/g, "");
                    if (input.value !== cleaned) input.value = cleaned;
                    handleFieldChange("phoneNumber")();
                  }}
                  className={`${fieldClass(!!fieldErrors.phoneNumber)} !rounded-l-none flex-1`}
                  placeholder={selectedCountry.placeholder}
                  aria-invalid={!!fieldErrors.phoneNumber}
                />
              </div>
              <FieldError message={fieldErrors.phoneNumber} />
              {!fieldErrors.phoneNumber && (
                <p className="mt-1.5 text-xs text-brand-muted">
                  {selectedCountry.code === "PK"
                    ? "Enter 10 digits starting with 3 (e.g. 3001234567). +92 is added automatically."
                    : `Enter national number only (no +${selectedCountry.dialCode}). Saved as 15 digits.`}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                onChange={handleFieldChange("password")}
                className={fieldClass(!!fieldErrors.password)}
                placeholder="Min 8 characters, letter and number"
                aria-invalid={!!fieldErrors.password}
              />
              <FieldError message={fieldErrors.password} />
              {!fieldErrors.password && (
                <p className="mt-1.5 text-xs text-brand-muted">
                  At least 8 characters with one letter and one number.
                </p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                {success}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3.5 text-base mt-2 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account & Continue"}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-8 pt-6 border-t border-brand-border">
            Already registered?{" "}
            <Link href="/login" className="text-brand-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
