"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, Plus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type Batch = {
  id: string;
  title: string;
  slug: string;
  category: string;
  subjects: string[];
};

export default function SubjectsClient({ batches }: { batches: Batch[] }) {
  const [search, setSearch] = useState("");
  const [addingSubject, setAddingSubject] = useState<{ batchId: string; name: string } | null>(null);
  const [savingSubjects, setSavingSubjects] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search) return batches;
    const q = search.toLowerCase();
    return batches.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        (b.subjects || []).some((s) => s.toLowerCase().includes(q))
    );
  }, [batches, search]);

  async function handleAddSubject(batchId: string, name: string) {
    if (!name.trim()) return;
    setSavingSubjects((prev) => new Set(prev).add(batchId));
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Subject "${name.trim()}" added`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingSubjects((prev) => {
        const next = new Set(prev);
        next.delete(batchId);
        return next;
      });
      setAddingSubject(null);
    }
  }

  async function handleRemoveSubject(batchId: string, name: string) {
    setSavingSubjects((prev) => new Set(prev).add(batchId));
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Subject "${name}" removed`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingSubjects((prev) => {
        const next = new Set(prev);
        next.delete(batchId);
        return next;
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by batch name, category, or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
          <BookOpen className="mx-auto mb-2 h-8 w-8" />
          <p>No batches found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((batch) => {
            const hasSubjects = (batch.subjects || []).length > 0;
            const isSaving = savingSubjects.has(batch.id);

            return (
              <div key={batch.id} className="rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md">
                {/* Header */}
                <div className="border-b border-gray-100 px-4 py-3">
                  <h3 className="font-semibold text-gray-900">{batch.title}</h3>
                  <p className="text-xs text-gray-400">
                    {batch.category}
                    {batch.slug ? ` · ${batch.slug}` : ""}
                  </p>
                </div>

                {/* Subjects */}
                <div className="px-4 py-3">
                  {isSaving ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    </div>
                  ) : hasSubjects ? (
                    <div className="flex flex-wrap gap-1.5">
                      {(batch.subjects || []).map((sub) => (
                        <span
                          key={sub}
                          className="group inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700"
                        >
                          {sub}
                          <button
                            onClick={() => handleRemoveSubject(batch.id, sub)}
                            className="text-purple-400 hover:text-red-500"
                            title={`Remove ${sub}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No subjects added yet.</p>
                  )}
                </div>

                {/* Add subject */}
                <div className="border-t border-gray-100 px-4 py-3">
                  {addingSubject?.batchId === batch.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (addingSubject) handleAddSubject(addingSubject.batchId, addingSubject.name);
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={addingSubject.name}
                        onChange={(e) =>
                          setAddingSubject((prev) => (prev ? { ...prev, name: e.target.value } : null))
                        }
                        placeholder="Subject name..."
                        className="flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-purple-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingSubject(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setAddingSubject({ batchId: batch.id, name: "" })}
                      className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Subject
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
