"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type Props = {
  batchId: string;
  batchTitle: string;
  price: number;
  studentName: string;
  studentEmail: string;
  discountType?: string;
};

export default function RazorpayButton({
  batchId,
  batchTitle,
  price,
  studentName,
  studentEmail,
  discountType,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, discountType }),
      });
      const order = await orderRes.json();

      if (!orderRes.ok || order.error) {
        alert(order.error ?? "Unable to create payment order");
        setLoading(false);
        return;
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Vi Smart Learning Education",
        description: order.batchTitle || batchTitle,
        image: "/images/logo-transparentbg.png",
        order_id: order.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, batchId }),
          });
          const result = await verifyRes.json();

          if (result.success) {
            router.push(`/dashboard/batches?enrolled=${batchId}`);
            router.refresh();
          } else {
            alert(result.error ?? "Payment verification failed. Contact support.");
            setLoading(false);
          }
        },
        prefill: {
          name: studentName,
          email: studentEmail,
        },
        theme: { color: "#5c35d9" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-[#5c35d9] text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Processing..." : `Enroll Now - Rs. ${price.toLocaleString("en-IN")}`}
      </button>
    </>
  );
}
