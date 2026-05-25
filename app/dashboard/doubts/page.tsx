"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HelpCircle, Send, ArrowLeft, Loader2, CheckCircle, Clock, Bot, User, Image as ImageIcon } from "lucide-react";

interface Doubt {
  id: string;
  lecture_id: string | null;
  question: string;
  image_url: string | null;
  ai_answer: string | null;
  teacher_answer: string | null;
  status: string;
  created_at: string;
  lectures: { id: string; title: string } | null;
}

export default function DoubtsPage() {
  const router = useRouter();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDoubts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doubts");
      const data = await res.json();
      setDoubts(data.doubts || []);
    } catch { setDoubts([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDoubts(); }, [fetchDoubts]);

  const submitDoubt = async () => {
    if (!question.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/doubts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      if (data.doubt) {
        setDoubts((prev) => [data.doubt, ...prev]);
        setQuestion("");
      }
    } catch {}
    setSubmitting(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "answered_by_ai":
        return <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-medium text-blue-600"><Bot size={10} /> AI Answered</span>;
      case "answered_by_teacher":
        return <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-medium text-green-600"><CheckCircle size={10} /> Answered</span>;
      case "pending":
        return <span className="flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-[10px] font-medium text-yellow-600"><Clock size={10} /> Pending</span>;
      default:
        return <span className="rounded-full bg-gray-50 px-2.5 py-0.5 text-[10px] font-medium text-gray-500">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
              <HelpCircle size={24} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Doubts</h1>
              <p className="text-sm text-gray-500">{doubts.length} doubts asked</p>
            </div>
          </div>

          {/* Ask Doubt */}
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4">
            <form onSubmit={(e) => { e.preventDefault(); submitDoubt(); }} className="flex gap-3">
              <input
                type="text" placeholder="Ask a doubt..." value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-green-300 focus:bg-white"
              />
              <button type="submit" disabled={!question.trim() || submitting}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:opacity-40">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Ask
              </button>
            </form>
            <p className="mt-2 text-[10px] text-gray-400">AI answers instantly. Teachers can also respond.</p>
          </div>

          {/* Doubts List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />)}
            </div>
          ) : doubts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <HelpCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-900">No doubts yet</p>
              <p className="mt-1 text-sm text-gray-500">Ask a doubt above and get instant AI answers!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doubts.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <User size={14} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{d.question}</p>
                        {d.lectures?.title && (
                          <p className="mt-0.5 text-[10px] text-gray-400">From: {d.lectures.title}</p>
                        )}
                      </div>
                    </div>
                    {statusBadge(d.status)}
                  </div>

                  {/* AI Answer */}
                  {d.ai_answer && (
                    <div className="mb-2 flex gap-2.5 rounded-xl bg-blue-50 p-3">
                      <Bot size={16} className="mt-0.5 shrink-0 text-blue-500" />
                      <p className="text-xs leading-relaxed text-gray-700">{d.ai_answer}</p>
                    </div>
                  )}

                  {/* Teacher Answer */}
                  {d.teacher_answer && (
                    <div className="flex gap-2.5 rounded-xl bg-green-50 p-3">
                      <User size={16} className="mt-0.5 shrink-0 text-green-500" />
                      <p className="text-xs leading-relaxed text-gray-700">{d.teacher_answer}</p>
                    </div>
                  )}

                  <p className="mt-2 text-[10px] text-gray-400">
                    {new Date(d.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
