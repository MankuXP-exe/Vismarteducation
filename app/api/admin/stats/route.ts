import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const VPS_API = process.env.VPS_API_URL || "https://api.vismartlearningeducation.com";
const API_SECRET = process.env.VPS_API_SECRET || "random_secret_key_123";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dbStats = { students: 0, revenue: 0, batches: 0, liveToday: 0 };

    if (isSupabaseAdminConfigured) {
      const [students, payments, batches, liveToday] = await Promise.all([
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
        supabaseAdmin.from("payments").select("amount").eq("status", "success"),
        supabaseAdmin.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabaseAdmin.from("live_classes").select("id", { count: "exact", head: true }).gte("scheduled_at", today.toISOString()).lt("scheduled_at", tomorrow.toISOString()),
      ]);
      dbStats = {
        students: students.count ?? 0,
        revenue: (payments.data ?? []).reduce((sum, p) => sum + Number(p.amount || 0), 0),
        batches: batches.count ?? 0,
        liveToday: liveToday.count ?? 0,
      };
    }

    // Fetch VPS stats
    let vps = null;
    try {
      const res = await fetch(`${VPS_API}/system-stats`, {
        headers: { "x-api-secret": API_SECRET },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) vps = await res.json();
    } catch {
      // VPS unreachable - return DB stats only
    }

    return NextResponse.json({ ...dbStats, vps });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
