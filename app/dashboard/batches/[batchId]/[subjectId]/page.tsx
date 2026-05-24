"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Play,
  FileText,
  ClipboardList,
  X,
  Download,
  Eye,
  Info,
} from "lucide-react";
import {
  chaptersData,
  lecturesData,
  notesData,
  dppsData,
} from "@/lib/student-mock-data";
import { motion, AnimatePresence } from "framer-motion";

type ContentTab = "all" | "lectures" | "dpps" | "notes" | "dpp-pdfs" | "dpp-videos";

export default function SubjectPage() {
  const params = useParams<{ batchId: string; subjectId: string }>();
  const router = useRouter();

  const { batchId, subjectId } = params;

  const chapters = chaptersData[subjectId] ?? [];
  const [selectedChapter, setSelectedChapter] = useState(chapters[0]?.id ?? "");
  const [contentTab, setContentTab] = useState<ContentTab>("all");
  const [infoDismissed, setInfoDismissed] = useState(false);

  const chapterKey = `${selectedChapter}-${subjectId}`;
  const lectures = lecturesData[chapterKey] ?? [];
  const notes = notesData[chapterKey] ?? [];
  const dpps = dppsData[chapterKey] ?? [];

  const contentTabs: { id: ContentTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "lectures", label: "Lectures" },
    { id: "dpps", label: "DPPs" },
    { id: "notes", label: "Notes" },
    { id: "dpp-pdfs", label: "DPP PDFs" },
    { id: "dpp-videos", label: "DPP Videos" },
  ];

  const showLectures = contentTab === "all" || contentTab === "lectures";
  const showNotes = contentTab === "all" || contentTab === "notes";
  const showDpps = contentTab === "all" || contentTab === "dpps";
  const showDppPdfs = contentTab === "dpp-pdfs";
  const showDppVideos = contentTab === "dpp-videos";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          id="back-btn-subject"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={18} />
          <span>All Classes</span>
        </button>
      </div>

      {/* Two-panel Layout */}
      <div className="flex gap-6 min-h-0">
        {/* LEFT PANEL — Chapters (30%) */}
        <div className="w-[260px] shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            ALL CHAPTERS
          </p>
          <div className="flex flex-col gap-2">
            {chapters.map((ch) => {
              const isActive = selectedChapter === ch.id;
              return (
                <button
                  key={ch.id}
                  id={`chapter-${ch.id}`}
                  onClick={() => setSelectedChapter(ch.id)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-4 rounded-xl border transition-all duration-150 ${
                    isActive
                      ? "bg-purple-50 border-purple-200 border-l-4 border-l-[#5c35d9]"
                      : "bg-white border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="block text-[#5c35d9] text-xs font-bold mb-0.5">
                      {ch.number}
                    </span>
                    <span className="block text-gray-800 font-medium text-sm leading-tight">
                      {ch.title}
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`shrink-0 ${isActive ? "text-[#5c35d9]" : "text-gray-300"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL — Content (70%) */}
        <div className="flex-1 min-w-0">
          {/* Content Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-4 overflow-x-auto pb-0">
            {contentTabs.map((tab) => (
              <button
                key={tab.id}
                id={`content-tab-${tab.id}`}
                onClick={() => setContentTab(tab.id)}
                className={`pb-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  contentTab === tab.id
                    ? "border-[#5c35d9] text-[#5c35d9]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Info Banner */}
          {!infoDismissed && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl px-4 py-3 mb-4 text-sm">
              <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="flex-1 text-blue-700 text-xs leading-relaxed">
                Don't worry if there's a small calculation error. Any missing points will be verified &amp; added soon!
              </p>
              <button
                onClick={() => setInfoDismissed(true)}
                className="text-blue-300 hover:text-blue-500 transition-colors shrink-0"
                aria-label="Dismiss banner"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={contentTab + selectedChapter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* LECTURES */}
              {showLectures && (
                <div className="mb-6">
                  {(contentTab === "all") && lectures.length > 0 && (
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                      Lectures
                    </h3>
                  )}
                  {lectures.length === 0 && (contentTab === "lectures" || contentTab === "all") ? (
                    <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
                      <Play size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No lectures uploaded yet for this chapter.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {lectures.map((lec, idx) => (
                        <div
                          key={lec.id}
                          className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:border-purple-200 hover:shadow-sm transition-all"
                        >
                          {/* Thumbnail */}
                          <div className="w-20 h-14 rounded-lg shrink-0 flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #ede9ff 0%, #c4b5fd 100%)" }}
                          >
                            <Play size={20} className="text-[#5c35d9]" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">
                              {lec.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              📅 {lec.uploadedOn} &nbsp;·&nbsp; ⏱ {lec.duration}
                            </p>
                          </div>

                          {/* Watch button */}
                          <Link
                            href={`/dashboard/batches/${batchId}/${subjectId}/lecture/${lec.id}`}
                            id={`watch-${lec.id}`}
                            className="shrink-0 flex items-center gap-1.5 text-[#5c35d9] text-sm font-semibold hover:underline"
                          >
                            <Play size={14} />
                            Watch Now
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NOTES */}
              {showNotes && (
                <div className="mb-6">
                  {contentTab === "all" && notes.length > 0 && (
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                      Notes
                    </h3>
                  )}
                  {notes.length === 0 && (contentTab === "notes" || contentTab === "all") && (
                    <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
                      <FileText size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No notes available for this chapter yet.</p>
                    </div>
                  )}
                  {notes.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <FileText size={20} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{note.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {note.type} · {note.uploadedOn}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-purple-300 hover:text-purple-600 transition-all">
                              <Eye size={14} />
                              View
                            </button>
                            <button className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100">
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DPPs */}
              {showDpps && (
                <div className="mb-6">
                  {contentTab === "all" && dpps.length > 0 && (
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                      DPPs
                    </h3>
                  )}
                  {dpps.length === 0 && (contentTab === "dpps" || contentTab === "all") && (
                    <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
                      <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No DPPs available for this chapter yet.</p>
                    </div>
                  )}
                  {dpps.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {dpps.map((dpp) => (
                        <div
                          key={dpp.id}
                          className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                              <ClipboardList size={20} className="text-[#5c35d9]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{dpp.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Questions: {dpp.questions} &nbsp;·&nbsp; Duration: {dpp.duration}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button className="text-sm font-semibold text-white bg-[#5c35d9] px-4 py-1.5 rounded-lg hover:bg-[#4a28b8] transition-colors">
                              Start DPP
                            </button>
                            <button className="text-sm font-medium text-gray-500 border border-gray-200 px-4 py-1.5 rounded-lg hover:border-gray-300 transition-colors">
                              Solutions
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DPP PDFs / DPP Videos empty states */}
              {(showDppPdfs || showDppVideos) && (
                <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    No {showDppPdfs ? "DPP PDFs" : "DPP Videos"} available yet.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
