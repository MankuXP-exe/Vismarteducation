"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import toast from "react-hot-toast";
import { BookOpen, Plus, X, Loader2, Search } from "lucide-react";

type Batch = { id: string; title: string };
type Subject = { id: string; name: string; batch_id: string };
type Chapter = { id: string; title: string; chapter_number: string | null; is_active: boolean };

export default function TeacherChaptersPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isSupabaseAdminConfigured) { setLoading(false); return; }
    loadBatches();
  }, []);

  async function loadBatches() {
    const { data } = await supabaseAdmin.from("batches").select("id, title").order("title");
    if (data) setBatches(data);
    setLoading(false);
  }

  async function loadSubjects(batchId: string) {
    const { data } = await supabaseAdmin
      .from("subjects")
      .select("id, name, batch_id")
      .eq("batch_id", batchId)
      .eq("is_active", true)
      .order("name");
    setSubjects(data || []);
  }

  async function loadChapters(subjectId: string) {
    if (!selectedBatch || !subjectId) return;
    const { data } = await supabaseAdmin
      .from("chapters")
      .select("id, title, chapter_number, is_active")
      .eq("batch_id", selectedBatch)
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .order("chapter_number");
    setChapters(data || []);
  }

  useEffect(() => {
    if (selectedBatch) loadSubjects(selectedBatch);
    else setSubjects([]);
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedSubject) loadChapters(selectedSubject);
    else setChapters([]);
  }, [selectedSubject]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !selectedSubject) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: selectedBatch, subjectId: selectedSubject, title: newTitle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Chapter "${newTitle.trim()}" added`);
      setNewTitle("");
      loadChapters(selectedSubject);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(chapterId: string, title: string) {
    if (!confirm(`Delete chapter "${title}"?`)) return;
    try {
      const res = await fetch("/api/admin/chapters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Chapter deleted");
      loadChapters(selectedSubject);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const filtered = chapters.filter((c) =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chapters</h1>
        <p className="text-sm text-gray-500">Manage chapters across subjects and batches.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => { setSelectedBatch(e.target.value); setSelectedSubject(""); }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            <option value="">Select batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedBatch}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white disabled:opacity-50"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
          <Search className="absolute left-3 top-9 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chapters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm"
          />
        </div>
      </div>

      {!selectedSubject ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p className="text-sm">Select a batch and subject to view chapters.</p>
        </div>
      ) : (
        <>
          {filtered.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-500">No chapters yet. Add one below.</div>
          ) : (
            <div className="space-y-2 mb-6">
              {filtered.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-gray-300">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
                      {c.chapter_number || "?"}
                    </span>
                    <p className="font-medium text-gray-900">{c.title}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id, c.title)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAdd} className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New chapter title..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={adding || !newTitle.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Chapter
            </button>
          </form>
        </>
      )}
    </div>
  );
}
