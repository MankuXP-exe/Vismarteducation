type PaymentRow = {
  id: string;
  student: string;
  batch: string;
  amount: number;
  discount: string;
  razorpayId?: string | null;
  status: string;
};

export default function PaymentTable({ payments }: { payments: PaymentRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            {["Student", "Batch", "Amount", "Discount", "Razorpay ID", "Status"].map((heading) => (
              <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                No payments found.
              </td>
            </tr>
          ) : (
            payments.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-700">{row.student}</td>
                <td className="px-4 py-3 text-gray-700">{row.batch}</td>
                <td className="px-4 py-3 text-gray-700">Rs. {row.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-gray-700">{row.discount}</td>
                <td className="px-4 py-3 text-gray-700">{row.razorpayId || "-"}</td>
                <td className="px-4 py-3 text-gray-700">{row.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
