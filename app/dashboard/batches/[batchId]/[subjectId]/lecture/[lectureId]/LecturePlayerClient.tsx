"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ThumbsUp,
  Bookmark,
  HelpCircle,
  Download,
  Play,
  CheckCircle,
  Lock,
  Search,
} from "lucide-react";
import { lecturesData, chaptersData } from "@/lib/student-mock-data";

type OverviewTab = "overview" | "notes" | "dpp";

export default function LecturePlayerClient() {
  const params = useParams<{
    batchId: string;
    subjectId: string;
    lectureId: string;
  }>();
  const router = useRouter();

  const { batchId, subjectId, lectureId } = params;
  const chapterKey = `ch-01-${subjectId}`;

  // Gather all lectures for this subject to build the sidebar
  const allLectures = lecturesData[chapterKey] ?? [];
  const currentLecture =
    allLectures.find((l) => l.id === lectureId) ?? allLectures[0];
  const chapters = chaptersData[subjectId] ?? [];

  const [overviewTab, setOverviewTab] = useState<OverviewTab>("overview");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  if (!currentLecture) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Play size={48} className="mb-4 opacity-30" />
        <p className="font-medium">Lecture not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#5c35d9] font-semibold hover:underline"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex gap-0 h-[calc(100vh-56px)] -m-8 overflow-hidden"
      style={{ background: "#f7f8fc" }}
    >
      {/* LEFT — Video Player (65%) */}
      <div className="flex-1 overflow-y-auto">
        {/* Back nav */}
        <div className="px-6 pt-5 pb-3">
          <button
            onClick={() => router.back()}
            id="back-btn-lecture"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            All Classes
          </button>
        </div>

        {/* Video Player */}
        <div className="px-6">
          <div className="w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg">
            {currentLecture.cloudflareId && currentLecture.cloudflareId !== "demo-video-id" ? (
              <iframe
                src={`https://iframe.cloudflarestream.com/${currentLecture.cloudflareId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              /* Placeholder for demo */
              <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Play size={36} className="text-white ml-2" />
                </div>
                <p className="font-semibold text-white/80 text-lg">
                  {currentLecture.title}
                </p>
                <p className="text-sm mt-2 text-white/40">
                  Cloudflare Video Player — Configure stream ID
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lecture Info */}
        <div className="px-6 mt-5">
          <h1 className="text-xl font-bold text-gray-900">{currentLecture.title}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {currentLecture.uploadedOn} &nbsp;·&nbsp; {currentLecture.duration}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <button
              onClick={() => setLiked(!liked)}
              id="btn-like"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                liked
                  ? "bg-[#5c35d9] text-white border-[#5c35d9]"
                  : "border-gray-200 text-gray-600 hover:border-[#5c35d9] hover:text-[#5c35d9]"
              }`}
            >
              <ThumbsUp size={15} />
              {liked ? "Liked" : "Like"}
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              id="btn-bookmark"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                bookmarked
                  ? "bg-[#5c35d9] text-white border-[#5c35d9]"
                  : "border-gray-200 text-gray-600 hover:border-[#5c35d9] hover:text-[#5c35d9]"
              }`}
            >
              <Bookmark size={15} />
              {bookmarked ? "Saved" : "Bookmark"}
            </button>
            <button
              id="btn-ask-doubt"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-green-400 hover:text-green-600 transition-all"
            >
              <HelpCircle size={15} />
              Ask Doubt
            </button>
            <button
              id="btn-download-notes"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              <Download size={15} />
              Download Notes
            </button>
          </div>

          {/* Overview Tabs */}
          <div className="flex gap-5 border-b border-gray-200 mt-6">
            {(["overview", "notes", "dpp"] as const).map((tab) => (
              <button
                key={tab}
                id={`overview-tab-${tab}`}
                onClick={() => setOverviewTab(tab)}
                className={`pb-2.5 text-sm font-medium capitalize transition-all border-b-2 ${
                  overviewTab === tab
                    ? "border-[#5c35d9] text-[#5c35d9]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab === "dpp" ? "DPP" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-5 pb-10">
            {overviewTab === "overview" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  About this lecture
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  In this lecture, we cover the foundational concepts of{" "}
                  {currentLecture.title}. This session is designed to build a
                  strong conceptual base for CBSE board examinations.
                </p>
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  Topics Covered:
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1.5">
                  <li>Introduction and definition of key terms</li>
                  <li>Practical examples and solved illustrations</li>
                  <li>Board-focused important points</li>
                  <li>Common mistakes to avoid</li>
                  <li>NCERT exercise walkthrough</li>
                </ul>
              </div>
            )}
            {overviewTab === "notes" && (
              <p className="text-sm text-gray-400">Notes for this lecture will appear here.</p>
            )}
            {overviewTab === "dpp" && (
              <p className="text-sm text-gray-400">DPP for this lecture will appear here.</p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT — Lecture List Panel (35%) */}
      <div className="w-[340px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
        {/* Panel Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm mb-3">All Lectures</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search lectures..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#5c35d9] transition-colors"
            />
          </div>
        </div>

        {/* Lecture List */}
        <div className="flex-1 overflow-y-auto">
          {allLectures.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
              <Play size={32} className="mb-2 opacity-30" />
              <p className="text-sm text-center">No lectures in this chapter yet.</p>
            </div>
          ) : (
            allLectures.map((lec, idx) => {
              const isCurrent = lec.id === lectureId;
              const isLocked = idx >= 3; // mock: first 3 available, rest locked

              return (
                <Link
                  key={lec.id}
                  href={
                    isLocked
                      ? "#"
                      : `/dashboard/batches/${batchId}/${subjectId}/lecture/${lec.id}`
                  }
                  id={`lecture-list-item-${lec.id}`}
                  className={`flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 transition-all ${
                    isCurrent
                      ? "bg-purple-50 border-l-4 border-l-[#5c35d9]"
                      : isLocked
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-16 h-11 rounded-lg shrink-0 flex items-center justify-center"
                    style={{
                      background: isCurrent
                        ? "linear-gradient(135deg, #ede9ff, #c4b5fd)"
                        : "#f3f4f6",
                    }}
                  >
                    {isLocked ? (
                      <Lock size={14} className="text-gray-400" />
                    ) : (
                      <Play size={14} className={isCurrent ? "text-[#5c35d9]" : "text-gray-400"} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-tight truncate ${
                        isCurrent ? "text-[#5c35d9]" : "text-gray-800"
                      }`}
                    >
                      {lec.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{lec.duration}</p>
                  </div>

                  {/* Status */}
                  {lec.watched && (
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
