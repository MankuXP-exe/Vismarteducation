import { createClient } from "./client";

// ═══════════════════════════════════════════════════════════════════
// Vi Smart Learning Education — Supabase Query Helpers
// For use in client components ("use client")
// ═══════════════════════════════════════════════════════════════════

// ── AUTH ──────────────────────────────────────────────────────────

export async function signUpStudent({
  email,
  password,
  fullName,
  phone,
  currentClass,
}: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  currentClass?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        role: "student",
        current_class: currentClass,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ── PROFILE ──────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

export async function updateProfile(
  userId: string,
  updates: Partial<{
    full_name: string;
    phone: string;
    current_class: string;
    school_name: string;
    city: string;
    avatar_url: string;
  }>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  return { data, error };
}

// ── BATCHES ──────────────────────────────────────────────────────

export async function getAllBatches(category?: string) {
  const supabase = createClient();
  let query = supabase
    .from("batches")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getBatchBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("batches")
    .select(
      `
      *,
      subjects(*),
      teacher:profiles!teacher_id(full_name, avatar_url)
    `
    )
    .eq("slug", slug)
    .single();
  return { data, error };
}

// ── ENROLLMENTS ──────────────────────────────────────────────────

export async function getStudentEnrollments(studentId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      batch:batches(
        id, title, subtitle, slug,
        thumbnail_url, category,
        subjects, language,
        has_live_classes, has_recorded_lectures
      )
    `
    )
    .eq("student_id", studentId)
    .order("enrolled_at", { ascending: false });
  return { data, error };
}

export async function checkEnrollment(
  studentId: string,
  batchId: string
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, status, access_end_date, completion_percent")
    .eq("student_id", studentId)
    .eq("batch_id", batchId)
    .single();
  return { data, error };
}

// ── SUBJECTS & CHAPTERS ──────────────────────────────────────────

export async function getBatchSubjects(batchId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("batch_id", batchId)
    .eq("is_active", true)
    .order("sort_order");
  return { data, error };
}

export async function getSubjectChapters(subjectId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("is_active", true)
    .order("sort_order");
  return { data, error };
}

// ── LECTURES ─────────────────────────────────────────────────────

export async function getChapterLectures(chapterId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lectures")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("is_active", true)
    .order("sort_order");
  return { data, error };
}

export async function getLecture(lectureId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lectures")
    .select(
      `
      *,
      chapter:chapters(chapter_number, title),
      subject:subjects(name, abbreviation)
    `
    )
    .eq("id", lectureId)
    .single();
  return { data, error };
}

// ── PROGRESS ─────────────────────────────────────────────────────

export async function updateLectureProgress({
  studentId,
  lectureId,
  batchId,
  watchedSeconds,
  totalSeconds,
  lastPosition,
}: {
  studentId: string;
  lectureId: string;
  batchId: string;
  watchedSeconds: number;
  totalSeconds: number;
  lastPosition: number;
}) {
  const supabase = createClient();
  const completionPercent =
    totalSeconds > 0
      ? Math.round((watchedSeconds / totalSeconds) * 100)
      : 0;

  const isCompleted = completionPercent >= 90;

  const { data, error } = await supabase.from("lecture_progress").upsert(
    {
      student_id: studentId,
      lecture_id: lectureId,
      batch_id: batchId,
      watched_seconds: watchedSeconds,
      total_seconds: totalSeconds,
      completion_percent: completionPercent,
      is_completed: isCompleted,
      last_position_seconds: lastPosition,
      last_watched_at: new Date().toISOString(),
      ...(isCompleted && {
        completed_at: new Date().toISOString(),
      }),
    },
    {
      onConflict: "student_id,lecture_id",
    }
  );
  return { data, error };
}

export async function getStudentProgress(
  studentId: string,
  batchId: string
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lecture_progress")
    .select(
      `
      *,
      lecture:lectures(
        title, duration_label,
        cloudflare_thumbnail_url,
        chapter:chapters(title),
        subject:subjects(name)
      )
    `
    )
    .eq("student_id", studentId)
    .eq("batch_id", batchId)
    .order("last_watched_at", { ascending: false });
  return { data, error };
}

// ── STUDY MATERIALS ──────────────────────────────────────────────

export async function getChapterMaterials(
  chapterId: string,
  type?: string
) {
  const supabase = createClient();
  let query = supabase
    .from("study_materials")
    .select("*")
    .eq("chapter_id", chapterId)
    .eq("is_active", true)
    .order("sort_order");

  if (type) {
    query = query.eq("material_type", type);
  }

  const { data, error } = await query;
  return { data, error };
}

// ── LIVE CLASSES ─────────────────────────────────────────────────

export async function getUpcomingLiveClasses(batchId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("live_classes")
    .select(
      `
      *,
      subject:subjects(name),
      teacher:profiles!teacher_id(full_name)
    `
    )
    .eq("batch_id", batchId)
    .in("status", ["scheduled", "live"])
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at");
  return { data, error };
}

// ── DOUBTS ───────────────────────────────────────────────────────

export async function askDoubt({
  studentId,
  lectureId,
  batchId,
  subjectId,
  question,
}: {
  studentId: string;
  lectureId?: string;
  batchId: string;
  subjectId?: string;
  question: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doubts")
    .insert({
      student_id: studentId,
      lecture_id: lectureId,
      batch_id: batchId,
      subject_id: subjectId,
      question,
    })
    .select()
    .single();
  return { data, error };
}

export async function getStudentDoubts(studentId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("doubts")
    .select(
      `
      *,
      lecture:lectures(title),
      subject:subjects(name)
    `
    )
    .eq("student_id", studentId)
    .order("asked_at", { ascending: false });
  return { data, error };
}

// ── BOOKMARKS ────────────────────────────────────────────────────

export async function toggleBookmark({
  studentId,
  lectureId,
  materialId,
  type,
}: {
  studentId: string;
  lectureId?: string;
  materialId?: string;
  type: "lecture" | "material";
}) {
  const supabase = createClient();

  // Check if bookmark already exists
  let query = supabase
    .from("bookmarks")
    .select("id")
    .eq("student_id", studentId);

  if (type === "lecture" && lectureId) {
    query = query.eq("lecture_id", lectureId);
  } else if (type === "material" && materialId) {
    query = query.eq("material_id", materialId);
  }

  const existing = await query.single();

  if (existing.data) {
    // Remove bookmark
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.data.id);
    return { bookmarked: false, error };
  } else {
    // Add bookmark
    const { error } = await supabase.from("bookmarks").insert({
      student_id: studentId,
      lecture_id: lectureId,
      material_id: materialId,
      bookmark_type: type,
    });
    return { bookmarked: true, error };
  }
}

export async function getStudentBookmarks(studentId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      `
      *,
      lecture:lectures(
        title, duration_label,
        cloudflare_thumbnail_url,
        chapter:chapters(title)
      ),
      material:study_materials(
        title, material_type, file_url
      )
    `
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// ── NOTIFICATIONS ────────────────────────────────────────────────

export async function getNotifications(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return { data, error };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId);
  return { error };
}
