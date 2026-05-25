"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import RazorpayButton from "@/components/payment/RazorpayButton";

type BatchData = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  original_price: number | null;
  teacher_name: string | null;
  thumbnail_url: string | null;
};

type ConcessionData = {
  id: string;
  concession_type: string;
  discount_percent: number;
  discount_amount: number;
  status: string;
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.batchId as string;

  const [batch, setBatch] = useState<BatchData | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [concession, setConcession] = useState<ConcessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      if (!isSupabaseAdminConfigured) {
        setError("System not configured");
        setLoading(false);
        return;
      }

      const { data: { user: authUser } } = await supabaseAdmin.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email")
        .eq("id", authUser.id)
        .single();

      const res = await fetch(`/api/batches/slug/${batchId}`);
      const json = await res.json();
      if (!json.batch) {
        setError("Batch not found");
        setLoading(false);
        return;
      }

      setBatch(json.batch);
      setUser({
        id: authUser.id,
        name: profile?.full_name || authUser.email || "Student",
        email: profile?.email || authUser.email || "",
      });

      const { data: conc } = await supabaseAdmin
        .from("concession_requests")
        .select("id, concession_type, discount_percent, discount_amount, status")
        .eq("user_id", authUser.id)
        .eq("status", "approved")
        .eq("is_active", true)
        .maybeSingle();

      setConcession(conc);
      setLoading(false);
    }
    init();
  }, [batchId, router]);

  const originalPrice = batch?.original_price || (batch ? Math.round(batch.price * 1.5) : 0);
  const hasDiscount = concession && concession.status === "approved";
  const discountedPrice = hasDiscount
    ? concession.discount_percent
      ? batch!.price - Math.round(batch!.price * (concession.discount_percent / 100))
      : Math.max(0, batch!.price - concession.discount_amount)
    : batch?.price || 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5c35d9] border-t-transparent" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-lg text-red-500">{error || "Something went wrong"}</p>
        <Link href="/batches" className="text-[#5c35d9] underline">Browse batches</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/batches" className="text-sm text-gray-500 hover:text-[#5c35d9]">&larr; Back to batches</Link>
          <Link href="/" className="text-sm font-bold text-[#5c35d9]">Vi Smart</Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3 space-y-6">
            <div className="rounded-xl border bg-white p-6">
              <h1 className="text-2xl font-bold text-gray-900">{batch.title}</h1>
              {batch.teacher_name && (
                <p className="mt-1 text-sm text-gray-500">by {batch.teacher_name}</p>
              )}
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Fee Concession</h2>
              {hasDiscount ? (
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="font-semibold text-green-800">
                    Concession Approved
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {concession.concession_type === "army" && "Army Privilege — 50% off"}
                    {concession.concession_type === "single_parent" && "Single Parent Support — \u20B95,000 off"}
                    {concession.concession_type === "disabled" && "Specially Abled — 50% off"}
                  </p>
                  <p className="text-xs text-green-600 mt-1">Discount will be applied automatically at checkout</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    You may qualify for a fee concession. Apply now and get instant approval.
                  </p>
                  <Link
                    href={`/concession?batchId=${batchId}`}
                    className="inline-block rounded-lg bg-[#5c35d9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Apply for Concession
                  </Link>
                  <div className="mt-3 space-y-1 text-xs text-gray-500">
                    <p>&bull; Army Privilege — 50% off</p>
                    <p>&bull; Single Parent Support — &rsqb;5,000 flat off</p>
                    <p>&bull; Specially Abled — 50% off</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="sticky top-4 rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Batch Price</span>
                  <span className="font-medium text-gray-900 line-through">₹{originalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Offer Price</span>
                  <span className="font-medium text-gray-900">₹{batch.price.toLocaleString("en-IN")}</span>
                </div>
                {hasDiscount && (
                  <div className="flex justify-between text-green-700">
                    <span>Concession Discount</span>
                    <span className="font-semibold">
                      -₹{(batch.price - discountedPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className={hasDiscount ? "text-green-700" : "text-gray-900"}>
                    ₹{(hasDiscount ? discountedPrice : batch.price).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <RazorpayButton
                  batchId={batch.id}
                  batchTitle={batch.title}
                  price={hasDiscount ? discountedPrice : batch.price}
                  studentName={user?.name || "Student"}
                  studentEmail={user?.email || ""}
                />
              </div>

              <p className="mt-3 text-center text-xs text-gray-400">
                Secure payment via Razorpay
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
