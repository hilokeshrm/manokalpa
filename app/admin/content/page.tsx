"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Video, Headphones, Eye, Edit2, Trash2, Search, X, Globe, FileText } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  category: string | null;
  tags: string[];
  views: number;
  createdAt: string;
  publishedAt: string | null;
  author: { name: string } | null;
  _count: { feedback: number };
}

const typeIcon: Record<string, React.ElementType> = { BLOG: BookOpen, VIDEO: Video, AUDIO: Headphones };
const typeColor: Record<string, string> = {
  BLOG: "bg-brand-purple-pale text-brand-purple",
  VIDEO: "bg-orange-50 text-orange-600",
  AUDIO: "bg-brand-teal-pale text-brand-teal",
};
const TYPES = ["All", "BLOG", "VIDEO", "AUDIO"];

const emptyForm = { title: "", type: "BLOG", body: "", category: "", tags: "", status: "DRAFT" };

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeType !== "All") params.set("type", activeType);
    if (search) params.set("search", search);
    fetch(`/api/admin/content?${params}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [activeType, search]); // eslint-disable-line

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      type: item.type,
      body: "",
      category: item.category || "",
      tags: item.tags.join(", "),
      status: item.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const body = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        ...(editing ? { id: editing.id } : {}),
      };
      const res = await fetch("/api/admin/content", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowModal(false); load(); }
    } finally { setSaving(false); }
  };

  const handleTogglePublish = async (item: ContentItem) => {
    const newStatus = item.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status: newStatus }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content item?")) return;
    setDeleting(id);
    await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setContent((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Content Management</h1>
          <p className="text-slate-500 text-sm">{content.length} items</p>
        </div>
        <button onClick={openCreate} className="btn-primary !py-2 !text-sm gap-2">
          <Plus size={15} /> Add Content
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 flex-1 min-w-48">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content..."
            className="text-sm text-slate-700 outline-none flex-1 bg-transparent placeholder:text-slate-400"
          />
        </div>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeType === t ? "bg-brand-purple text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-28 bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No content found</p>
          <button onClick={openCreate} className="btn-primary !py-2 !text-sm mt-4 inline-flex gap-2">
            <Plus size={14} /> Create First Article
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {content.map((item) => {
            const Icon = typeIcon[item.type] || FileText;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-sm transition-shadow">
                <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                  <Icon size={28} className="text-slate-400" />
                  <button
                    onClick={() => handleTogglePublish(item)}
                    title={item.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      item.status === "PUBLISHED"
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                    }`}
                  >
                    <Globe size={12} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`badge text-xs ${typeColor[item.type] || "bg-slate-100 text-slate-500"}`}>{item.type}</span>
                    <span className={`badge text-xs ${item.status === "PUBLISHED" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-slate-400 text-xs mb-3">{item.author?.name || "—"}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><Eye size={10} /> {item.views}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 size={11} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editing ? "Edit Content" : "New Content"}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Article or video title"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple bg-white"
                  >
                    <option value="BLOG">Blog</option>
                    <option value="VIDEO">Video</option>
                    <option value="AUDIO">Audio / Podcast</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple bg-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Mindfulness, CBT, Sleep"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. anxiety, breathing, stress"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple"
                />
              </div>
              {form.type === "BLOG" && (
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Body / Summary</label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    rows={5}
                    placeholder="Write the article content..."
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple resize-none"
                  />
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Content"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
