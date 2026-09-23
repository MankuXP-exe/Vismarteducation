"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertCircle size={28} />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">Unable to load this section</h2>
      <p className="mb-6 max-w-sm text-sm text-gray-500">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 rounded-xl bg-[#5c35d9] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
      >
        <RotateCcw size={16} />
        Try Again
      </button>
    </div>
  );
}
