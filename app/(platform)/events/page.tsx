"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/platform/TopBar";
import { Calendar, Clock, MapPin, Users, Video, Radio, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  date: string;
  venue?: string | null;
  meetingLink?: string | null;
  capacity?: number | null;
  price: number;
  category?: string | null;
  _count: { registrations: number };
  registrations?: { id: string }[];
}

const typeIcons: Record<string, React.ElementType> = {
  ONLINE: Video,
  OFFLINE: MapPin,
  HYBRID: Users,
};

const typeColors: Record<string, string> = {
  ONLINE: "bg-brand-purple-pale text-brand-purple",
  OFFLINE: "bg-brand-teal-pale text-brand-teal",
  HYBRID: "bg-orange-50 text-orange-600",
};

const TABS = ["All", "Webinar", "Workshop", "Group", "Online"] as const;

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        const evs: Event[] = data.events || [];
        setEvents(evs);
        // Collect already-registered event IDs
        const ids = new Set(
          evs.filter((e) => e.registrations && e.registrations.length > 0).map((e) => e.id)
        );
        setRegisteredIds(ids);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method: "POST" });
      if (res.ok) {
        setRegisteredIds((prev) => new Set([...prev, eventId]));
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, _count: { registrations: e._count.registrations + 1 } }
              : e
          )
        );
      }
    } finally {
      setRegistering(null);
    }
  };

  return (
    <>
      <TopBar pageTitle="Events & Community" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === "All"
                  ? "bg-brand-purple text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-brand-purple/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Calendar size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No upcoming events. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const Icon = typeIcons[event.type] || Video;
              const colorClass = typeColors[event.type] || "bg-blue-50 text-blue-600";
              const isRegistered = registeredIds.has(event.id);
              const spotsLeft = event.capacity ? event.capacity - event._count.registrations : null;

              return (
                <div key={event.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={22} />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{event.title}</h3>
                        {event.price === 0 && (
                          <span className="badge bg-brand-teal-pale text-brand-teal text-xs">Free</span>
                        )}
                        {isRegistered && (
                          <span className="badge bg-brand-purple-pale text-brand-purple text-xs">Registered</span>
                        )}
                      </div>
                      {event.category && (
                        <p className="text-slate-500 text-sm mb-2">{event.category} · {event.type}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={11} /> {formatDate(event.date)}
                        </span>
                        {event.venue && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={11} /> {event.venue}
                          </span>
                        )}
                        {event.meetingLink && (
                          <span className="flex items-center gap-1.5">
                            <Video size={11} /> Online
                          </span>
                        )}
                      </div>
                      {spotsLeft !== null && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <div className="flex-1 max-w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-teal rounded-full"
                              style={{ width: `${(event._count.registrations / event.capacity!) * 100}%` }}
                            />
                          </div>
                          <span>{spotsLeft} spots left</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {isRegistered ? (
                        event.meetingLink ? (
                          <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-teal !py-2 !text-sm gap-1.5 inline-flex items-center">
                            <Video size={14} /> Join
                          </a>
                        ) : (
                          <span className="px-4 py-2 rounded-xl bg-brand-teal-pale text-brand-teal text-sm font-medium">Registered ✓</span>
                        )
                      ) : (
                        <button
                          onClick={() => handleRegister(event.id)}
                          disabled={registering === event.id || spotsLeft === 0}
                          className="btn-primary !py-2 !text-sm gap-1.5 disabled:opacity-50"
                        >
                          {registering === event.id ? "..." : "Register"} <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
