"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, X } from "lucide-react";
import { loginAndBootstrap } from "@/lib/hulmClient";
import { HulmApiError, forgotPassword } from "@/lib/user";
import { applyLoginSession } from "@/lib/syncProfile";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  async function handleForgotSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    const email = forgotEmail.trim();
    if (!email) {
      setForgotError("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await forgotPassword(email);
      setForgotSuccess(res.message);
      setForgotEmail("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to process request.";
      setForgotError(msg);
    } finally {
      setForgotLoading(false);
    }
  }

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
      let message =
        err instanceof HulmApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to reach the server. Please try again.";

      if (message.toLowerCase().includes("user not found")) {
        message = "Invalid email/username";
      } else if (message.toLowerCase().includes("invalid email/username or password")) {
        message = "Incorrect password";
      }

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
                placeholder="e.g. user@example.com or username"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-brand-navy">Password</label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotError("");
                  setForgotSuccess("");
                  setForgotEmail("");
                }}
                className="text-xs font-bold text-brand-primary hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                name="password"
                type="password"
                required
                className="input-primary !pl-11"
                placeholder="••••••••"
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
            className="btn-primary w-full !py-3.5 text-base disabled:opacity-60 cursor-pointer"
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-brand-border shadow-panel p-6 sm:p-8 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotError("");
                setForgotSuccess("");
                setForgotEmail("");
              }}
              className="absolute right-4 top-4 text-brand-muted hover:text-brand-navy transition-colors cursor-pointer bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-brand-navy mb-2">Reset Password</h2>
              <p className="text-brand-muted text-sm leading-relaxed">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-navy mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotError) setForgotError("");
                  }}
                  className="input-primary"
                  placeholder="e.g. user@example.com"
                  disabled={forgotLoading}
                />
              </div>
              {forgotError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {forgotError}
                </p>
              )}
              {forgotSuccess && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                  {forgotSuccess}
                </p>
              )}
              <button
                type="submit"
                disabled={forgotLoading}
                className="btn-primary w-full !py-3.5 text-base disabled:opacity-60 cursor-pointer"
              >
                {forgotLoading ? "Sending Link..." : "Send Password Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
