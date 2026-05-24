import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { batchId, discountType } = await req.json();
    const { data: batch } = await supabase
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .single();

    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    let finalPrice = Number(batch.price);
    let discountAmount = 0;

    if (discountType === "army") {
      discountAmount = finalPrice * (Number(batch.army_discount_percent ?? 0) / 100);
      finalPrice -= discountAmount;
    } else if (discountType === "disabled") {
      discountAmount = finalPrice * (Number(batch.disabled_discount_percent ?? 0) / 100);
      finalPrice -= discountAmount;
    } else if (discountType === "single_parent") {
      const flatPrice = Number(batch.single_parent_flat_price ?? finalPrice);
      discountAmount = finalPrice - flatPrice;
      finalPrice = flatPrice;
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(finalPrice * 100),
      currency: "INR",
      notes: {
        batchId,
        studentId: user.id,
        discountType: discountType || "none",
      },
    });

    await supabase.from("payments").insert({
      student_id: user.id,
      batch_id: batchId,
      razorpay_order_id: order.id,
      amount: finalPrice,
      original_amount: batch.price,
      discount_type: discountType || "none",
      discount_amount: discountAmount,
      status: "pending",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: Math.round(finalPrice * 100),
      currency: "INR",
      batchTitle: batch.title,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
