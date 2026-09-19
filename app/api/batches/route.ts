import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { api } from "@/lib/api/client";
import { isVpsApiEnabled } from "@/lib/api/config";

export const dynamic = "force-dynamic";

export async function GET() {
  // If VPS API is enabled via feature flag, try it first
  if (isVpsApiEnabled()) {
    try {
      const { data, error } = await api.batches.list();
      if (!error && data?.batches && data.batches.length > 0) {
        return NextResponse.json({ batches: data.batches });
      }
    } catch {
      // On any network error, transparently fall back to Supabase
    }
  }

  // Supabase fallback (production default)
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ batches: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("batches")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ batches: data || [] });
}
