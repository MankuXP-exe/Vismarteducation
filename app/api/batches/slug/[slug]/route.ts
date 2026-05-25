import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { checkBatchAccess } from "@/lib/auth/batch-access";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!isSupabaseAdminConfigured) {
    return NextResponse.json({ batch: null });
  }

  const { data: batch, error } = await supabaseAdmin
    .from("batches")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!batch) {
    return NextResponse.json({ batch: null });
  }

  // Check access for authenticated users (students need enrollment)
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const access = await checkBatchAccess(user.id, batch.id, user);
    if (!access.allowed) {
      return NextResponse.json({ batch: null, accessDenied: true, reason: access.reason });
    }
  }

  return NextResponse.json({ batch });
}
