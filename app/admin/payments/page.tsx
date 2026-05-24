import PaymentTable from "@/components/admin/PaymentTable";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500">Track Razorpay orders, discounts, and refunds.</p>
        </div>
        <button className="rounded-lg bg-[#5c35d9] px-4 py-2 text-sm font-semibold text-white">Export CSV</button>
      </div>
      <PaymentTable />
    </div>
  );
}
