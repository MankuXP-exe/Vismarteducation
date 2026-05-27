import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import StudentsClient from "./StudentsClient";

export const dynamic = "force-dynamic";

async function getStudents() {
  if (!isSupabaseAdminConfigured) return { students: [], enrollments: [] };

  const [studentsRes, enrollmentsRes] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, phone, role, is_active, created_at, current_class")
      .eq("role", "student")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("enrollments")
      .select("student_id, batch_id, status, enrolled_at, batches!inner(title)")
      .in("status", ["active", "completed"]),
  ]);

  return {
    students: (studentsRes.data ?? []).map((s) => ({
      id: s.id,
      name: s.full_name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      currentClass: s.current_class,
      isActive: s.is_active !== false,
      createdAt: s.created_at,
    })),
    enrollments: (enrollmentsRes.data ?? []).map((e: any) => ({
      studentId: e.student_id,
      batchId: e.batch_id,
      batchTitle: e.batches?.title || "Unknown",
      status: e.status,
      enrolledAt: e.enrolled_at,
    })),
  };
}

export default async function TeacherStudentsPage() {
  const { students, enrollments } = await getStudents();

  return (
    <div className="space-y-4">
      <Link href="/teacher" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">
            {students.length} registered student{students.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <StudentsClient students={students} enrollments={enrollments} />
    </div>
  );
}
