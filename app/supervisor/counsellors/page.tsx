"use client";

import { useState, useEffect } from "react";
import { Star, Briefcase, FileText, CheckCircle2 } from "lucide-react";

interface Counsellor {
  id: string;
  userId: string;
  tagline: string | null;
  rating: number;
  totalRatings: number;
  experience: number;
  isVerified: boolean;
  isAvailable: boolean;
  level: string;
  user: { name: string; email: string };
  reportCount: number;
  appointmentCount: number;
}

export default function SupervisorCounsellorsPage() {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/supervisor/counsellors")
      .then((r) => r.json())
      .then((data) => setCounsellors(data.counsellors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Counsellors</h1>
        <p className="text-slate-500 text-sm">Overview of all registered counsellors.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-100 h-24" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {counsellors.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-teal to-emerald-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {c.user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{c.user.name}</h3>
                    {c.isVerified && (
                      <span className="badge text-xs bg-green-50 text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    )}
                    <span className="badge text-xs bg-brand-purple-pale text-brand-purple">{c.level}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{c.tagline || c.user.email}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      {c.rating.toFixed(1)} ({c.totalRatings} ratings)
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={12} /> {c.experience} yrs exp
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {c.reportCount} reports
                    </span>
                    <span>{c.appointmentCount} appointments</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {counsellors.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center text-slate-400 text-sm">
              No counsellors found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
