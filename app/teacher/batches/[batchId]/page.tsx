import BatchManager from "@/components/teacher/BatchManager";

export default async function ManageBatchPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage batch</h1>
        <p className="text-sm text-gray-500">Batch ID: {batchId}</p>
      </div>
      <BatchManager batchId={batchId} />
    </div>
  );
}
