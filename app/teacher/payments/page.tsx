import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import PaymentsClient from "./PaymentsClient";

export const dynamic = "force-dynamic";

async function getPayments() {
  if (!isSupabaseAdminConfigured) return [];

  const { data } = await supabaseAdmin
    .from("payments")
    .select("id,amount,discount_type,razorpay_payment_id,status,created_at,student:profiles!student_id(full_name,email),batch:batches(title)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((payment: any) => ({
    id: payment.id,
    student: payment.student?.full_name || payment.student?.email || "—",
    batch: payment.batch?.title || "—",
    amount: Number(payment.amount || 0),
    discount: payment.discount_type || null,
    razorpayId: payment.razorpay_payment_id || null,
    status: payment.status,
    createdAt: payment.created_at,
  }));
}

export default async function TeacherPaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">
            {payments.length} payment{payments.length !== 1 ? "s" : ""} &mdash; Razorpay orders, discounts, and refunds.
          </p>
        </div>
      </div>
      <PaymentsClient payments={payments} />
    </div>
  );
}
