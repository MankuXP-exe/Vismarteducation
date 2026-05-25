import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <AdminSidebar />
      <main className="min-h-screen pt-16 md:ml-64 md:pt-0 md:p-8">{children}</main>
    </div>
  );
}
