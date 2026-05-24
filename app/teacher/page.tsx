import Link from "next/link";
import { CalendarPlus, Upload, Users, Video } from "lucide-react";

export default function TeacherDashboardPage() {
  const cards = [
    { label: "My Batches", value: "6" },
    { label: "Total Students", value: "428" },
    { label: "Upcoming Live Classes", value: "4" },
    { label: "Lectures Uploaded", value: "132" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher dashboard</h1>
        <p className="text-sm text-gray-500">Manage live classes, recordings, notes, and batches.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/teacher/batches/new/schedule" className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
          <CalendarPlus className="mb-3 h-6 w-6 text-[#5c35d9]" />
          <h2 className="font-bold text-gray-900">Schedule Live Class</h2>
          <p className="text-sm text-gray-500">Create a LiveKit room and notify students.</p>
        </Link>
        <Link href="/teacher/batches/new/upload" className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
          <Upload className="mb-3 h-6 w-6 text-[#5c35d9]" />
          <h2 className="font-bold text-gray-900">Upload Lecture</h2>
          <p className="text-sm text-gray-500">Store recordings on the 100GB VPS disk.</p>
        </Link>
        <Link href="/teacher/live/demo" className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
          <Video className="mb-3 h-6 w-6 text-[#5c35d9]" />
          <h2 className="font-bold text-gray-900">Open Live Room</h2>
          <p className="text-sm text-gray-500">Start a class with camera, mic, chat, and screen share.</p>
        </Link>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-bold text-gray-900">Upcoming classes</h2>
        {["Accountancy - Partnership Basics", "Maths - Differentiation", "Economics - Demand"].map((item) => (
          <div key={item} className="flex items-center justify-between border-t border-gray-100 py-3 text-sm">
            <span className="font-medium text-gray-800">{item}</span>
            <span className="text-gray-500">Today</span>
          </div>
        ))}
      </div>
    </div>
  );
}
