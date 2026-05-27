"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user || hasFetched.current) return;
    hasFetched.current = true;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAsRead(ids: string[]) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - ids.length));
  }

  function typeColor(type: string) {
    switch (type) {
      case "live_class":
        return "bg-red-100 text-red-600";
      case "new_lecture":
        return "bg-blue-100 text-blue-600";
      case "payment":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative text-white/60 hover:text-white transition-colors p-1"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed max-sm:inset-x-4 max-sm:top-16 absolute sm:right-0 sm:top-10 w-[360px] max-sm:w-auto rounded-lg border border-gray-100 bg-white shadow-xl"
          style={{ maxHeight: "70vh" }}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() =>
                  markAsRead(notifications.filter((n) => !n.is_read).map((n) => n.id))
                }
                className="text-xs text-[#5c35d9] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 48px)" }}>
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 border-b border-gray-50 px-4 py-3 transition-colors ${
                    n.is_read ? "bg-white" : "bg-purple-50/40"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={n.action_url || "#"}
                      onClick={() => markAsRead([n.id])}
                      className="block"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase leading-none ${typeColor(n.type)}`}
                        >
                          {n.type === "live_class" ? "LIVE" : n.type === "new_lecture" ? "LECTURE" : n.type}
                        </span>
                        {!n.is_read && <span className="h-2 w-2 rounded-full bg-[#5c35d9] shrink-0" />}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleString("en-IN")}
                      </p>
                    </a>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead([n.id])}
                      className="shrink-0 mt-1 text-gray-300 hover:text-gray-500"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
