'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        // Automatically sign them in after successful registration
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        
        if (loginRes?.error) {
          setError(loginRes.error);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Registration failed");
      }
    } catch {
      setError("Internal server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-neutral-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-[#1A1A2E]">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-500">
            Or{" "}
            <button onClick={() => signIn()} className="font-medium text-[#0F3460] hover:text-blue-500 transition-colors">
              sign in to your existing account
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-700 font-semibold">{error}</div>
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus:ring-[#0F3460] focus:border-[#0F3460]"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email address</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:ring-[#0F3460] focus:border-[#0F3460]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus:ring-[#0F3460] focus:border-[#0F3460]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-[#0F3460] py-4 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#0F3460] focus:ring-offset-2 transition-all hover:scale-[1.02]"
            >
              {loading ? "Registering..." : "Sign Up"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
