"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarCheck, Clock, CheckCircle2, XCircle, Search, Video } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminAppointment {
  id: string;
  date: string;
  time: string;
  sessionType: string;
  status: string;
  meetingLink: string | null;
  notes: string | null;
  user: { id: string; name: string; email: string };
  counsellor: { id: string; name: string; email: string };
  payment: { status: string; amount: number } | null;
}

const STATUS_TABS = ["All", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  PENDING: { color: "bg-orange-50 text-orange-600", label: "Pending", icon: Clock },
  CONFIRMED: { color: "bg-brand-purple-pale text-brand-purple", label: "Confirmed", icon: CalendarCheck },
  COMPLETED: { color: "bg-green-50 text-green-600", label: "Completed", icon: CheckCircle2 },
  CANCELLED: { color: "bg-slate-100 text-slate-400", label: "Cancelled", icon: XCircle },
  NO_SHOW: { color: "bg-red-50 text-red-500", label: "No Show", icon: XCircle },
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>("All");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== "All") params.set("status", activeTab);
    if (search) params.set("search", search);
    fetch(`/api/admin/appointments?${params}`)
      .then((r) => r.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  useEffect(() => {
    const t = setTimeout(fetchAppointments, 300);
    return () => clearTimeout(t);
  }, [fetchAppointments]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    setUpdating(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 text-sm mt-0.5">{appointments.length} shown</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 flex-1 min-w-48">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or counsellor..."
            className="text-sm text-slate-700 outline-none flex-1 bg-transparent placeholder:text-slate-400"
          />
        </div>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-brand-purple text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab === "All" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
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
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Counsellor</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-left px-5 py-3 font-medium">Date & Time</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((appt) => {
                  const cfg = statusConfig[appt.status] || statusConfig.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{appt.user.name}</div>
                        <div className="text-slate-400 text-xs">{appt.user.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-700">{appt.counsellor.name}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="badge bg-slate-100 text-slate-500 text-xs">
                          {appt.sessionType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-xs">
                        <div>{formatDate(appt.date)}</div>
                        <div className="text-slate-400">{appt.time}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge text-xs flex items-center gap-1 w-fit ${cfg.color}`}>
                          <StatusIcon size={10} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {appt.payment ? (
                          <span className={`badge text-xs ${
                            appt.payment.status === "VERIFIED" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500"
                          }`}>
                            ₹{Math.round(appt.payment.amount / 100).toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {appt.status === "PENDING" && (
                            <button
                              onClick={() => updateStatus(appt.id, "CONFIRMED")}
                              disabled={updating === appt.id}
                              className="text-xs text-brand-teal border border-brand-teal/30 px-2.5 py-1 rounded-lg hover:bg-brand-teal-pale disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          )}
                          {appt.meetingLink && (
                            <a href={appt.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-purple border border-brand-purple/30 px-2.5 py-1 rounded-lg hover:bg-brand-purple-pale inline-flex items-center gap-1">
                              <Video size={11} /> Join
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No appointments found.
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
