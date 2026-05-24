"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile`,
    });

    setLoading(false);
    if (resetError) setError(resetError.message);
    else setMessage("Password reset link sent. Please check your email.");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <img src="/images/logo-transparentbg.png" alt="Vi Smart" className="h-14 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 text-center">Reset password</h1>
        <p className="text-sm text-gray-500 text-center mt-2 mb-6">
          Enter your email and we will send a secure reset link.
        </p>
        {message && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={resetPassword} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c35d9]"
          />
          <button disabled={loading} className="w-full bg-[#5c35d9] text-white py-3 rounded-lg font-semibold disabled:opacity-50">
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <Link href="/login" className="mt-6 block text-center text-sm font-medium text-[#5c35d9]">
          Back to login
        </Link>
      </div>
    </div>
  );
}
