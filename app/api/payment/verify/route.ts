import { NextResponse } from "next/server";
import crypto from "crypto";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, batchId } =
      await req.json();

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const { data: batch } = await supabaseAdmin
      .from("batches")
      .select("duration_months, title")
      .eq("id", batchId)
      .single();

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("amount, discount_type, discount_amount")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    const accessEndDate = new Date();
    accessEndDate.setMonth(accessEndDate.getMonth() + Number(batch?.duration_months || 12));

    await supabaseAdmin
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "success",
        paid_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id);

    const { data: enrollment, error } = await supabaseAdmin
      .from("enrollments")
      .upsert(
        {
          student_id: user.id,
          batch_id: batchId,
          payment_id: razorpay_payment_id,
          payment_order_id: razorpay_order_id,
          amount_paid: payment?.amount ?? 0,
          discount_applied: payment?.discount_type ?? "none",
          discount_amount: payment?.discount_amount ?? 0,
          status: "active",
          access_start_date: new Date().toISOString(),
          access_end_date: accessEndDate.toISOString(),
        },
        { onConflict: "student_id,batch_id" }
      )
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: "Enrollment successful",
      message: `You are now enrolled in ${batch?.title ?? "your batch"}. Start learning now.`,
      type: "success",
      action_url: `/dashboard/batches/${batchId}`,
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
