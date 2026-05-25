import TeacherSidebar from "@/components/teacher/TeacherSidebar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <TeacherSidebar />
      <main className="min-h-screen md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
