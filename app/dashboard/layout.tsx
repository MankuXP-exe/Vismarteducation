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
      {/* Fixed Top Navbar */}
      <TopNavbar />

      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Scrollable Content */}
      <main
        style={{
          marginLeft: "200px",
          marginTop: "56px",
          minHeight: "calc(100vh - 56px)",
          padding: "32px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
