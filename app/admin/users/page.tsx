"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, UserPlus, MoreVertical, CheckCircle2, XCircle, Clock, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { appointmentsAsUser: number };
}

const statusBadge: Record<string, string> = {
  true: "bg-green-50 text-green-600",
  false: "bg-slate-100 text-slate-400",
};

const ROLE_TABS = ["All", "USER", "COUNSELLOR", "ADMIN"] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<typeof ROLE_TABS[number]>("All");
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter !== "All") params.set("role", roleFilter);
    if (search) params.set("search", search);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => { setUsers(data.users || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const toggleActive = async (id: string, current: boolean) => {
    setToggling(id);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !current } : u));
    setToggling(null);
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Mobile", "Role", "Status", "Sessions", "Joined"];
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.mobile,
      u.role,
      u.isActive ? "Active" : "Inactive",
      u._count.appointmentsAsUser,
      new Date(u.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500 text-sm">{total} total registered users</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">
            <Download size={15} /> Export CSV
          </button>
          <button className="btn-primary !py-2 !text-sm gap-2">
            <UserPlus size={15} /> Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 flex-1 min-w-48">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="text-sm text-slate-700 outline-none flex-1 bg-transparent placeholder:text-slate-400"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">
          <Filter size={15} /> Filter
        </button>
        {ROLE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setRoleFilter(tab)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              roleFilter === tab ? "bg-brand-purple text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab === "All" ? "All" : tab === "USER" ? "Users" : tab === "COUNSELLOR" ? "Counsellors" : "Admins"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse h-12 bg-slate-50 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Mobile</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Sessions</th>
                  <th className="text-left px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-slate-400 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user.mobile}</td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs ${user.role === "COUNSELLOR" ? "bg-brand-teal-pale text-brand-teal" : "bg-slate-100 text-slate-500"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs flex items-center gap-1 w-fit ${statusBadge[String(user.isActive)]}`}>
                        {user.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {user.isActive ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{user._count.appointmentsAsUser}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(user.id, user.isActive)}
                        disabled={toggling === user.id}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-50"
                        title={user.isActive ? "Deactivate" : "Activate"}
                      >
                        <MoreVertical size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No users found.
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
