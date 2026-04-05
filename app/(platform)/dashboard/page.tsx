"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/platform/TopBar";
import { useUser } from "@/components/providers/UserProvider";
import {
  CalendarCheck, TrendingUp, BookOpen, Star,
  ArrowRight, Clock, CheckCircle2, Smile, Meh, Frown,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";

interface Appointment {
  id: string;
  date: string;
  time: string;
  duration: number;
  sessionType: string;
  meetingLink?: string | null;
  counsellor: { name: string };
}

interface Activity {
  text: string;
  time: string;
  color: string;
  icon: string;
}

const moodOptions = [
  { icon: Smile, label: "Great", value: 5, color: "text-green-500 hover:bg-green-50" },
  { icon: Smile, label: "Good", value: 4, color: "text-brand-teal hover:bg-brand-teal-pale" },
  { icon: Meh, label: "Okay", value: 3, color: "text-yellow-500 hover:bg-yellow-50" },
  { icon: Frown, label: "Low", value: 2, color: "text-orange-500 hover:bg-orange-50" },
  { icon: Frown, label: "Struggling", value: 1, color: "text-red-500 hover:bg-red-50" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [nextSession, setNextSession] = useState<Appointment | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);

  const firstName = user?.name?.split(" ")[0] || "there";
  const sessionsCount = user?._count?.appointmentsAsUser ?? 0;
  const journalCount = user?._count?.reflections ?? 0;

  useEffect(() => {
    // Fetch upcoming appointment
    fetch("/api/appointments?status=CONFIRMED,PENDING")
      .then((r) => r.json())
      .then((data) => {
        if (data.appointments?.length > 0) {
          // Get soonest future appointment
          const upcoming = data.appointments
            .filter((a: Appointment) => new Date(a.date) >= new Date())
            .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setNextSession(upcoming[0] || null);
        }
      })
      .catch(() => {});

    // Fetch recent journal entries as activities
    fetch("/api/journal")
      .then((r) => r.json())
      .then((data) => {
        if (data.reflections) {
          const acts: Activity[] = data.reflections.slice(0, 3).map((r: { feeling?: string; createdAt: string }) => ({
            text: `Journal entry: ${r.feeling || "reflection"}`,
            time: timeAgo(r.createdAt),
            color: "text-blue-500",
            icon: "journal",
          }));
          setActivities(acts);
        }
      })
      .catch(() => {});
  }, []);

  const handleMoodSave = async (moodValue: number) => {
    setSelectedMood(moodValue);
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thought: `Mood check-in: ${moodOptions.find((m) => m.value === moodValue)?.label}`,
          rating: moodValue,
        }),
      });
      setMoodSaved(true);
    } catch {}
  };

  const stats = [
    {
      label: "Sessions Completed",
      value: sessionsCount.toString(),
      change: "total sessions",
      icon: CalendarCheck,
      color: "bg-brand-purple-pale text-brand-purple",
    },
    {
      label: "Wellness Score",
      value: "—",
      change: "take an assessment",
      icon: TrendingUp,
      color: "bg-brand-teal-pale text-brand-teal",
    },
    {
      label: "Journal Entries",
      value: journalCount.toString(),
      change: "total entries",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Avg. Session Rating",
      value: "—",
      change: "rate your sessions",
      icon: Star,
      color: "bg-yellow-50 text-yellow-600",
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <TopBar pageTitle="Dashboard" />
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* Welcome banner */}
        <div className="bg-gradient-to-br from-brand-purple to-indigo-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10">
            <p className="text-white/70 text-sm mb-1">{greeting},</p>
            <h2 className="font-display text-2xl font-bold mb-2">Welcome back, {firstName}! 👋</h2>
            <p className="text-white/70 text-sm max-w-md">
              {nextSession
                ? `You have a session on ${formatDate(nextSession.date)} at ${formatTime(nextSession.time)}.`
                : "You have no upcoming sessions. Book one to continue your wellness journey."}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/appointments" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-brand-purple text-sm font-semibold hover:bg-brand-purple-pale transition-colors">
                <CalendarCheck size={15} />
                {nextSession ? "View Session" : "Book Session"}
              </Link>
              <Link href="/journal" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-medium hover:bg-white/25 transition-colors">
                <BookOpen size={15} />
                Add Journal Entry
              </Link>
            </div>
          </div>
        </div>

        {/* Mood check-in */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 mb-4 text-sm">
            {moodSaved ? "Mood logged ✓" : "How are you feeling today?"}
          </h3>
          {moodSaved ? (
            <p className="text-slate-500 text-sm">
              Your mood has been saved to your journal.{" "}
              <Link href="/journal" className="text-brand-purple hover:underline">View entries →</Link>
            </p>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {moodOptions.map(({ icon: Icon, label, value, color }) => (
                <button
                  key={label}
                  onClick={() => handleMoodSave(value)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${
                    selectedMood === value ? "border-brand-purple bg-brand-purple-pale" : "border-transparent hover:border-slate-200"
                  } ${color}`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-medium text-slate-600">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={20} />
              </div>
              <div className="font-display font-bold text-2xl text-slate-900 mb-0.5">{value}</div>
              <div className="text-slate-500 text-xs mb-1">{label}</div>
              <div className="text-slate-400 text-xs">{change}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Next session */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-sm">Next Session</h3>
              <Link href="/appointments" className="text-xs text-brand-purple flex items-center gap-1 hover:gap-2 transition-all">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {nextSession ? (
              <div className="bg-brand-purple-pale rounded-xl p-4">
                <div className="font-semibold text-brand-purple mb-1">{nextSession.counsellor.name}</div>
                <div className="text-slate-600 text-sm mb-3">{nextSession.sessionType.replace(/_/g, " ")}</div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CalendarCheck size={12} /> {formatDate(nextSession.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatTime(nextSession.time)} · {nextSession.duration}min
                  </span>
                </div>
                {nextSession.meetingLink ? (
                  <a
                    href={nextSession.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full py-2 rounded-lg bg-brand-purple text-white text-xs font-semibold hover:bg-brand-purple-light transition-colors block text-center"
                  >
                    Join Session
                  </a>
                ) : (
                  <button className="mt-4 w-full py-2 rounded-lg bg-brand-purple/40 text-white text-xs font-medium cursor-not-allowed block">
                    Link pending
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-slate-500 text-sm mb-3">No upcoming sessions</p>
                <Link href="/appointments/book" className="btn-primary !py-2 !text-xs">
                  Book a Session
                </Link>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 lg:col-span-2">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">Recent Activity</h3>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((act, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 ${act.color}`}>
                      <BookOpen size={15} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-slate-700">{act.text}</div>
                      <div className="text-xs text-slate-400">{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No recent activity yet.</p>
                <p className="text-slate-400 text-xs mt-1">Start by booking a session or writing in your journal.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Book a Session", href: "/appointments/book", emoji: "📅", color: "bg-brand-purple-pale text-brand-purple" },
              { label: "Start Assessment", href: "/assessments", emoji: "📋", color: "bg-brand-teal-pale text-brand-teal" },
              { label: "Write in Journal", href: "/journal", emoji: "✍️", color: "bg-blue-50 text-blue-600" },
              { label: "Browse Content", href: "/content", emoji: "🎧", color: "bg-amber-50 text-amber-600" },
            ].map(({ label, href, emoji, color }) => (
              <Link
                key={label}
                href={href}
                className={`${color} rounded-2xl p-5 flex flex-col items-center gap-2 hover:shadow-md transition-all text-center`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
