'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [devInfo, setDevInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setDevInfo(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setSuccess(true);
      if (data.info) {
        setDevInfo(data.info);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-neutral-100 transition-all duration-300">
        
        {/* Back to Login Button */}
        <div>
          <Link 
            href="/login" 
            className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-[#0F3460] transition-colors gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>

        {!success ? (
          <>
            <div>
              <h2 className="mt-4 text-left text-3xl font-extrabold tracking-tight text-[#1A1A2E]">
                Forgot password?
              </h2>
              <p className="mt-2 text-left text-sm text-neutral-500">
                No worries! Enter your email address below and we'll send you a secure link to reset your password.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 animate-shake">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 focus:ring-[#0F3460] focus:border-[#0F3460] py-6 border-neutral-200 rounded-xl"
                    placeholder="you@example.com"
                  />
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
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-6 text-center py-4 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-2">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1A1A2E]">
                Check your email
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed px-2">
                We have sent a secure link to <strong className="text-neutral-800">{email}</strong>. Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>

            {devInfo && (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 border border-amber-200 text-left">
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Development Info:</div>
                <div className="text-xs text-amber-700 leading-relaxed font-mono break-all">{devInfo}</div>
                <div className="text-[10px] text-amber-600 mt-2 italic">Note: Copy and paste this link in your browser to proceed with local testing. This is only visible when using placeholder SendGrid keys.</div>
              </div>
            )}

            <div className="pt-4">
              <p className="text-sm text-neutral-500">
                Didn't receive the email?{" "}
                <button 
                  onClick={handleSubmit} 
                  className="font-semibold text-[#0F3460] hover:underline"
                  disabled={loading}
                >
                  Click to resend
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
