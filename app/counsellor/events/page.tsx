"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, MapPin, ExternalLink, Plus, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  date: string;
  time: string | null;
  venue: string | null;
  meetingLink: string | null;
  maxParticipants: number | null;
  _count: { registrations: number };
  isRegistered?: boolean;
}

const typeColor: Record<string, string> = {
  WORKSHOP:   "bg-brand-purple-pale text-brand-purple",
  WEBINAR:    "bg-blue-50 text-blue-600",
  SEMINAR:    "bg-orange-50 text-orange-600",
  GROUP_SESSION: "bg-brand-teal-pale text-brand-teal",
  COMMUNITY:  "bg-indigo-50 text-indigo-600",
};

export default function CounsellorEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "all">("upcoming");
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (id: string, isRegistered: boolean) => {
    if (isRegistered) return;
    setRegistering(id);
    try {
      const res = await fetch(`/api/events/${id}/register`, { method: "POST" });
      if (res.ok) {
        setEvents((prev) => prev.map((e) => e.id === id ? { ...e, isRegistered: true, _count: { registrations: e._count.registrations + 1 } } : e));
      }
    } finally { setRegistering(null); }
  };

  const now = new Date();
  const displayed = activeTab === "upcoming"
    ? events.filter((e) => new Date(e.date) >= now && e.status === "PUBLISHED")
    : events.filter((e) => e.status === "PUBLISHED");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Events & Workshops</h1>
        <p className="text-slate-500 text-sm">Platform events you can join or co-host</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[["upcoming", "Upcoming"], ["all", "All Events"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "upcoming" | "all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === key ? "bg-brand-teal text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-teal/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-48 animate-pulse" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Calendar size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No events found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {displayed.map((event) => {
            const isPast = new Date(event.date) < now;
            const isFull = event.maxParticipants != null && event._count.registrations >= event.maxParticipants;
            return (
              <div key={event.id} className={`bg-white rounded-2xl border p-5 hover:shadow-sm transition-shadow ${event.isRegistered ? "border-brand-teal/30" : "border-slate-100"}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`badge text-xs ${typeColor[event.type] || "bg-slate-100 text-slate-500"}`}>
                    {event.type.replace(/_/g, " ")}
                  </span>
                  {event.isRegistered && (
                    <span className="badge text-xs bg-brand-teal-pale text-brand-teal">Registered</span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 leading-snug">{event.title}</h3>
                {event.description && (
                  <p className="text-slate-500 text-xs mb-3 line-clamp-2">{event.description}</p>
                )}
                <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} /> {formatDate(event.date)}{event.time ? ` at ${event.time}` : ""}
                  </span>
                  {event.venue && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={11} /> {event.venue}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users size={11} /> {event._count.registrations}
                    {event.maxParticipants ? ` / ${event.maxParticipants}` : ""} registered
                  </span>
                </div>
                <div className="flex gap-2">
                  {event.meetingLink && event.isRegistered ? (
                    <a href={event.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="flex-1 btn-teal !py-1.5 !text-xs flex items-center justify-center gap-1">
                      <ExternalLink size={11} /> Join Event
                    </a>
                  ) : !isPast && !event.isRegistered ? (
                    <button
                      onClick={() => handleRegister(event.id, !!event.isRegistered)}
                      disabled={registering === event.id || isFull}
                      className="flex-1 btn-primary !py-1.5 !text-xs disabled:opacity-50"
                    >
                      {isFull ? "Full" : registering === event.id ? "..." : "Register"}
                    </button>
                  ) : isPast ? (
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11} /> Past event</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
