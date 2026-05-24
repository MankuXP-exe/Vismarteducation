const payments = [
  ["Aarav Sharma", "Class 12 Commerce", "Rs. 7,999", "none", "pay_demo_1", "Success"],
  ["Nisha Yadav", "Class 11 Science", "Rs. 3,999", "army", "pay_demo_2", "Success"],
  ["Rohit Kumar", "B.COM Accounts", "Rs. 5,999", "single_parent", "pay_demo_3", "Failed"],
];

export default function PaymentTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            {["Student", "Batch", "Amount", "Discount", "Razorpay ID", "Status"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {payments.map((row) => (
            <tr key={row[4]} className="border-t border-gray-100">
              {row.map((cell) => <td key={cell} className="px-4 py-3 text-gray-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
