"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import toast from "react-hot-toast";
import { Bell, Send, X, Search, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  target_role: string | null;
  batch_id: string | null;
  is_read: boolean;
  created_at: string;
  created_by: string | null;
};

export default function TeacherNotificationsPage() {
  const { user } = useAuth();
  const [sent, setSent] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSend, setShowSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetRole: "students",
    userId: "",
  });

  useEffect(() => {
    if (isSupabaseAdminConfigured) loadSent();
    else setLoading(false);
  }, []);

  async function loadSent() {
    const { data } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setSent(data);
    setLoading(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message required");
      return;
    }
    setSending(true);
    try {
      const body: any = {
        title: form.title,
        message: form.message,
        type: "info",
      };

      if (form.userId) {
        body.userIds = [form.userId];
      } else {
        body.targetRole = form.targetRole;
      }

      const res = await fetch("/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Notification sent to ${data.count} user(s)`);
      setShowSend(false);
      setForm({ title: "", message: "", targetRole: "students", userId: "" });
      loadSent();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  const filtered = sent.filter((n) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.message?.toLowerCase().includes(q) ||
      n.target_role?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Manage and send notifications</p>
        </div>
        <button
          onClick={() => setShowSend(true)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          <Send className="h-4 w-4" />
          Send Notification
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p className="text-sm">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div key={n.id} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{n.title}</h3>
                    {n.target_role && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {n.target_role}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>To: {n.user_id?.slice(0, 8)}...</span>
                    <span>{new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    {n.is_read && <span className="text-green-600">Read</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSend(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Send Notification</h2>
              <button onClick={() => setShowSend(false)} className="rounded-lg p-1 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Send to</label>
                <select
                  value={form.targetRole}
                  onChange={(e) => setForm({ ...form, targetRole: e.target.value, userId: "" })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="students">All Students</option>
                  <option value="teachers">All Teachers</option>
                  <option value="all">Everyone</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>

              {form.targetRole === "specific" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">User ID</label>
                  <input
                    type="text"
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    placeholder="Paste user UUID"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Notification title"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Notification message"
                  rows={4}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSend(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {sending ? "Sending..." : `Send Notification`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
