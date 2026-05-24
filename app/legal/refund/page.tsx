import { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Refund Policy | Vi Smart Learning Education",
  description: "Our refund and cancellation policy. Pass Nahi Toh Fees Nahi — understand our pass guarantee.",
  robots: { index: false, follow: false },
};

const sections = [
  { id: "pass-guarantee", title: "1. Our Commitment" },
  { id: "standard-refund", title: "2. Standard Refund Policy" },
  { id: "cancellation", title: "3. Cancellation Policy" },
  { id: "failed-payments", title: "4. Failed / Duplicate Payments" },
  { id: "discount-refunds", title: "5. Special Discount Refunds" },
  { id: "batch-transfer", title: "6. Batch Transfer Policy" },
  { id: "contact-claims", title: "7. How to Contact for Refund Claims" },
];

export default function RefundPage() {
  return (
    <>
      {/* Prominent Red Banner */}
      <div className="bg-red-600 text-white py-3 px-4 text-center sticky top-20 z-40 shadow-md">
        <p className="font-bold text-sm md:text-base flex items-center justify-center gap-2">
          <span className="text-xl">⚠️</span> Please read this policy carefully before making any purchase.
        </p>
      </div>

      <LegalLayout
        title="Refund & Cancellation Policy"
        lastUpdated="June 1, 2025"
        sections={sections}
      >
        <section id="pass-guarantee">
          <h2>1. OUR COMMITMENT — "PASS NAHI TOH FEES NAHI"</h2>
          <p>
            Vi Smart Learning Education stands by the quality of our education. We offer a unique Pass Guarantee:
          </p>
          
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 p-6 rounded-xl my-6 shadow-sm">
            <p className="font-bold text-lg mb-0 leading-relaxed">
              If a student completes all live classes, submits all assignments, appears in all internal tests, and still does not pass their board examination — we will refund the course fee in full. This applies to Class 10th and Class 12th board exam batches only.
            </p>
          </div>
          
          <p><strong>Conditions for Pass Guarantee Refund:</strong></p>
          <ul className="list-none pl-0 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✅</span> 
              <span>Student attended minimum 90% of live classes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✅</span> 
              <span>All assignments submitted on time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✅</span> 
              <span>All internal tests attempted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✅</span> 
              <span>Board exam appeared and result card submitted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✅</span> 
              <span>Refund claim filed within 30 days of result declaration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✅</span> 
              <span>Applies only to annual batches (not short courses)</span>
            </li>
          </ul>
        </section>

        <section id="standard-refund" className="mt-12">
          <h2>2. STANDARD REFUND POLICY</h2>
          <p className="text-2xl font-black text-red-600 mb-2">
            FEES ONCE PAID ARE NON-REFUNDABLE
          </p>
          <p className="font-medium text-gray-700">
            Except under the Pass Guarantee conditions above, all fees paid to Vi Smart Learning Education are strictly non-refundable. This includes:
          </p>
          
          <ul className="list-none pl-0 space-y-2 mt-4 text-gray-600">
            <li className="flex items-center gap-2"><span className="text-red-500">❌</span> Change of mind after enrollment</li>
            <li className="flex items-center gap-2"><span className="text-red-500">❌</span> Student unable to attend classes</li>
            <li className="flex items-center gap-2"><span className="text-red-500">❌</span> Technical issues on student's device/internet</li>
            <li className="flex items-center gap-2"><span className="text-red-500">❌</span> Partial completion of batch</li>
            <li className="flex items-center gap-2"><span className="text-red-500">❌</span> Switching to a different batch</li>
            <li className="flex items-center gap-2"><span className="text-red-500">❌</span> Relocation or personal circumstances</li>
            <li className="flex items-center gap-2"><span className="text-red-500">❌</span> Dissatisfaction after accessing content</li>
            <li className="flex items-center gap-2"><span className="text-red-500">❌</span> Accounting and computer short courses</li>
          </ul>
        </section>

        <section id="cancellation">
          <h2>3. CANCELLATION POLICY</h2>
          <ul>
            <li>No cancellation is accepted after payment is processed</li>
            <li>Batch access will be activated within 24 hours of payment</li>
            <li>Once access is granted, no cancellation is possible</li>
            <li>If payment is deducted but access not granted within 48 hours, contact us immediately for resolution</li>
          </ul>
        </section>

        <section id="failed-payments">
          <h2>4. FAILED / DUPLICATE PAYMENTS</h2>
          <p>If your payment was deducted but you did not receive access, or if payment was deducted twice:</p>
          <ul>
            <li>Contact us within 7 days: 9821233879</li>
            <li>Share payment screenshot and transaction ID</li>
            <li>Duplicate payments will be refunded within 7 working days</li>
            <li>Failed payment refunds processed by bank in 5-7 days</li>
          </ul>
        </section>

        <section id="discount-refunds">
          <h2>5. SPECIAL DISCOUNT REFUNDS</h2>
          <ul>
            <li>Discounts (Army/Disabled/Single Parent) once applied cannot be reversed</li>
            <li>If documents submitted for discount are found fraudulent, the full fee difference will be recovered</li>
            <li>No refund of any kind for fraudulent discount claims</li>
          </ul>
        </section>

        <section id="batch-transfer">
          <h2>6. BATCH TRANSFER POLICY</h2>
          <ul>
            <li>Fee is non-transferable to another student</li>
            <li>In exceptional cases, batch transfer (same student, different batch of equal value) may be considered within 7 days of enrollment</li>
            <li>Batch transfer requests: 9821233879</li>
            <li>Transfer is at management's sole discretion</li>
          </ul>
        </section>

        <section id="contact-claims">
          <h2>7. HOW TO CONTACT FOR REFUND CLAIMS</h2>
          <p><strong>For Pass Guarantee refund claims only:</strong></p>
          <ul className="list-none pl-0 mb-6">
            <li>📞 Call: 9821233879</li>
            <li>📧 Email: support@vismart.edu.in</li>
            <li>📍 Visit: Garhi Harsaru, Near PNB, Gurugram</li>
          </ul>
          
          <p><strong>Required documents:</strong></p>
          <ul>
            <li>Enrollment receipt</li>
            <li>Attendance records (from platform)</li>
            <li>Board exam admit card</li>
            <li>Board exam result marksheet</li>
            <li>Bank account details for refund</li>
          </ul>
        </section>
      </LegalLayout>
    </>
  );
}
