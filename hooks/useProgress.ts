"use client";

import { useEffect, useState } from "react";
import { getStudentProgress } from "@/lib/supabase/queries";

export function useProgress(studentId?: string, batchId?: string) {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(Boolean(studentId && batchId));

  useEffect(() => {
    if (!studentId || !batchId) return;

    getStudentProgress(studentId, batchId).then(({ data }) => {
      setProgress(data ?? []);
      setLoading(false);
    });
  }, [studentId, batchId]);

  return { progress, loading };
}
