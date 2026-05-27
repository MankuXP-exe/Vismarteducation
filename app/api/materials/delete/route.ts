import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const VPS_API = process.env.VPS_API_URL || "https://api.vismartlearningeducation.com";
const API_SECRET = process.env.VPS_API_SECRET || "random_secret_key_123";

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { materialId } = await req.json();
    if (!materialId) return NextResponse.json({ error: "materialId required" }, { status: 400 });

    const { data: material } = await supabaseAdmin
      .from("study_materials")
      .select("file_path, file_url")
      .eq("id", materialId)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("study_materials").delete().eq("id", materialId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    if (material?.file_path) {
      fetch(`${VPS_API}/delete-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-secret": API_SECRET },
        body: JSON.stringify({ filePath: material.file_path }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
