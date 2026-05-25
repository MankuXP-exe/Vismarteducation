"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Batch { id: string; title: string; }
interface Subject { id: string; name: string; }

export default function NewTestPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [form, setForm] = useState({
    batchId: "", subjectId: "", title: "", description: "",
    durationMinutes: 60, totalMarks: 0, negativeMarking: 0, passPercentage: 40,
  });

  useEffect(() => {
    fetch("/api/batches").then(r => r.json()).then(d => setBatches(d.batches || [])).catch(() => {});
    fetch("/api/subjects").then(r => r.json()).then(d => setSubjects(d.subjects || [])).catch(() => {});
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", explanation: "", marks: 1 }]);
  };

  const updateQuestion = (i: number, field: string, value: any) => {
    const qs = [...questions]; (qs[i] as any)[field] = value;
    setQuestions(qs);
  };

  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));

  const createTest = async () => {
    if (!form.batchId || !form.title) { toast.error("Batch and title required"); return; }
    if (questions.length === 0) { toast.error("Add at least one question"); return; }

    const res = await fetch("/api/tests/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }

    // Add questions
    for (const q of questions) {
      await fetch("/api/tests/questions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: data.test.id, ...q }),
      }).catch(() => {});
    }

    toast.success("Test created!");
    router.push("/teacher/tests");
  };

  return (
    <div className="max-w-3xl">
      <Link href="/teacher/tests" className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Back to tests
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Test</h1>

      {/* Test Details */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Test Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
            <select value={form.batchId} onChange={(e) => setForm({...form, batchId: e.target.value})}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-300">
              <option value="">Select batch...</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={form.subjectId} onChange={(e) => setForm({...form, subjectId: e.target.value})}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-300">
              <option value="">All subjects</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-300" placeholder="e.g. Chapter 1 Mock Test" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-300" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input type="number" value={form.durationMinutes} onChange={(e) => setForm({...form, durationMinutes: +e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Negative Marking</label>
            <input type="number" step="0.25" value={form.negativeMarking} onChange={(e) => setForm({...form, negativeMarking: +e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pass %</label>
            <input type="number" value={form.passPercentage} onChange={(e) => setForm({...form, passPercentage: +e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-purple-300" />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Questions ({questions.length})</h2>
          <button onClick={addQuestion} className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
            <Plus size={16} /> Add
          </button>
        </div>

        {questions.length === 0 ? (
          <p className="text-sm text-gray-400">Click "Add" to create your first question.</p>
        ) : (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Q{i + 1}</span>
                  <button onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
                <input type="text" placeholder="Question text" value={q.question} onChange={(e) => updateQuestion(i, "question", e.target.value)}
                  className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-300" />
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">{opt})</span>
                      <input type="text" placeholder={`Option ${opt}`} value={(q as any)[`option${opt}`] || ""}
                        onChange={(e) => updateQuestion(i, `option${opt}`, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-300" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Correct:</label>
                    <select value={q.correctOption} onChange={(e) => updateQuestion(i, "correctOption", e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none">
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Marks:</label>
                    <input type="number" value={q.marks} onChange={(e) => updateQuestion(i, "marks", +e.target.value)}
                      className="w-16 rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none" />
                  </div>
                  <input type="text" placeholder="Explanation (optional)" value={q.explanation} onChange={(e) => updateQuestion(i, "explanation", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-purple-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={createTest}
        className="w-full rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700">
        Create Test ({questions.length} questions)
      </button>
    </div>
  );
}
