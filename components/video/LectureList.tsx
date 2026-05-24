import Link from "next/link";
import { PlayCircle } from "lucide-react";

type LectureItem = {
  id: string;
  title: string;
  duration_label?: string;
  duration?: string;
};

export default function LectureList({
  lectures,
  baseHref,
}: {
  lectures: LectureItem[];
  baseHref: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {lectures.map((lecture) => (
        <Link
          key={lecture.id}
          href={`${baseHref}/lecture/${lecture.id}`}
          className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
        >
          <PlayCircle className="h-5 w-5 text-[#5c35d9]" />
          <span className="flex-1 text-sm font-medium text-gray-800">{lecture.title}</span>
          <span className="text-xs text-gray-500">{lecture.duration_label || lecture.duration}</span>
        </Link>
      ))}
    </div>
  );
}
