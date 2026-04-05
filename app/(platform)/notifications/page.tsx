"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/platform/TopBar";
import { Bell, CalendarCheck, CheckCircle2, BookOpen, Clock, Star, Calendar } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  EMAIL: { icon: Bell, color: "bg-slate-100 text-slate-500" },
  SMS: { icon: Bell, color: "bg-slate-100 text-slate-500" },
  PUSH: { icon: Bell, color: "bg-slate-100 text-slate-500" },
  IN_APP: { icon: Bell, color: "bg-brand-purple-pale text-brand-purple" },
  appointment: { icon: CalendarCheck, color: "bg-brand-purple-pale text-brand-purple" },
  reminder: { icon: Clock, color: "bg-blue-50 text-blue-600" },
  content: { icon: BookOpen, color: "bg-brand-teal-pale text-brand-teal" },
  assessment: { icon: CheckCircle2, color: "bg-amber-50 text-amber-600" },
  event: { icon: Calendar, color: "bg-orange-50 text-orange-600" },
  rating: { icon: Star, color: "bg-yellow-50 text-yellow-600" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unread = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <>
      <TopBar pageTitle="Notifications" />
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">{unread} unread notification{unread !== 1 ? "s" : ""}</p>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-sm text-brand-purple hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Bell size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.IN_APP;
              const Icon = cfg.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`w-full flex gap-4 bg-white rounded-2xl border p-4 transition-all text-left ${
                    n.isRead
                      ? "border-slate-100 opacity-70"
                      : "border-brand-purple/20 shadow-sm shadow-brand-purple/5 hover:shadow-md"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{n.title}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-slate-400 text-xs">{timeAgo(n.createdAt)}</span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-purple flex-shrink-0" />}
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed mt-1">{n.body}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
