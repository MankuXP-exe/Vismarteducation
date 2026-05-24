import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <AdminSidebar />
      <main className="ml-60 min-h-screen p-8">{children}</main>
    </div>
  );
}
