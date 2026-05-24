"use client";

import { useEffect, useState } from "react";
import { checkEnrollment } from "@/lib/supabase/queries";

export function useEnrollment(studentId?: string, batchId?: string) {
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(Boolean(studentId && batchId));

  useEffect(() => {
    if (!studentId || !batchId) return;

    checkEnrollment(studentId, batchId).then(({ data }) => {
      setEnrolled(data?.status === "active");
      setLoading(false);
    });
  }, [studentId, batchId]);

  return { enrolled, loading };
}
