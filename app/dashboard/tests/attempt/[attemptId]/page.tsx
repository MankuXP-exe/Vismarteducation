"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Loader2, Flag } from "lucide-react";
import toast from "react-hot-toast";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
  question_order: number;
}

interface Test {
  id: string;
  title: string;
  duration_minutes: number;
  total_marks: number;
  negative_marking: number;
}

export default function TestAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    fetch(`/api/tests/attempt/results?attemptId=${attemptId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.attempts?.[0]) {
          const att = d.attempts[0];
          setTest(att.tests);
          setQuestions(d.questions || []);
          setAnswers(att.answers || {});
          setTimeLeft((att.tests?.duration_minutes || 60) * 60);
          startTimeRef.current = Date.now() - (att.time_taken_seconds || 0) * 1000;
          if (att.submitted_at) {
            setSubmitted(true);
            setResult({ score: att.score, totalMarks: att.total_marks, correct: att.correct_count, incorrect: att.incorrect_count, unanswered: att.unanswered_count, percentage: att.percentage, passed: att.passed });
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [attemptId]);

  // Timer
  useEffect(() => {
    if (submitted || loading) return;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, (test?.duration_minutes || 60) * 60 - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) handleSubmit();
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [test, submitted, loading]);

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const res = await fetch("/api/tests/attempt/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers, timeTakenSeconds: timeTaken }),
      });
      const data = await res.json();
      if (data.attempt) {
        setSubmitted(true);
        setResult(data.result);
        toast.success("Test submitted!");
      } else toast.error(data.error || "Failed to submit");
    } catch { toast.error("Something went wrong"); }
    setSubmitting(false);
  }, [attemptId, answers, submitting, submitted]);

  // Keyboard shortcut: submit on Ctrl+Enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSubmit]);

  // Warn before leaving
  useEffect(() => {
    if (submitted) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [submitted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const isUrgent = timeLeft < 120;

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-950"><div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" /></div>;

  // Results view
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700">
            {result.passed ? <CheckCircle size={40} className="text-white" /> : <XCircle size={40} className="text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{result.passed ? "Congratulations! 🎉" : "Better luck next time!"}</h1>
          <p className="text-gray-500">{test?.title}</p>
          <div className="my-6 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{result.percentage}%</p>
              <p className="text-xs text-gray-400">Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{result.score}/{result.totalMarks}</p>
              <p className="text-xs text-gray-400">Marks</p>
            </div>
          </div>
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-green-50 p-3 text-center">
              <p className="text-lg font-bold text-green-600">{result.correct}</p>
              <p className="text-xs text-green-500">Correct</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-center">
              <p className="text-lg font-bold text-red-600">{result.incorrect}</p>
              <p className="text-xs text-red-500">Wrong</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-lg font-bold text-gray-600">{result.unanswered}</p>
              <p className="text-xs text-gray-500">Skipped</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => router.push("/dashboard/tests")}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Back to Tests
            </button>
            <button onClick={() => window.location.reload()}
              className="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-medium text-white hover:bg-purple-700">
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => { if (confirm("Leave test?")) router.push("/dashboard/tests"); }} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-900">{test?.title}</p>
            <p className="text-[10px] text-gray-400">{answeredCount}/{totalQuestions} answered</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold ${isUrgent ? "bg-red-50 text-red-600 animate-pulse" : "bg-gray-50 text-gray-700"}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-40">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : "Submit"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-6">
          {questions.map((q, i) => (
            <div key={q.id} className={`mb-6 ${i === currentQ ? "" : "hidden"}`}>
              <p className="mb-1 text-xs text-gray-400">Question {i + 1} of {totalQuestions}</p>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">{q.question}</h2>
              <div className="space-y-3">
                {[{ k: "a", v: q.option_a }, { k: "b", v: q.option_b }, { k: "c", v: q.option_c }, { k: "d", v: q.option_d }].map((opt) => (
                  <button key={opt.k} onClick={() => setAnswers({...answers, [q.id]: opt.k})}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                      answers[q.id] === opt.k
                        ? "border-purple-300 bg-purple-50 text-purple-900"
                        : "border-gray-100 bg-white text-gray-700 hover:border-gray-200 hover:bg-gray-50"
                    }`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      answers[q.id] === opt.k ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}>{opt.k.toUpperCase()}</span>
                    <span className="text-sm">{opt.v}</span>
                  </button>
                ))}
              </div>
              {q.marks > 1 && <p className="mt-2 text-xs text-gray-400">({q.marks} marks)</p>}
            </div>
          ))}
        </div>

        {/* Question palette sidebar */}
        <div className="w-64 shrink-0 border-l border-gray-200 bg-gray-50 p-4 hidden md:block">
          <p className="mb-3 text-sm font-semibold text-gray-700">Question Palette</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const answered = answers[q.id];
              return (
                <button key={q.id} onClick={() => setCurrentQ(i)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    i === currentQ ? "ring-2 ring-purple-500 ring-offset-1" : ""
                  } ${answered ? "bg-purple-600 text-white" : "bg-white text-gray-500 border border-gray-200"}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-3 w-3 rounded bg-purple-600" /> Answered ({answeredCount})
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-3 w-3 rounded border border-gray-300 bg-white" /> Unanswered ({totalQuestions - answeredCount})
            </div>
          </div>
          {/* Navigation buttons */}
          <div className="mt-6 space-y-2">
            {currentQ > 0 && (
              <button onClick={() => setCurrentQ(currentQ - 1)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                ← Previous
              </button>
            )}
            {currentQ < totalQuestions - 1 && (
              <button onClick={() => setCurrentQ(currentQ + 1)}
                className="w-full rounded-xl bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700">
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 md:hidden">
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(currentQ - 1)} className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700">
            ← Prev
          </button>
        )}
        <span className="text-xs text-gray-400">Q{currentQ + 1}/{totalQuestions}</span>
        {currentQ < totalQuestions - 1 && (
          <button onClick={() => setCurrentQ(currentQ + 1)} className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-medium text-white">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
