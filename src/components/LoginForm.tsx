"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User } from "lucide-react";
import { loginAndBootstrap } from "@/lib/hulmClient";
import { HulmApiError } from "@/lib/user";
import { applyLoginSession } from "@/lib/syncProfile";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const username = (form.get("username") as string)?.trim();
    const password = form.get("password") as string;

    if (!username || !password) {
      setError("Please enter username or email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginAndBootstrap(username, password);

      await applyLoginSession({
        username: data.username ?? username,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        company: data.company,
        products: data.products,
      });
      router.push(redirect);
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
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center py-12 px-6 sm:px-10 max-w-7xl mx-auto">
      <div className="auth-card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <Image src="/user-icon.png" alt="AnimalCare360 Logo" fill className="object-contain" />
          </div>
          <span className="text-brand-primary font-bold text-xs tracking-[0.2em] uppercase block mb-1">
            CattlePro Portal
          </span>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Sign In</h1>
          <p className="text-brand-muted text-sm">
            Enter your credentials to continue to simulator explorer
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-2">
              Username or email
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                name="username"
                type="text"
                required
                className="input-primary !pl-11"
                autoComplete="username"
                placeholder="Username or email"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                name="password"
                type="password"
                required
                className="input-primary !pl-11"
                placeholder="Enter password"
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3.5 text-base disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In to Portal"}
          </button>
        </form>

        <p className="text-center text-sm text-brand-muted mt-8 pt-6 border-t border-brand-border">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-primary font-bold hover:underline">
            Create free account
          </Link>
        </p>
      </div>
    </div>
  );
}
