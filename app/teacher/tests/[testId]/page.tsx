"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  marks: number;
  question_order: number;
}

interface TestDetail {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
}

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;

  const [test, setTest] = useState<TestDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [newQ, setNewQ] = useState({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", explanation: "", marks: 1 });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/tests/questions?testId=${testId}`)
      .then((r) => r.json())
      .then((d) => { setTest(d.test); setQuestions(d.questions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [testId]);

  const addQuestion = async () => {
    if (!newQ.question) return;
    setAdding(true);
    const res = await fetch("/api/tests/questions/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, ...newQ }),
    });
    const data = await res.json();
    if (data.question) {
      setQuestions([...questions, data.question]);
      setNewQ({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", explanation: "", marks: 1 });
      toast.success("Question added");
    }
    setAdding(false);
  };

  const removeQuestion = async (qId: string) => {
    if (!confirm("Remove this question?")) return;
    await fetch("/api/tests/questions/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: qId, testId }),
    });
    setQuestions(questions.filter((q) => q.id !== qId));
    toast.success("Question removed");
  };

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" /></div>;

  return (
    <div className="max-w-4xl">
      <Link href="/teacher/tests" className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to tests
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{test?.title || "Test"}</h1>
          <p className="text-sm text-gray-500">{questions.length} questions · {test?.duration_minutes} min · {test?.total_marks} marks</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Users size={16} /> Attempts
          </button>
          <button className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <BarChart3 size={16} /> Analytics
          </button>
        </div>
      </div>

      {/* Add Question Form */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Add Question</h2>
        <div className="space-y-3">
          <input type="text" placeholder="Question" value={newQ.question} onChange={(e) => setNewQ({...newQ, question: e.target.value})}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-purple-300" />
          <div className="grid grid-cols-2 gap-3">
            {["A", "B", "C", "D"].map((opt) => (
              <input key={opt} type="text" placeholder={`Option ${opt}`} value={(newQ as any)[`option${opt}`] || ""}
                onChange={(e) => setNewQ({...newQ, [`option${opt}`]: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-purple-300" />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Correct:</label>
              <select value={newQ.correctOption} onChange={(e) => setNewQ({...newQ, correctOption: e.target.value})}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none">
                <option value="a">A</option>
                <option value="b">B</option>
                <option value="c">C</option>
                <option value="d">D</option>
              </select>
            </div>
            <input type="number" placeholder="Marks" value={newQ.marks} onChange={(e) => setNewQ({...newQ, marks: +e.target.value})}
              className="w-20 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none" />
            <input type="text" placeholder="Explanation" value={newQ.explanation} onChange={(e) => setNewQ({...newQ, explanation: e.target.value})}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-purple-300" />
            <button onClick={addQuestion} disabled={adding || !newQ.question}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-40">
              <Plus size={16} /> {adding ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((q, i) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
              <p className="font-medium text-gray-900">Q{i + 1}. {q.question}</p>
              <button onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[["a", q.option_a], ["b", q.option_b], ["c", q.option_c], ["d", q.option_d]].map(([opt, text]) => (
                <div key={opt as string} className={`rounded-lg px-3 py-2 text-sm ${opt === q.correct_option ? "bg-green-50 text-green-700 font-medium" : "bg-gray-50 text-gray-600"}`}>
                  {opt as string}) {text as string}
                  {opt === q.correct_option && " ✓"}
                </div>
              ))}
            </div>
            {q.explanation && <p className="text-xs text-gray-400">💡 {q.explanation}</p>}
            <p className="mt-1 text-[10px] text-gray-400">{q.marks} mark{q.marks > 1 ? "s" : ""}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
