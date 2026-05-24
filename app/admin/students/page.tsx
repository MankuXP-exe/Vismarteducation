import StudentTable from "@/components/admin/StudentTable";

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">Search, filter, suspend, and reset access.</p>
        </div>
        <input placeholder="Search students..." className="rounded-lg border border-gray-300 px-4 py-2 text-sm" />
      </div>
      <StudentTable />
    </div>
  );
}
