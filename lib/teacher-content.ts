import { supabaseAdmin } from "@/lib/supabase/admin";

function abbreviationFromName(name: string) {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 6)
      .toUpperCase() || "GEN"
  );
}

export async function ensureSubject(batchId: string, subjectId: string | null, subjectName: string | null) {
  if (subjectId) return subjectId;

  const name = subjectName?.trim() || "General";
  const { data: existing } = await supabaseAdmin
    .from("subjects")
    .select("id")
    .eq("batch_id", batchId)
    .ilike("name", name)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data, error } = await supabaseAdmin
    .from("subjects")
    .insert({
      batch_id: batchId,
      name,
      abbreviation: abbreviationFromName(name),
      sort_order: 0,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function ensureChapter(
  batchId: string,
  subjectId: string,
  chapterId: string | null,
  chapterTitle: string | null
) {
  if (chapterId) return chapterId;

  const title = chapterTitle?.trim() || "General";
  const { data: existing } = await supabaseAdmin
    .from("chapters")
    .select("id")
    .eq("batch_id", batchId)
    .eq("subject_id", subjectId)
    .ilike("title", title)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: maxChapter } = await supabaseAdmin
    .from("chapters")
    .select("chapter_number")
    .eq("batch_id", batchId)
    .eq("subject_id", subjectId)
    .order("chapter_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber = maxChapter?.chapter_number ? String(Number(maxChapter.chapter_number) + 1) : "1";

  const { data, error } = await supabaseAdmin
    .from("chapters")
    .insert({
      batch_id: batchId,
      subject_id: subjectId,
      chapter_number: nextNumber,
      title,
      sort_order: 0,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
