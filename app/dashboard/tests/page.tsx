"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Clock, Trophy, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Test {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  total_marks: number;
  negative_marking: number;
  pass_percentage: number;
  subjects: { name: string } | null;
  test_questions: { count: number }[];
}

interface Attempt {
  id: string;
  test_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  passed: boolean;
  submitted_at: string;
}

export default function StudentTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/tests").then((r) => r.json()),
      fetch("/api/tests/attempt/my").then((r) => r.json()),
    ]).then(([tData, aData]) => {
      setTests(tData.tests || []);
      setAttempts(aData.attempts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const startTest = async (testId: string) => {
    setStarting(testId);
    try {
      const res = await fetch("/api/tests/attempt/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });
      const data = await res.json();
      if (data.attempt) {
        window.location.href = `/dashboard/tests/attempt/${data.attempt.id}`;
      } else {
        toast.error(data.error || "Failed to start");
      }
    } catch { toast.error("Something went wrong"); }
    setStarting(null);
  };

  const getAttempt = (testId: string) => attempts.find((a) => a.test_id === testId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100">
              <FileText size={24} className="text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Tests</h1>
              <p className="text-sm text-gray-500">{tests.length} tests available</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}</div>
          ) : tests.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-900">No tests yet</p>
              <p className="text-sm text-gray-500">Tests will appear here when your teachers publish them.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((test, i) => {
                const attempt = getAttempt(test.id);
                return (
                  <motion.div key={test.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-purple-50">
                        <FileText size={24} className="text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{test.title}</h3>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {test.subjects?.name || "General"} · {test.test_questions?.[0]?.count || 0} questions · {test.duration_minutes} min · {test.total_marks} marks
                          {test.negative_marking > 0 && ` · -${test.negative_marking} for wrong`}
                        </p>
                        {attempt?.submitted_at && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${attempt.passed ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                              {attempt.passed ? "✅ Passed" : "❌ Failed"} · {attempt.percentage}%
                            </div>
                            <span className="text-[10px] text-gray-400">{attempt.score}/{attempt.total_marks} marks</span>
                          </div>
                        )}
                      </div>
                      <button onClick={() => startTest(test.id)} disabled={starting === test.id}
                        className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-40 sm:w-auto">
                        {starting === test.id ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />}
                        {attempt?.submitted_at ? "Retry" : attempt ? "Resume" : "Start"}
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
