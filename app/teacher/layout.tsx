import TeacherSidebar from "@/components/teacher/TeacherSidebar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <TeacherSidebar />
      <main className="ml-60 min-h-screen p-8">{children}</main>
    </div>
  );
}
