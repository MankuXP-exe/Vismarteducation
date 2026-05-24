import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
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
