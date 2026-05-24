import ScheduleClass from "@/components/teacher/ScheduleClass";

export default async function ScheduleClassPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Schedule live class</h1>
        <p className="text-sm text-gray-500">Creates a LiveKit room through the VPS API.</p>
      </div>
      <ScheduleClass batchId={batchId} />
    </div>
  );
}
