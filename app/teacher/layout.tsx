import { redirect } from "next/navigation";
import { getEffectiveRole } from "@/lib/auth/roles";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/teacher");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = getEffectiveRole(user, profile);
  if (role !== "teacher" && role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <TeacherSidebar />
      <main className="min-h-screen overflow-x-hidden px-4 pt-16 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
