"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

const CATEGORIES = ["JEE", "NEET", "Class 11-12", "Class 9-10", "Foundation"];
const STREAMS = ["", "PCM", "PCB", "PCMB", "Commerce", "Arts"];
const CLASS_LEVELS = ["9", "10", "11", "12", "Dropper", "Other"];

type Batch = {
  id: string;
  title: string;
  slug: string;
  category: string;
  stream: string | null;
  class_level: string | null;
  price: number;
  description: string | null;
  thumbnail_url: string | null;
  duration_months: number;
  subjects: string[];
  is_active: boolean;
};

export default function EditBatchForm({ batch }: { batch: Batch }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: batch.title,
    slug: batch.slug,
    category: batch.category,
    stream: batch.stream || "",
    class_level: batch.class_level || "11",
    price: String(batch.price),
    description: batch.description || "",
    thumbnail_url: batch.thumbnail_url || "",
    duration_months: String(batch.duration_months || 12),
    subjects: (batch.subjects || []).join(", "),
    is_active: batch.is_active,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "title" && prev.slug === batch.slug) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug || !form.price) {
      toast.error("Title, slug, and price are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/batches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: batch.id,
          ...form,
          price: Number(form.price),
          duration_months: Number(form.duration_months),
          subjects: form.subjects
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Batch updated successfully");
      router.push("/teacher/batches");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Active</p>
          <p className="text-xs text-gray-400">Students can see and enrol in this batch</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="peer sr-only"
          />
          <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-purple-600 peer-checked:after:translate-x-full" />
        </label>
      </div>

      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input name="title" value={form.title} onChange={handleChange} className={inputClass} />
      </div>

      {/* Slug */}
      <div>
        <label className={labelClass}>Slug *</label>
        <input name="slug" value={form.slug} onChange={handleChange} className={inputClass} />
      </div>

      {/* Category / Stream / Class Level */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Stream</label>
          <select name="stream" value={form.stream} onChange={handleChange} className={inputClass}>
            {STREAMS.map((s) => (
              <option key={s} value={s}>
                {s || "None"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Class Level</label>
          <select name="class_level" value={form.class_level} onChange={handleChange} className={inputClass}>
            {CLASS_LEVELS.map((cl) => (
              <option key={cl}>{cl}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price / Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Price (₹) *</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Duration (months)</label>
          <input name="duration_months" type="number" value={form.duration_months} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      {/* Thumbnail URL */}
      <div>
        <label className={labelClass}>Thumbnail URL</label>
        <input name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} className={inputClass} />
        {form.thumbnail_url && (
          <img src={form.thumbnail_url} alt="Preview" className="mt-2 h-24 w-40 rounded-lg object-cover border" />
        )}
      </div>

      {/* Subjects */}
      <div>
        <label className={labelClass}>Subjects (comma-separated)</label>
        <input name="subjects" value={form.subjects} onChange={handleChange} className={inputClass} placeholder="Physics, Chemistry, Mathematics" />
        {form.subjects && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {form.subjects
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => (
                <span key={s} className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  {s}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" rows={4} value={form.description} onChange={handleChange} className={inputClass} />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
