import TeacherSidebar from "@/components/teacher/TeacherSidebar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <TeacherSidebar />
      <main className="min-h-screen p-4 pt-16 lg:ml-60 lg:p-8 lg:pt-8">{children}</main>
    </div>
  );
}
