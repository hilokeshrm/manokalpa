"use client";

import { useState, useEffect } from "react";
import { Users, Search, CalendarCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar?: string | null;
  sessions: number;
  lastSession: string;
  sessionTypes: string[];
}

export default function CounsellorClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/counsellor/clients")
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My Clients</h1>
          <p className="text-slate-500 text-sm mt-0.5">{clients.length} total clients</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 max-w-sm">
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="text-sm text-slate-700 outline-none flex-1 bg-transparent placeholder:text-slate-400"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-36" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Users size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">{search ? "No clients match your search." : "No clients yet."}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div key={client.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                  {client.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{client.name}</div>
                  <div className="text-slate-400 text-xs truncate">{client.email}</div>
                  <div className="text-slate-400 text-xs">{client.mobile}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {client.sessionTypes.slice(0, 2).map((t) => (
                  <span key={t} className="badge bg-brand-teal-pale text-brand-teal text-xs">
                    {t.replace(/_/g, " ")}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <CalendarCheck size={11} /> {client.sessions} session{client.sessions !== 1 ? "s" : ""}
                </span>
                <span>Last: {formatDate(client.lastSession)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
