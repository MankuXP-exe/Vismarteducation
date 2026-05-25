"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Trash2, Download, Search, Loader2, Filter } from "lucide-react";
import toast from "react-hot-toast";

interface Material {
  id: string;
  title: string;
  file_url: string;
  material_type: string;
  created_at: string;
  subjects: { name: string } | null;
  chapters: { title: string } | null;
  batch_id: string;
}

const TYPE_COLORS: Record<string, string> = {
  notes: "bg-blue-50 text-blue-600",
  dpp: "bg-orange-50 text-orange-600",
  dpp_solutions: "bg-green-50 text-green-600",
  reference: "bg-purple-50 text-purple-600",
  assignment: "bg-red-50 text-red-600",
  test_paper: "bg-yellow-50 text-yellow-600",
};

export default function TeacherMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ title: "", fileUrl: "", materialType: "notes", batchId: "", subjectId: "", chapterId: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/materials/list")
      .then((r) => r.json())
      .then((d) => { setMaterials(d.materials || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = materials.filter((m) => {
    if (typeFilter !== "all" && m.material_type !== typeFilter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const deleteMaterial = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    await fetch("/api/materials/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ materialId: id }) });
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    toast.success("Deleted");
  };

  const addMaterial = async () => {
    if (!form.title || !form.fileUrl) { toast.error("Title and URL required"); return; }
    setAdding(true);
    const res = await fetch("/api/materials/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.material) {
      setMaterials([data.material, ...materials]);
      setShowAddForm(false);
      setForm({ title: "", fileUrl: "", materialType: "notes", batchId: "", subjectId: "", chapterId: "" });
      toast.success("Material added");
    }
    setAdding(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-sm text-gray-500">{materials.length} total materials</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700">
          <Plus size={18} /> {showAddForm ? "Cancel" : "Add Material"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <h3 className="mb-3 font-semibold text-purple-900">Add New Material</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input type="text" placeholder="Title *" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
              className="rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
            <input type="url" placeholder="File URL *" value={form.fileUrl} onChange={(e) => setForm({...form, fileUrl: e.target.value})}
              className="rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
            <select value={form.materialType} onChange={(e) => setForm({...form, materialType: e.target.value})}
              className="rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm outline-none">
              <option value="notes">Notes</option>
              <option value="dpp">DPP</option>
              <option value="dpp_solutions">DPP Solutions</option>
              <option value="reference">Reference</option>
              <option value="assignment">Assignment</option>
              <option value="test_paper">Test Paper</option>
            </select>
            <button onClick={addMaterial} disabled={adding}
              className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-40">
              {adding ? "Adding..." : "Save Material"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search materials..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-purple-300" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none">
          <option value="all">All Types</option>
          <option value="notes">Notes</option>
          <option value="dpp">DPP</option>
          <option value="dpp_solutions">DPP Solutions</option>
          <option value="reference">Reference</option>
          <option value="assignment">Assignment</option>
          <option value="test_paper">Test Paper</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold text-gray-900">No materials found</p>
          <p className="text-sm text-gray-500">Add your first study material to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-xl hover:-translate-y-1">
              <button onClick={() => deleteMaterial(m.id)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-400 opacity-0 shadow transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
                <FileText size={22} className="text-gray-600" />
              </div>
              <h3 className="mb-1 font-semibold text-gray-900 line-clamp-1">{m.title}</h3>
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[m.material_type] || "bg-gray-50 text-gray-600"}`}>
                {m.material_type.replace("_", " ")}
              </span>
              <div className="mt-2 text-[10px] text-gray-400">
                {m.subjects?.name && <span>{m.subjects.name}</span>}
                {m.chapters?.title && <span> · {m.chapters.title}</span>}
              </div>
              <a href={m.file_url} target="_blank" rel="noreferrer"
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700">
                <Download size={12} /> Open
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
