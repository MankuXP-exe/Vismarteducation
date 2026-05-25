"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import toast from "react-hot-toast";

type ConcessionRequest = {
  id: string;
  user_id: string;
  concession_type: string;
  status: string;
  ocr_text: string | null;
  ocr_confidence: number | null;
  verification_score: number | null;
  verification_keywords: string[] | null;
  rejection_reason: string | null;
  discount_percent: number;
  discount_amount: number;
  is_active: boolean;
  is_fraud_flagged: boolean;
  created_at: string;
  document_original_name: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  army: "Army Privilege",
  single_parent: "Single Parent",
  disabled: "Specially Abled",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

export default function AdminConcessionsPage() {
  const [requests, setRequests] = useState<ConcessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reverify, setReverify] = useState<string | null>(null);

  useEffect(() => {
    if (isSupabaseAdminConfigured) {
      loadRequests();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadRequests() {
    const { data } = await supabaseAdmin
      .from("concession_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRequests(data);
    setLoading(false);
  }

  async function handleReverify(id: string) {
    setReverify(id);
    try {
      const res = await fetch("/api/concession/reverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concessionId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Re-verified successfully");
      loadRequests();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setReverify(null);
    }
  }

  const filtered = requests.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.id?.toLowerCase().includes(q) ||
        r.user_id?.toLowerCase().includes(q) ||
        TYPE_LABELS[r.concession_type]?.toLowerCase().includes(q) ||
        r.document_original_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Concession Requests</h1>
          <p className="text-sm text-gray-500">{requests.length} total requests</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by ID, user, type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No concession requests found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className={`rounded-xl border bg-white overflow-hidden ${r.is_fraud_flagged ? "border-red-400" : "border-gray-200"}`}>
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status] || "bg-gray-100"}`}>
                    {r.status}
                  </span>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{TYPE_LABELS[r.concession_type] || r.concession_type}</p>
                    <p className="text-xs text-gray-400">ID: {r.id.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {r.is_fraud_flagged && <span className="text-red-600 font-bold">FRAUD</span>}
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </button>

              {expanded === r.id && (
                <div className="border-t border-gray-100 p-4 space-y-3 text-sm">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-400 text-xs">User ID</p>
                      <p className="font-mono text-xs">{r.user_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Discount</p>
                      <p>{r.discount_percent ? `${r.discount_percent}%` : r.discount_amount ? `₹${r.discount_amount / 100}` : "None"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Active</p>
                      <p>{r.is_active ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  {r.rejection_reason && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-red-800">Rejection: {r.rejection_reason}</p>
                    </div>
                  )}

                  {r.ocr_text && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">OCR Text</p>
                      <p className="bg-gray-50 rounded p-2 text-xs font-mono line-clamp-4">{r.ocr_text}</p>
                    </div>
                  )}

                  {r.ocr_confidence !== null && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-400 text-xs">OCR Confidence</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(r.ocr_confidence || 0) * 100}%` }} />
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Verification Score</p>
                        <p className="font-medium">{r.verification_score ?? 0}</p>
                      </div>
                    </div>
                  )}

                  {r.verification_keywords && r.verification_keywords.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Matched Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {r.verification_keywords.map((kw) => (
                          <span key={kw} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleReverify(r.id)}
                    disabled={reverify === r.id}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                  >
                    {reverify === r.id ? "Re-verifying..." : "Re-verify with OCR"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
