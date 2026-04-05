"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Star, UserCheck, MoreVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminCounsellor {
  id: string;
  isVerified: boolean;
  rating: number;
  experience: number;
  expertise: string[];
  user: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    isActive: boolean;
    createdAt: string;
  };
  _count?: { earnings: number };
}

export default function AdminCounsellorPage() {
  const [counsellors, setCounsellors] = useState<AdminCounsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/counsellors")
      .then((r) => r.json())
      .then((data) => setCounsellors(data.counsellors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleVerify = async (id: string, current: boolean) => {
    setVerifying(id);
    await fetch("/api/admin/counsellors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counsellorId: id, isVerified: !current }),
    });
    setCounsellors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isVerified: !current } : c))
    );
    setVerifying(null);
  };

  const pendingCount = counsellors.filter((c) => !c.isVerified).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Counsellors</h1>
          <p className="text-slate-500 text-sm">{counsellors.length} registered counsellors</p>
        </div>
        {pendingCount > 0 && (
          <span className="badge bg-orange-50 text-orange-600 text-xs">
            {pendingCount} pending verification
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse h-14 bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Counsellor</th>
                  <th className="text-left px-5 py-3 font-medium">Expertise</th>
                  <th className="text-left px-5 py-3 font-medium">Rating</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {counsellors.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {c.user.name.split(" ").pop()![0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{c.user.name}</div>
                          <div className="text-slate-400 text-xs">{c.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs max-w-[200px]">
                      {c.expertise.slice(0, 3).join(", ") || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {c.rating > 0 ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                          <Star size={13} className="text-yellow-400 fill-yellow-400" /> {c.rating.toFixed(1)}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs flex items-center gap-1 w-fit ${
                        c.isVerified ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                      }`}>
                        {c.isVerified ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {c.isVerified ? "verified" : "pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(c.user.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleVerify(c.id, c.isVerified)}
                          disabled={verifying === c.id}
                          className={`text-xs border px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                            c.isVerified
                              ? "text-slate-500 border-slate-200 hover:bg-slate-50"
                              : "text-brand-teal border-brand-teal/30 hover:bg-brand-teal-pale"
                          }`}
                        >
                          <UserCheck size={12} className="inline mr-1" />
                          {c.isVerified ? "Unverify" : "Verify"}
                        </button>
                        <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {counsellors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No counsellors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
