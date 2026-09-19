import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isVpsApiEnabled, API_BASE_URL } from "@/lib/api/config";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (isVpsApiEnabled()) {
    try {
      // Forward the webhook securely to VPS Fastify API
      const res = await fetch(`${API_BASE_URL}/payments/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": signature,
        },
        body,
      });
      if (res.ok) {
        return NextResponse.json({ received: true });
      }
    } catch {
      // Fallback
    }
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (secret && expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  if (event.event === "payment.failed") {
    await supabaseAdmin
      .from("payments")
      .update({ status: "failed", failure_reason: event.payload?.payment?.entity?.error_description })
      .eq("razorpay_payment_id", event.payload?.payment?.entity?.id);
  }

  return NextResponse.json({ received: true });
}
