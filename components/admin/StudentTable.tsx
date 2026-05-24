const students = [
  ["Aarav Sharma", "aarav@example.com", "9876543210", "12 Commerce", "Active"],
  ["Nisha Yadav", "nisha@example.com", "9876501234", "11 Science", "Active"],
  ["Rohit Kumar", "rohit@example.com", "9876512345", "B.COM", "Suspended"],
];

export default function StudentTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            {["Name", "Email", "Phone", "Class", "Status"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {students.map((row) => (
            <tr key={row[1]} className="border-t border-gray-100">
              {row.map((cell) => <td key={cell} className="px-4 py-3 text-gray-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
