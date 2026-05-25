import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function checkAdminAccess() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role || user?.app_metadata?.role || user?.user_metadata?.role;
  if (role !== "teacher" && role !== "admin") return { error: "Teacher or admin access required", status: 403 };

  return null;
}

export async function GET() {
  const denied = await checkAdminAccess();
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });
  try {
    const { data, error } = await supabaseAdmin
      .from("batches")
      .select("id, title, slug, category, subjects")
      .order("title");

    if (error) throw error;

    const grouped: Record<string, { id: string; title: string; subjects: string[] }> = {};
    for (const batch of data ?? []) {
      grouped[batch.id] = {
        id: batch.id,
        title: batch.title,
        subjects: batch.subjects || [],
      };
    }

    return NextResponse.json({ success: true, batches: data, grouped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await checkAdminAccess();
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  try {
    const { batchId, name } = await req.json();
    if (!batchId || !name) {
      return NextResponse.json({ error: "batchId and name are required" }, { status: 400 });
    }

    const { data: batch, error: fetchError } = await supabaseAdmin
      .from("batches")
      .select("subjects")
      .eq("id", batchId)
      .single();

    if (fetchError) throw fetchError;

    const current: string[] = batch?.subjects || [];
    if (current.includes(name.trim())) {
      return NextResponse.json({ error: "Subject already exists in this batch" }, { status: 409 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("batches")
      .update({ subjects: [...current, name.trim()] })
      .eq("id", batchId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, subjects: [...current, name.trim()] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = await checkAdminAccess();
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  try {
    const { batchId, name } = await req.json();
    if (!batchId || !name) {
      return NextResponse.json({ error: "batchId and name are required" }, { status: 400 });
    }

    const { data: batch, error: fetchError } = await supabaseAdmin
      .from("batches")
      .select("subjects")
      .eq("id", batchId)
      .single();

    if (fetchError) throw fetchError;

    const current: string[] = batch?.subjects || [];
    const updated = current.filter((s) => s !== name.trim());

    const { error: updateError } = await supabaseAdmin
      .from("batches")
      .update({ subjects: updated })
      .eq("id", batchId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, subjects: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
