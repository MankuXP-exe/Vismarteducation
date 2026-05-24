import PaymentTable from "@/components/admin/PaymentTable";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getPayments() {
  if (!isSupabaseAdminConfigured) return [];

  const { data } = await supabaseAdmin
    .from("payments")
    .select("id,amount,discount_type,razorpay_payment_id,status,student:profiles!student_id(full_name,email),batch:batches(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((payment: any) => ({
    id: payment.id,
    student: payment.student?.full_name || payment.student?.email || "-",
    batch: payment.batch?.title || "-",
    amount: Number(payment.amount || 0),
    discount: payment.discount_type || "none",
    razorpayId: payment.razorpay_payment_id,
    status: payment.status,
  }));
}

export default async function AdminPaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">Track Razorpay orders, discounts, and refunds.</p>
        </div>
      </div>
      <PaymentTable payments={payments} />
    </div>
  );
}
