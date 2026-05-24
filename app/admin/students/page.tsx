import StudentTable from "@/components/admin/StudentTable";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getStudents() {
  if (!isSupabaseAdminConfigured) return [];

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id,full_name,email,phone,current_class,is_active")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  return (data ?? []).map((student) => ({
    id: student.id,
    name: student.full_name,
    email: student.email,
    phone: student.phone,
    currentClass: student.current_class,
    status: student.is_active === false ? "inactive" : "active",
  }));
}

export default async function AdminStudentsPage() {
  const students = await getStudents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">Registered student profiles.</p>
        </div>
      </div>
      <StudentTable students={students} />
    </div>
  );
}
