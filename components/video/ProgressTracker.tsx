export default function ProgressTracker({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className="h-full rounded-full bg-[#5c35d9]" style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}
