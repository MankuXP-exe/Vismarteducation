"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, FileText, Play, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Test {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
  created_at: string;
  subjects: { name: string } | null;
  test_questions: { count: number }[];
}

export default function TeacherTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tests/questions")
      .then((r) => r.json())
      .then((d) => { setTests(d.tests || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const togglePublish = async (testId: string, published: boolean) => {
    await fetch("/api/tests/publish", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, publish: !published }),
    });
    setTests((prev) => prev.map((t) => t.id === testId ? { ...t, is_published: !published } : t));
    toast.success(published ? "Test unpublished" : "Test published");
  };

  const deleteTest = async (testId: string) => {
    if (!confirm("Delete this test and all questions?")) return;
    await fetch("/api/tests/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId }),
    });
    setTests((prev) => prev.filter((t) => t.id !== testId));
    toast.success("Test deleted");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests</h1>
          <p className="text-sm text-gray-500">Create and manage tests for your batches</p>
        </div>
        <Link href="/teacher/tests/new"
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700">
          <Plus size={18} /> New Test
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />)}</div>
      ) : tests.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-900">No tests yet</p>
          <p className="text-sm text-gray-500">Create your first test to get started.</p>
          <Link href="/teacher/tests/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white">
            <Plus size={18} /> Create Test
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test, i) => (
            <motion.div key={test.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <FileText size={22} className="text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{test.title}</h3>
                  {test.is_published ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                      <CheckCircle size={10} /> Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-600">
                      <XCircle size={10} /> Draft
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {test.subjects?.name || "All subjects"} · {test.test_questions?.[0]?.count || 0} questions · {test.duration_minutes} min · {test.total_marks} marks
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePublish(test.id, test.is_published)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    test.is_published ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}>
                  {test.is_published ? "Unpublish" : "Publish"}
                </button>
                <Link href={`/teacher/tests/${test.id}`}
                  className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-100">
                  Manage
                </Link>
                <button onClick={() => deleteTest(test.id)}
                  className="rounded-lg bg-red-50 p-1.5 text-red-400 hover:bg-red-100 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
