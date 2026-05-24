"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    currentClass: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const { error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          phone: form.phone,
          current_class: form.currentClass,
          role: "student",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    router.push("/login?message=Check your email to verify account");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src="/images/logo-transparentbg.png" alt="Vi Smart" className="h-14 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Vi Smart Learning Education</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c35d9]"
          />
          <input
            type="email"
            required
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c35d9]"
          />
          <div className="flex">
            <span className="border border-r-0 border-gray-300 rounded-l-lg px-3 py-3 text-sm bg-gray-50 text-gray-600">
              +91
            </span>
            <input
              type="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-r-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c35d9]"
            />
          </div>
          <select
            value={form.currentClass}
            onChange={(e) => setForm({ ...form, currentClass: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c35d9]"
          >
            <option value="">Select your class</option>
            <option value="9">Class 9th</option>
            <option value="10">Class 10th</option>
            <option value="11-science">Class 11th - Science</option>
            <option value="11-commerce">Class 11th - Commerce</option>
            <option value="12-science">Class 12th - Science</option>
            <option value="12-commerce">Class 12th - Commerce</option>
            <option value="bcom">B.COM</option>
            <option value="bba">BBA</option>
            <option value="other">Other</option>
          </select>
          <input
            type="password"
            required
            placeholder="Password, min 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c35d9]"
          />
          <input
            type="password"
            required
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c35d9]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5c35d9] text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#5c35d9] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
