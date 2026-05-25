import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const VPS_API = process.env.VPS_API_URL || "https://api.vismartlearningeducation.com";
const API_SECRET = process.env.VPS_API_SECRET || "random_secret_key_123";

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const batchId = form.get("batchId") as string;
    const title = form.get("title") as string;

    if (!file || !batchId || !title) {
      return NextResponse.json({ error: "file, batchId, and title required" }, { status: 400 });
    }

    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 500MB" }, { status: 400 });
    }

    const vpsForm = new FormData();
    vpsForm.append("file", file, file.name);
    vpsForm.append("batchId", batchId);
    vpsForm.append("title", title);
    const subjectId = form.get("subjectId") as string;
    const chapterId = form.get("chapterId") as string;
    if (subjectId) vpsForm.append("subjectId", subjectId);
    if (chapterId) vpsForm.append("chapterId", chapterId);
    vpsForm.append("teacherId", user.id);

    const res = await fetch(`${VPS_API}/upload/material`, {
      method: "POST",
      headers: { "x-api-secret": API_SECRET },
      body: vpsForm,
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error || "Upload failed" }, { status: res.status });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
