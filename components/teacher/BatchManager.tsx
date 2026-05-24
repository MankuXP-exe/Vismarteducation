import Link from "next/link";
import { Upload, Video } from "lucide-react";
import InstantLiveButton from "./InstantLiveButton";

export default function BatchManager({ batchId }: { batchId: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
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
      <InstantLiveButton batchId={batchId} />
    </div>
  );
}
