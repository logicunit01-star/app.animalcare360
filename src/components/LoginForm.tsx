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
    <div className="min-h-[calc(100vh-180px)] grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex panel-dark flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_40%,#22c55e,transparent_60%)]" />
        <div className="relative z-10">
          <Image src="/user-icon.png" alt="" width={56} height={56} className="mb-8" />
          <h2 className="text-3xl font-bold mb-4">Secure Business Access</h2>
          <p className="text-slate-300 leading-relaxed max-w-sm">
            Sign in to manage subscriptions, deploy ERP modules, and access your AnimalCare360
            enterprise dashboard.
          </p>
          <ul className="mt-10 space-y-3 text-sm text-slate-400">
            <li>✓ Multi-branch cloud sync</li>
            <li>✓ FBR-compliant billing</li>
            <li>✓ 14-day free trial on all modules</li>
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-brand-background">
        <div className="auth-card w-full max-w-md">
          <p className="text-brand-primary font-bold text-xs tracking-[0.2em] uppercase mb-2">
            Account Access
          </p>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Sign In</h1>
          <p className="text-brand-muted text-sm mb-8">
            Enter your credentials to continue to checkout
          </p>

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
    </div>
  );
}
