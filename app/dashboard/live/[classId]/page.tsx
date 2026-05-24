import LiveRoom from "@/components/live/LiveRoom";

export default async function StudentLiveClass({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return <LiveRoom classId={classId} role="student" />;
}
