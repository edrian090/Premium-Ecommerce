'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [strength, setStrength] = useState({ score: 0, label: "Too Short", color: "bg-neutral-200" });

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: "Too Short", color: "bg-neutral-200" });
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    let label = "Weak";
    let color = "bg-red-500";

    if (password.length < 8) {
      label = "Too Short (Min. 8 characters)";
      color = "bg-red-400";
    } else if (score <= 2) {
      label = "Fair";
      color = "bg-amber-500";
    } else if (score === 3) {
      label = "Good";
      color = "bg-blue-500";
    } else {
      label = "Strong";
      color = "bg-emerald-500";
    }

    setStrength({ score, label, color });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please request a new link.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-neutral-100 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 border border-red-100 mb-2">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
            Invalid Link
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            The password reset link is invalid, expired, or missing a secure token. Please request a new password reset link.
          </p>
        </div>
        <div className="pt-4">
          <Link 
            href="/forgot-password"
            className="flex w-full justify-center items-center rounded-xl bg-[#0F3460] py-4 text-base font-semibold text-white shadow-sm hover:bg-[#1A1A2E] transition-all hover:scale-[1.02]"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-neutral-100 transition-all duration-300">
      {success ? (
        <div className="space-y-6 text-center py-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-2">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
              Password Reset!
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Your password has been successfully updated. You are now being redirected back to the login page.
            </p>
          </div>
          
          <div className="flex justify-center pt-2">
            <Loader2 className="h-6 w-6 text-[#0F3460] animate-spin" />
          </div>
        </div>
      ) : (
        <>
          <div>
            <h2 className="mt-4 text-left text-3xl font-extrabold tracking-tight text-[#1A1A2E]">
              Create new password
            </h2>
            <p className="mt-2 text-left text-sm text-neutral-500 font-medium">
              Please enter a secure password that is at least 8 characters long.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 animate-shake">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 font-semibold">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              {/* Password field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 focus:ring-[#0F3460] focus:border-[#0F3460] py-6 border-neutral-200 rounded-xl"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1.5 pt-1 px-1 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-500">Strength:</span>
                    <span className="font-bold text-neutral-700">{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-transparent'}`} />
                  </div>
                </div>
              )}

              {/* Confirm Password field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 focus:ring-[#0F3460] focus:border-[#0F3460] py-6 border-neutral-200 rounded-xl"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center rounded-xl border border-transparent bg-[#0F3460] py-6 px-4 text-base font-semibold text-white shadow-sm hover:bg-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:ring-offset-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <Suspense fallback={
        <div className="w-full max-w-md flex flex-col items-center justify-center p-10 bg-white rounded-2xl shadow-xl border border-neutral-100">
          <Loader2 className="h-8 w-8 text-[#0F3460] animate-spin" />
          <p className="mt-4 text-sm text-neutral-500 font-semibold">Loading reset portal...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
