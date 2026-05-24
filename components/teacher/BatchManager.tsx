import Link from "next/link";
import { Upload, Video, Zap } from "lucide-react";

export default function BatchManager({ batchId }: { batchId: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Link href={`/teacher/live/start`} className="rounded-lg border border-green-200 bg-green-50 p-5 hover:border-green-400">
        <Zap className="mb-3 h-6 w-6 text-green-600" />
        <h3 className="font-bold text-gray-900">Start instant live</h3>
        <p className="text-sm text-gray-500">Choose batch, subject, and go live immediately.</p>
      </Link>
      <Link href={`/teacher/batches/${batchId}/upload`} className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
        <Upload className="mb-3 h-6 w-6 text-[#5c35d9]" />
        <h3 className="font-bold text-gray-900">Upload lecture</h3>
        <p className="text-sm text-gray-500">Save videos directly on the VPS and publish them to students.</p>
      </Link>
      <Link href={`/teacher/batches/${batchId}/schedule`} className="rounded-lg border border-gray-200 bg-white p-5 hover:border-[#5c35d9]">
        <Video className="mb-3 h-6 w-6 text-[#5c35d9]" />
        <h3 className="font-bold text-gray-900">Schedule live class</h3>
        <p className="text-sm text-gray-500">Create a LiveKit room and notify enrolled students.</p>
      </Link>
    </div>
  );
}
