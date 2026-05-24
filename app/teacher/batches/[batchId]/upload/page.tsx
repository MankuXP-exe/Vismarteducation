import UploadLecture from "@/components/teacher/UploadLecture";

export default async function UploadLecturePage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload lecture</h1>
        <p className="text-sm text-gray-500">Select a subject and chapter, then upload your video.</p>
      </div>
      <UploadLecture batchId={batchId} />
    </div>
  );
}
