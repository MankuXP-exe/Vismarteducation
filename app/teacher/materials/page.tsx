"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Trash2, Download, Search, Loader2, Upload, X, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { isCapacitor, openUrl } from "@/lib/capacitor";

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_name?: string;
  file_size_bytes?: number;
  file_type?: string;
  material_type: string;
  created_at: string;
  subjects: { name: string } | null;
  chapters: { title: string } | null;
  batch_id: string;
}

interface Batch {
  id: string;
  title: string;
}

interface Subject {
  id: string;
  name: string;
  abbreviation: string;
}

const TYPE_COLORS: Record<string, string> = {
  notes: "bg-blue-50 text-blue-600",
  dpp: "bg-orange-50 text-orange-600",
  dpp_solutions: "bg-green-50 text-green-600",
  reference: "bg-purple-50 text-purple-600",
  assignment: "bg-red-50 text-red-600",
  test_paper: "bg-yellow-50 text-yellow-600",
};

const TYPE_ICONS: Record<string, string> = {
  pdf: "📄", doc: "📝", ppt: "📊", xls: "📈",
  image: "🖼️", video: "🎬", zip: "📦", other: "📁",
};

const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mp3,.zip,.rar";
const MAX_SIZE_MB = 500;

function formatSize(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(0) + " KB";
  return bytes + " B";
}

function getFileTypeIcon(mime: string, name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["ppt", "pptx"].includes(ext)) return "📊";
  if (["xls", "xlsx"].includes(ext)) return "📈";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "🖼️";
  if (["mp4", "webm", "mov", "mkv"].includes(ext)) return "🎬";
  if (["zip", "rar", "7z"].includes(ext)) return "📦";
  return "📁";
}

export default function TeacherMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<{ id: string; title: string; chapter_number: number }[]>([]);
  const [form, setForm] = useState({ title: "", materialType: "notes", batchId: "", subjectId: "", chapterId: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/materials/list")
      .then((r) => r.json())
      .then((d) => { setMaterials(d.materials || []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch("/api/batches")
      .then((r) => r.json())
      .then((d) => setBatches(d.batches || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.batchId) {
      fetch(`/api/subjects?batchId=${form.batchId}`)
        .then((r) => r.json())
        .then((d) => setSubjects(d.subjects || []))
        .catch(() => setSubjects([]));
    } else {
      setSubjects([]);
    }
  }, [form.batchId]);

  useEffect(() => {
    if (form.subjectId) {
      const params = new URLSearchParams({ subjectId: form.subjectId });
      if (form.batchId) params.set("batchId", form.batchId);
      fetch(`/api/chapters?${params}`)
        .then((r) => r.json())
        .then((d) => setChapters(d.chapters || []))
        .catch(() => setChapters([]));
    } else {
      setChapters([]);
    }
  }, [form.subjectId, form.batchId]);

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

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const allowed = ALLOWED_EXTENSIONS.split(",");
    if (!allowed.includes(ext)) {
      toast.error(`File type not supported (${ext}). Allowed: ${ALLOWED_EXTENSIONS}`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large (max ${MAX_SIZE_MB}MB)`);
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !form.batchId || !form.chapterId || !form.title) {
      toast.error("File, batch, chapter, and title are required");
      return;
    }
    setUploading(true);
    setUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("title", form.title);
      fd.append("batchId", form.batchId);
      fd.append("subjectId", form.subjectId);
      fd.append("chapterId", form.chapterId);

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 90));
      });
      const result = await new Promise<any>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(xhr.responseText || "Upload failed"));
        });
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("POST", "/api/materials/upload-file");
        xhr.send(fd);
      });
      setUploadProgress(100);
      setTimeout(() => {
        if (result.material) {
          setMaterials([result.material, ...materials]);
        } else {
          fetch("/api/materials/list").then((r) => r.json()).then((d) => setMaterials(d.materials || []));
        }
        resetForm();
        toast.success("Material uploaded!");
      }, 400);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setForm({ title: "", materialType: "notes", batchId: "", subjectId: "", chapterId: "" });
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-sm text-gray-500">{materials.length} total materials</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-all">
          <Plus size={18} /> {showAddForm ? "Cancel" : "Upload Material"}
        </button>
      </div>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-purple-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Upload New Material</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Batch *</label>
              <select value={form.batchId} onChange={(e) => setForm({...form, batchId: e.target.value, subjectId: "", chapterId: ""})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400">
                <option value="">Select batch</option>
                {batches.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Subject</label>
              <select value={form.subjectId} onChange={(e) => setForm({...form, subjectId: e.target.value, chapterId: ""})}
                disabled={!form.batchId}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400 disabled:opacity-40">
                <option value="">{form.batchId ? "Select subject" : "Select batch first"}</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Chapter *</label>
              <select value={form.chapterId} onChange={(e) => setForm({...form, chapterId: e.target.value})}
                disabled={!form.subjectId}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400 disabled:opacity-40">
                <option value="">{form.subjectId ? "Select chapter" : "Select subject first"}</option>
                {chapters.map((c) => <option key={c.id} value={c.id}>{c.chapter_number}. {c.title}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Title *</label>
              <input type="text" placeholder="e.g. Chapter 1 Notes" value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-400" />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
              <select value={form.materialType} onChange={(e) => setForm({...form, materialType: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none">
                <option value="notes">Notes</option>
                <option value="dpp">DPP</option>
                <option value="dpp_solutions">DPP Solutions</option>
                <option value="reference">Reference</option>
                <option value="assignment">Assignment</option>
                <option value="test_paper">Test Paper</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-gray-500">File * ({ALLOWED_EXTENSIONS}, max {MAX_SIZE_MB}MB)</label>
            {selectedFile ? (
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
                <CheckCircle2 size={20} className="shrink-0 text-green-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">{formatSize(selectedFile.size)}</p>
                </div>
                <button onClick={() => setSelectedFile(null)} disabled={uploading}
                  className="shrink-0 rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
                  dragOver ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-gray-50/50 hover:border-purple-300 hover:bg-purple-50/30"
                }`}>
                <Upload size={32} className={`mb-2 ${dragOver ? "text-purple-500" : "text-gray-300"}`} />
                <p className={`text-sm font-medium ${dragOver ? "text-purple-600" : "text-gray-600"}`}>
                  {dragOver ? "Drop file here" : "Drag & drop or click to browse"}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">PDF, Word, PPT, Excel, Images, Video, ZIP</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept={ALLOWED_EXTENSIONS} className="hidden" onChange={handleFileSelect} />
          </div>

          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>{uploadProgress < 100 ? "Uploading..." : "Processing..."}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-purple-500 transition-all duration-300" style={{ width: uploadProgress + "%" }} />
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
              <button onClick={handleUpload} disabled={uploading || !selectedFile || !form.batchId || !form.chapterId || !form.title}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-40 transition-all">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button onClick={resetForm} disabled={uploading}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30">Cancel</button>
          </div>
        </motion.div>
      )}

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
          <p className="text-sm text-gray-500">Click "Upload Material" to add your first study material.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-1">
              <button onClick={() => deleteMaterial(m.id)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-400 opacity-0 shadow transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-xl">
                {getFileTypeIcon(m.file_type || "", m.file_name || m.file_url)}
              </div>
              <h3 className="mb-1 font-semibold text-gray-900 line-clamp-1">{m.title}</h3>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[m.material_type] || "bg-gray-50 text-gray-600"}`}>
                  {m.material_type.replace("_", " ")}
                </span>
                {m.file_size_bytes ? <span>{formatSize(m.file_size_bytes)}</span> : null}
              </div>
              {(m.subjects?.name || m.chapters?.title) && (
                <div className="mt-1.5 text-[11px] text-gray-400">
                  {m.subjects?.name}{m.chapters?.title ? ` · ${m.chapters.title}` : ""}
                </div>
              )}
              <button onClick={() => isCapacitor() ? openUrl(m.file_url) : setPreviewUrl(m.file_url)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700">
                <Download size={12} /> Open
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative flex h-full w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm font-medium text-gray-700">Preview</span>
              <button onClick={() => setPreviewUrl(null)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe src={previewUrl} className="h-full w-full" title="File preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
