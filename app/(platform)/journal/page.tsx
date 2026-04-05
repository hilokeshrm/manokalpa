"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/platform/TopBar";
import { Plus, BookOpen, Calendar, Tag, Edit2, Trash2, X, ChevronDown } from "lucide-react";

interface Reflection {
  id: string;
  thought: string;
  feeling?: string | null;
  reaction?: string | null;
  reframe?: string | null;
  rating?: number | null;
  tags: string[];
  createdAt: string;
}

const moodEmoji = ["", "😔", "😟", "😐", "😊", "😄"];

function formatEntryDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function JournalPage() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [newEntry, setNewEntry] = useState({ thought: "", feeling: "", reaction: "", reframe: "", mood: 3 });
  const [editingEntry, setEditingEntry] = useState<Reflection | null>(null);
  const [editForm, setEditForm] = useState({ thought: "", feeling: "", reaction: "", reframe: "", mood: 3, tags: "" });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then((data) => setReflections(data.reflections || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!newEntry.thought.trim()) return;
    setSaving(true);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thought: newEntry.thought,
          feeling: newEntry.feeling || null,
          reaction: newEntry.reaction || null,
          reframe: newEntry.reframe || null,
          rating: newEntry.mood,
          tags,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReflections((prev) => [data.reflection, ...prev]);
        setNewEntry({ thought: "", feeling: "", reaction: "", reframe: "", mood: 3 });
        setTagsInput("");
        setShowNew(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (entry: Reflection) => {
    setEditingEntry(entry);
    setEditForm({
      thought: entry.thought,
      feeling: entry.feeling || "",
      reaction: entry.reaction || "",
      reframe: entry.reframe || "",
      mood: entry.rating ?? 3,
      tags: entry.tags.join(", "),
    });
  };

  const handleUpdate = async () => {
    if (!editingEntry || !editForm.thought.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/journal/${editingEntry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thought: editForm.thought,
          feeling: editForm.feeling || null,
          reaction: editForm.reaction || null,
          reframe: editForm.reframe || null,
          rating: editForm.mood,
          tags: editForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReflections((prev) => prev.map((r) => r.id === editingEntry.id ? data.reflection : r));
        setEditingEntry(null);
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this journal entry?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/journal/${id}`, { method: "DELETE" });
      setReflections((prev) => prev.filter((r) => r.id !== id));
    } finally { setDeleting(null); }
  };

  return (
    <>
      <TopBar pageTitle="Reflection Journal" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">{reflections.length} entries total</p>
          <button onClick={() => setShowNew(!showNew)} className="btn-primary !py-2 !text-sm gap-2">
            <Plus size={15} /> New Entry
          </button>
        </div>

        {/* New entry form */}
        {showNew && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-display font-bold text-slate-900 mb-5">Today&apos;s Reflection</h3>

            {/* Mood selector */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">How are you feeling? (1–5)</label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    onClick={() => setNewEntry({ ...newEntry, mood: m })}
                    className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all border ${
                      newEntry.mood === m
                        ? "border-brand-purple bg-brand-purple-pale scale-110"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {moodEmoji[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: "thought", label: "What's on your mind?", placeholder: "Write your thought freely...", required: true },
                { key: "feeling", label: "How does it make you feel?", placeholder: "Describe your emotions..." },
                { key: "reaction", label: "How did you react?", placeholder: "What did you do or say?" },
                { key: "reframe", label: "Reframe it positively", placeholder: "A more balanced perspective..." },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    value={newEntry[key as keyof typeof newEntry] as string}
                    onChange={(e) => setNewEntry({ ...newEntry, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="input-field resize-none"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="work, stress, gratitude..."
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving || !newEntry.thought.trim()}
                className="btn-primary gap-2 disabled:opacity-50"
              >
                <BookOpen size={15} /> {saving ? "Saving..." : "Save Entry"}
              </button>
              <button onClick={() => setShowNew(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="font-display text-lg font-bold text-slate-900">Edit Entry</h2>
                <button onClick={() => setEditingEntry(null)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"><X size={15} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  {[1,2,3,4,5].map((m) => (
                    <button key={m} onClick={() => setEditForm((f) => ({ ...f, mood: m }))}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all border ${editForm.mood === m ? "border-brand-purple bg-brand-purple-pale scale-110" : "border-slate-200"}`}>
                      {moodEmoji[m]}
                    </button>
                  ))}
                </div>
                {[
                  { key: "thought", label: "What's on your mind?", required: true },
                  { key: "feeling", label: "How does it make you feel?" },
                  { key: "reaction", label: "How did you react?" },
                  { key: "reframe", label: "Reframe it positively" },
                ].map(({ key, label, required }) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
                    <textarea rows={3} value={editForm[key as keyof typeof editForm] as string}
                      onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="input-field resize-none w-full" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Tags</label>
                  <input type="text" value={editForm.tags} onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))} placeholder="work, stress, gratitude..." className="input-field w-full" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleUpdate} disabled={saving || !editForm.thought.trim()} className="btn-primary gap-2 disabled:opacity-50">
                    <BookOpen size={14} /> {saving ? "Saving..." : "Update Entry"}
                  </button>
                  <button onClick={() => setEditingEntry(null)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-32" />
            ))}
          </div>
        ) : reflections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No journal entries yet</p>
            <p className="text-slate-400 text-sm mt-1">Start writing your first reflection above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reflections.map((entry) => {
              const expanded = expandedId === entry.id;
              return (
                <div key={entry.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{moodEmoji[entry.rating ?? 3]}</span>
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Calendar size={11} />
                          {formatEntryDate(entry.createdAt)}
                        </div>
                        {entry.feeling && (
                          <div className="text-sm font-medium text-slate-700 mt-0.5">{entry.feeling}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setExpandedId(expanded ? null : entry.id)}
                        className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                        <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </button>
                      <button onClick={() => openEdit(entry)}
                        className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-brand-purple-pale hover:text-brand-purple transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} disabled={deleting === entry.id}
                        className="w-7 h-7 rounded-lg bg-slate-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <p className={`text-slate-600 text-sm leading-relaxed mb-3 ${expanded ? "" : "line-clamp-2"}`}>{entry.thought}</p>

                  {expanded && (
                    <div className="space-y-3 mb-3">
                      {entry.reaction && (
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-slate-400 text-xs mb-0.5">Reaction</p>
                          <p className="text-slate-700 text-sm">{entry.reaction}</p>
                        </div>
                      )}
                      {entry.reframe && (
                        <div className="bg-brand-teal-pale rounded-xl p-3">
                          <p className="text-brand-teal text-xs font-medium mb-0.5">Reframe</p>
                          <p className="text-slate-700 text-sm">{entry.reframe}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!expanded && entry.reframe && (
                    <div className="bg-brand-teal-pale rounded-xl p-3 mb-3">
                      <p className="text-brand-teal text-xs font-medium mb-0.5">Reframe</p>
                      <p className="text-slate-700 text-sm line-clamp-1">{entry.reframe}</p>
                    </div>
                  )}

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">
                          <Tag size={9} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
