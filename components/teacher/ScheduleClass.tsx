"use client";

import { useState } from "react";

export default function ScheduleClass({ batchId }: { batchId: string }) {
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const scheduledAt = `${formData.get("date")}T${formData.get("time")}:00`;

    const res = await fetch("/api/live/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batchId,
        title: formData.get("title"),
        subjectName: formData.get("subjectName"),
        chapterTitle: formData.get("chapterTitle"),
        scheduledAt,
        durationMinutes: Number(formData.get("durationMinutes")),
        description: formData.get("description"),
      }),
    });

    const data = await res.json();
    setStatus(res.ok ? `Class scheduled. Link: /teacher/live/${data.liveClass.id}` : data.error || "Unable to schedule class");
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <input name="title" required placeholder="Class title" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" />
      <div className="grid gap-4 md:grid-cols-2">
        <input name="subjectName" placeholder="Subject name" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
        <input name="chapterTitle" placeholder="Chapter title" className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
        <input name="date" type="date" required className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
        <input name="time" type="time" required className="rounded-lg border border-gray-300 px-4 py-3 text-sm" />
      </div>
      <select name="durationMinutes" className="rounded-lg border border-gray-300 px-4 py-3 text-sm">
        <option value="30">30 minutes</option>
        <option value="60">60 minutes</option>
        <option value="90">90 minutes</option>
        <option value="120">120 minutes</option>
      </select>
      <textarea name="description" placeholder="Description" className="min-h-24 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm" />
      <button className="rounded-lg bg-[#5c35d9] px-5 py-3 font-semibold text-white">Schedule live class</button>
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </form>
  );
}
