"use client";

import { useEffect, useState } from "react";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { motion } from "framer-motion";
import { Bell, Loader2, ChevronRight } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

type Notification = {
  id: string;
  title: string;
  message: string;
  target_role: string | null;
  user_ids: string[] | null;
  created_at: string;
  read: boolean;
};

export default function StudentNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isSupabaseAdminConfigured) { setLoading(false); return; }
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabaseAdmin
      .from("notifications")
      .select("id, title, message, target_role, user_ids, created_at")
      .or(`user_ids.cs.{${user.id}},target_role.eq.all,target_role.eq.student`)
      .order("created_at", { ascending: false });

    if (data) setNotifications(data);
    setLoading(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <BackButton label="Dashboard" href="/dashboard/study" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Bell className="h-5 w-5 text-purple-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Updates from your teachers</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-gray-400">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{n.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-gray-500 line-clamp-2">{n.message}</p>
                  <p className="mt-1.5 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
