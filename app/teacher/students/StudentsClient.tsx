"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  currentClass: string | null;
  isActive: boolean;
  createdAt: string;
};

type Enrollment = {
  studentId: string;
  batchId: string;
  batchTitle: string;
  status: string;
  enrolledAt: string;
};

const ITEMS_PER_PAGE = 20;

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
          : "bg-red-50 text-red-700 ring-1 ring-red-600/20"
      }`}
    >
      {active ? (
        <UserCheck className="h-3 w-3" />
      ) : (
        <UserX className="h-3 w-3" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function BatchTag({ title, status }: { title: string; status: string }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
        status === "active"
          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
          : "bg-gray-50 text-gray-600 ring-1 ring-gray-300"
      }`}
    >
      {title}
    </span>
  );
}

function StudentRow({
  student,
  enrollments,
  isExpanded,
  onToggle,
}: {
  student: Student;
  enrollments: Enrollment[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const studentEnrollments = enrollments.filter((e) => e.studentId === student.id);

  return (
    <>
      <tr
        className="border-t border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-xs font-bold text-white">
              {student.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{student.name || "Unnamed"}</p>
              <p className="text-xs text-gray-400">{student.email || "—"}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell">
          {student.email || "—"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 hidden lg:table-cell">
          {student.phone || "—"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 hidden lg:table-cell">
          {student.currentClass || "—"}
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {studentEnrollments.length === 0 ? (
              <span className="text-xs text-gray-400">None</span>
            ) : (
              studentEnrollments.slice(0, 2).map((e) => (
                <BatchTag key={e.batchId} title={e.batchTitle} status={e.status} />
              ))
            )}
            {studentEnrollments.length > 2 && (
              <span className="text-xs text-gray-400">+{studentEnrollments.length - 2}</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <StatusBadge active={student.isActive} />
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
          {student.createdAt
            ? new Date(student.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </td>
        <td className="px-4 py-3 text-gray-400">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </td>
      </tr>
      {isExpanded && studentEnrollments.length > 0 && (
        <tr className="bg-gray-50/80">
          <td colSpan={8} className="px-4 py-3">
            <div className="text-sm">
              <p className="font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-purple-500" />
                Enrollment Details
              </p>
              <div className="space-y-1.5">
                {studentEnrollments.map((e) => (
                  <div
                    key={e.batchId}
                    className="flex items-center justify-between rounded-md bg-white px-3 py-2 border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <BatchTag title={e.batchTitle} status={e.status} />
                      <span
                        className={`text-xs font-medium ${
                          e.status === "active" ? "text-blue-600" : "text-gray-500"
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {e.enrolledAt
                        ? new Date(e.enrolledAt).toLocaleDateString("en-IN")
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function MobileStudentCard({
  student,
  enrollments,
}: {
  student: Student;
  enrollments: Enrollment[];
}) {
  const [open, setOpen] = useState(false);
  const studentEnrollments = enrollments.filter((e) => e.studentId === student.id);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white">
            {student.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{student.name || "Unnamed"}</p>
            <p className="text-xs text-gray-500">{student.email || "—"}</p>
          </div>
        </div>
        <StatusBadge active={student.isActive} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
        {student.phone && (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-gray-400" />
            {student.phone}
          </span>
        )}
        {student.currentClass && (
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3 text-gray-400" />
            {student.currentClass}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          {student.createdAt
            ? new Date(student.createdAt).toLocaleDateString("en-IN")
            : "—"}
        </span>
      </div>
      {studentEnrollments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {studentEnrollments.map((e) => (
            <BatchTag key={e.batchId} title={e.batchTitle} status={e.status} />
          ))}
        </div>
      )}
      {studentEnrollments.length > 0 && (
        <button
          onClick={() => setOpen(!open)}
          className="mt-2 text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
        >
          {open ? "Hide details" : "Show details"}
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      )}
      {open && (
        <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
          {studentEnrollments.map((e) => (
            <div key={e.batchId} className="flex justify-between text-xs text-gray-600">
              <span>{e.batchTitle}</span>
              <span className="text-gray-400">{e.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StudentsClient({
  students,
  enrollments,
}: {
  students: Student[];
  enrollments: Enrollment[];
}) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const classes = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.currentClass) set.add(s.currentClass);
    });
    return Array.from(set).sort();
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter((s) => {
      if (q && !s.name?.toLowerCase().includes(q) && !s.email?.toLowerCase().includes(q) && !s.phone?.toLowerCase().includes(q)) {
        return false;
      }
      if (classFilter && s.currentClass !== classFilter) return false;
      return true;
    });
  }, [students, search, classFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-400 whitespace-nowrap">
          {filtered.length} of {students.length} students
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Email</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Phone</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Class</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Enrolled Batches</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 font-semibold w-8"></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No students match your search.
                  </td>
                </tr>
              ) : (
                paged.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    enrollments={enrollments}
                    isExpanded={expandedId === student.id}
                    onToggle={() => toggleExpand(student.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paged.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            No students match your search.
          </div>
        ) : (
          paged.map((student) => (
            <MobileStudentCard
              key={student.id}
              student={student}
              enrollments={enrollments}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 2, totalPages - 5));
              const p = start + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-purple-600 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
