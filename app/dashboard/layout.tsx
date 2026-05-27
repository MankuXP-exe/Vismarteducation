import type { Metadata } from "next";
import TopNavbar from "@/components/dashboard/TopNavbar";
import Sidebar from "@/components/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "Student Dashboard | Vi Smart Learning Education",
  description: "Access your enrolled batches, lectures, and study material.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#f7f8fc" }}>
      <TopNavbar />
      <Sidebar />
      <main
        className="min-h-[calc(100vh-56px)] overflow-x-hidden p-4 pt-[72px] lg:ml-[200px] lg:p-8 lg:pt-[72px]"
      >
        {children}
      </main>
    </div>
  );
}
