"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Subject = { id: string; name: string; abbreviation: string };

export default function ScheduleClass({ batchId }: { batchId: string }) {
  const [status, setStatus] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");

  useEffect(() => {
    fetch(`/api/subjects?batchId=${batchId}`)
      .then((res) => res.json())
      .then((data) => setSubjects(data.subjects || []))
      .catch(() => {});
  }, [batchId]);

  const subjectName = selectedSubject === "__custom" ? customSubject.trim() : selectedSubject;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subjectName) {
      toast.error("Select or enter a subject");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const scheduledAt = `${formData.get("date")}T${formData.get("time")}:00`;

    const res = await fetch("/api/live/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId,
        title: formData.get("title"),
        subjectName,
        chapterTitle: formData.get("chapterTitle"),
        scheduledAt,
        durationMinutes: Number(formData.get("durationMinutes")),
        description: formData.get("description"),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setStatus(`Class scheduled. Link: /teacher/live/${data.liveClass.id}`);
      toast.success("Live class scheduled successfully!");
    } else {
      setStatus(data.error || "Unable to schedule class");
      toast.error(data.error || "Unable to schedule class");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <input name="title" required placeholder="Class title" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Subject</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
            <option value="__custom">Add new subject</option>
          </select>
          {selectedSubject === "__custom" && (
            <input
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="New subject name"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            />
          )}
        </label>
        <input name="chapterTitle" placeholder="Chapter title" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
        <input name="date" type="date" required className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
        <input name="time" type="time" required className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
      </div>
      <select name="durationMinutes" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm">
        <option value="30">30 minutes</option>
        <option value="60">60 minutes</option>
        <option value="90">90 minutes</option>
        <option value="120">120 minutes</option>
      </select>
      <textarea name="description" placeholder="Description" className="min-h-24 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" />
      <div className="flex gap-3">
        <button className="rounded-lg bg-[#5c35d9] px-5 py-3 font-semibold text-white">Schedule live class</button>
      </div>
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </form>
  );
}
