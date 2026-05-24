"use client";

export default function TeacherControls() {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">Start Recording</button>
      <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white">Share Screen</button>
      <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200">End Class</button>
    </div>
  );
}
