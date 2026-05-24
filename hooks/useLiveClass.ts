"use client";

import { useCallback, useState } from "react";

export function useLiveClass(classId: string, role: "teacher" | "student") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getJoinInfo = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/live/get-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error ?? "Unable to join class");
    return data;
  }, [classId, role]);

  return { getJoinInfo, loading, error };
}
