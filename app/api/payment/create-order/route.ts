import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getRazorpay } from "@/lib/razorpay";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { batchId, discountType } = body;

    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const headers = { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` };
          const payload: any = { batch_id: batchId };
          if (discountType) payload.discount_type = discountType;

          const { data, error } = await apiFetch("/payments/create-order", {
            method: "POST",
            body: JSON.stringify(payload),
            headers,
          });

          if (!error && data) {
            return NextResponse.json({
              orderId: data.orderId,
              amount: data.amount,
              currency: data.currency,
              batchTitle: data.batch?.title || "Batch",
              keyId: data.keyId,
              hasConcession: (data.discountAmount || 0) > 0,
            });
          }
        }
      } catch {
        // Fallback to Supabase on failure
      }
    }

    const supabase = await createRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: batch } = await supabaseAdmin
      ['from']("batches")
      .select("*")
      .eq("id", batchId)
      .single();

    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const actualBatchId = batch.id;

    let finalPrice = Number(batch.price);
    let discountAmount = 0;
    let appliedConcessionId: string | null = null;

    // Check for approved concession if no explicit discount type is provided
    if (!discountType) {
      const { data: concession } = await supabaseAdmin
        ['from']("concession_requests")
        .select("id, concession_type, discount_percent, discount_amount")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .eq("is_active", true)
        .maybeSingle();

      if (concession) {
        appliedConcessionId = concession.id;
        if (concession.discount_percent) {
          discountAmount = Math.round(finalPrice * (concession.discount_percent / 100));
          finalPrice -= discountAmount;
        } else if (concession.discount_amount) {
          discountAmount = concession.discount_amount;
          finalPrice -= discountAmount;
        }
      }
    } else if (discountType === "army") {
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

    finalPrice = Math.max(0, finalPrice);

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(finalPrice * 100),
      currency: "INR",
      notes: {
        batchId: actualBatchId,
        studentId: user.id,
        discountType: discountType || "none",
        concessionId: appliedConcessionId || "",
      },
    });

    const paymentInsert: any = {
      student_id: user.id,
      batch_id: actualBatchId,
      razorpay_order_id: order.id,
      amount: finalPrice,
      original_amount: batch.price,
      discount_type: discountType || "none",
      discount_amount: discountAmount,
      status: "pending",
    };

    if (appliedConcessionId) {
      paymentInsert.concession_id = appliedConcessionId;
    }

    await supabaseAdmin['from']("payments").insert(paymentInsert);

    return NextResponse.json({
      orderId: order.id,
      amount: Math.round(finalPrice * 100),
      currency: "INR",
      batchTitle: batch.title,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      hasConcession: !!appliedConcessionId,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Ensure apiFetch works if it's imported locally for the proxy
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { API_BASE_URL } = await import("@/lib/api/config");
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options.headers } });
  if (!res.ok) throw new Error("API Error");
  return { data: await res.json(), error: null };
}
