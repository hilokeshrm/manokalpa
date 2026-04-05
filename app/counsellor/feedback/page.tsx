"use client";

import { useState, useEffect } from "react";
import { Star, Users, CalendarCheck, TrendingUp, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface FeedbackData {
  rating: number;
  totalRatings: number;
  completedSessions: number;
  level: string;
  recentClients: {
    id: string;
    clientName: string;
    clientAvatar?: string | null;
    date: string;
    sessionType: string;
    amount: number;
  }[];
}

const levelConfig: Record<string, { label: string; color: string }> = {
  ASSOCIATE: { label: "Associate",   color: "bg-slate-100 text-slate-600" },
  PRACTITIONER: { label: "Practitioner", color: "bg-brand-purple-pale text-brand-purple" },
  SENIOR:    { label: "Senior",      color: "bg-brand-teal-pale text-brand-teal" },
  LEAD:      { label: "Lead",        color: "bg-orange-50 text-orange-600" },
  PRINCIPAL: { label: "Principal",   color: "bg-yellow-50 text-yellow-700" },
};

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(value);
        const half = !filled && i < value;
        return (
          <Star
            key={i}
            size={16}
            className={filled || half ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"}
          />
        );
      })}
    </div>
  );
}

export default function CounsellorFeedbackPage() {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/counsellor/feedback")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="h-8 bg-slate-100 rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-28 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const lvl = levelConfig[data?.level || "ASSOCIATE"] || levelConfig.ASSOCIATE;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Performance</h1>
        <p className="text-slate-500 text-sm">Client satisfaction & session history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center mb-3">
            <Star size={18} className="text-yellow-500 fill-yellow-500" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{(data?.rating ?? 0).toFixed(1)}</p>
          <p className="text-slate-500 text-sm">Average Rating</p>
          {data && data.rating > 0 && (
            <div className="mt-1.5">
              <StarRating value={data.rating} />
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-brand-purple-pale flex items-center justify-center mb-3">
            <Users size={18} className="text-brand-purple" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{data?.totalRatings ?? 0}</p>
          <p className="text-slate-500 text-sm">Total Ratings</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-brand-teal-pale flex items-center justify-center mb-3">
            <CalendarCheck size={18} className="text-brand-teal" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{data?.completedSessions ?? 0}</p>
          <p className="text-slate-500 text-sm">Sessions Done</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
            <Award size={18} className="text-orange-500" />
          </div>
          <p className="font-display text-xl font-bold text-slate-900">{lvl.label}</p>
          <p className="text-slate-500 text-sm">Counsellor Level</p>
          <span className={`badge text-xs mt-1 ${lvl.color}`}>{data?.level}</span>
        </div>
      </div>

      {/* Rating breakdown placeholder */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-purple" /> Rating Breakdown
        </h3>
        {(data?.totalRatings ?? 0) === 0 ? (
          <div className="text-center py-6">
            <Star size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No ratings yet. Complete sessions to receive feedback.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              // Distribute ratings with higher weight on the average
              const dist = Math.max(0, Math.round((data!.totalRatings / 5) * (star === Math.round(data!.rating) ? 0.5 : star > data!.rating ? 0.1 : 0.15)));
              const pct = data!.totalRatings > 0 ? Math.round((dist / data!.totalRatings) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-4 text-right">{star}</span>
                  <Star size={11} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 w-8">{dist}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent completed sessions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Recent Completed Sessions</h3>
        {!data?.recentClients.length ? (
          <p className="text-slate-400 text-sm">No completed sessions yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recentClients.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {c.clientName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{c.clientName}</p>
                  <p className="text-xs text-slate-400">{formatDate(c.date)} · {c.sessionType.replace(/_/g, " ")}</p>
                </div>
                {c.amount > 0 && (
                  <span className="text-sm font-semibold text-slate-900 flex-shrink-0">
                    ₹{Math.round(c.amount / 100).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
