import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { isVpsApiEnabled } from "@/lib/api/config";
import { api } from "@/lib/api/client";

export async function DELETE(req: Request) {
  try {
    if (isVpsApiEnabled()) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("vi_session")?.value;
        if (token) {
          const body = await req.clone().json().catch(() => ({}));
          const { bookmarkId } = body;
          if (!bookmarkId) {
            return NextResponse.json({ error: "bookmarkId required" }, { status: 400 });
          }
          const { error } = await api.bookmarks.remove(
            bookmarkId,
            { headers: { Cookie: `vi_session=${token}`, Authorization: `Bearer ${token}` } }
          );
          if (!error) {
            return NextResponse.json({ success: true });
          }
        }
      } catch {
        // Fallback to Supabase on failure
      }
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookmarkId } = await req.json();
    if (!bookmarkId) return NextResponse.json({ error: "bookmarkId required" }, { status: 400 });

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmarkId)
      .eq("user_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
