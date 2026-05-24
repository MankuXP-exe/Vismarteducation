type StudentRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  currentClass?: string | null;
  status: string;
};

export default function StudentTable({ students }: { students: StudentRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            {["Name", "Email", "Phone", "Class", "Status"].map((heading) => (
              <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                No students found.
              </td>
            </tr>
          ) : (
            students.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                <td className="px-4 py-3 text-gray-700">{row.email}</td>
                <td className="px-4 py-3 text-gray-700">{row.phone || "-"}</td>
                <td className="px-4 py-3 text-gray-700">{row.currentClass || "-"}</td>
                <td className="px-4 py-3 text-gray-700">{row.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
