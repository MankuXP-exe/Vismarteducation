import Link from "next/link";
import { CalendarPlus, Upload, Users, Video, Zap } from "lucide-react";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getTeacherDashboardData() {
  if (!isSupabaseAdminConfigured) {
    return {
      batchCount: 0,
      studentCount: 0,
      upcomingCount: 0,
      lectureCount: 0,
      upcomingClasses: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [batches, students, upcoming, lectures, upcomingList] = await Promise.all([
    supabaseAdmin.from("batches").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabaseAdmin
      .from("live_classes")
      .select("id", { count: "exact", head: true })
      .in("status", ["scheduled", "live"])
      .gte("scheduled_at", today.toISOString()),
    supabaseAdmin.from("lectures").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabaseAdmin
      .from("live_classes")
      .select("id,title,scheduled_at,status")
      .in("status", ["scheduled", "live"])
      .gte("scheduled_at", today.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5),
  ]);

  return {
    batchCount: batches.count ?? 0,
    studentCount: students.count ?? 0,
    upcomingCount: upcoming.count ?? 0,
    lectureCount: lectures.count ?? 0,
    upcomingClasses: upcomingList.data ?? [],
  };
}

export default async function TeacherDashboardPage() {
  const data = await getTeacherDashboardData();
  const cards = [
    { label: "My Batches", value: data.batchCount },
    { label: "Total Students", value: data.studentCount },
    { label: "Upcoming Live Classes", value: data.upcomingCount },
    { label: "Lectures Uploaded", value: data.lectureCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher dashboard</h1>
        <p className="text-sm text-gray-500">Manage live classes, recordings, notes, and batches.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/teacher/live/start" className="rounded-lg border border-green-200 bg-green-50 p-5 hover:border-green-400">
          <Zap className="mb-3 h-6 w-6 text-green-600" />
          <h2 className="font-bold text-gray-900">Start instant live</h2>
          <p className="text-sm text-gray-500">Choose batch, subject, and go live immediately.</p>
        </Link>
        <Link href="/teacher/batches" className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
          <CalendarPlus className="mb-3 h-6 w-6 text-[#5c35d9]" />
          <h2 className="font-bold text-gray-900">Schedule Live Class</h2>
          <p className="text-sm text-gray-500">Choose a batch, then create a LiveKit room.</p>
        </Link>
        <Link href="/teacher/batches" className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
          <Upload className="mb-3 h-6 w-6 text-[#5c35d9]" />
          <h2 className="font-bold text-gray-900">Upload Lecture</h2>
          <p className="text-sm text-gray-500">Choose a batch, then store recordings on the VPS.</p>
        </Link>
        <Link href="/teacher/batches" className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
          <Video className="mb-3 h-6 w-6 text-[#5c35d9]" />
          <h2 className="font-bold text-gray-900">Open Live Room</h2>
          <p className="text-sm text-gray-500">Open a scheduled class from its batch link.</p>
        </Link>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-bold text-gray-900">Upcoming classes</h2>
        {data.upcomingClasses.length === 0 ? (
          <p className="border-t border-gray-100 py-4 text-sm text-gray-500">No live classes scheduled.</p>
        ) : (
          data.upcomingClasses.map((item) => (
            <Link
              key={item.id}
              href={`/teacher/live/${item.id}`}
              className="flex items-center justify-between border-t border-gray-100 py-3 text-sm hover:text-[#5c35d9]"
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-gray-500">{new Date(item.scheduled_at).toLocaleString("en-IN")}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
