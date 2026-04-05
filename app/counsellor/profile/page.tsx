"use client";

import { useState, useEffect } from "react";
import { Edit2, Save, X, Star, CheckCircle2, Languages, DollarSign, Briefcase, Calendar } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";

interface CounsellorProfile {
  id: string;
  bio: string | null;
  tagline: string | null;
  expertise: string[];
  qualifications: string[];
  languages: string[];
  consultationFee: number;
  isAvailable: boolean;
  isVerified: boolean;
  rating: number;
  totalRatings: number;
  experience: number;
  level: string;
  user: { id: string; name: string; email: string; mobile: string; avatar?: string | null };
}

export default function CounsellorProfilePage() {
  const { refresh } = useUser();
  const [profile, setProfile] = useState<CounsellorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    bio: "",
    tagline: "",
    consultationFee: 800,
    isAvailable: true,
    expertiseInput: "",
    expertise: [] as string[],
    languagesInput: "",
    languages: [] as string[],
    qualificationsInput: "",
    qualifications: [] as string[],
  });

  useEffect(() => {
    fetch("/api/counsellor/profile")
      .then((r) => r.json())
      .then((data) => {
        const c: CounsellorProfile = data.counsellor;
        if (c) {
          setProfile(c);
          setForm({
            name: c.user.name,
            bio: c.bio || "",
            tagline: c.tagline || "",
            consultationFee: c.consultationFee,
            isAvailable: c.isAvailable,
            expertiseInput: "",
            expertise: c.expertise,
            languagesInput: "",
            languages: c.languages,
            qualificationsInput: "",
            qualifications: c.qualifications,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/counsellor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          tagline: form.tagline,
          expertise: form.expertise,
          qualifications: form.qualifications,
          languages: form.languages,
          consultationFee: form.consultationFee,
          isAvailable: form.isAvailable,
        }),
      });
      const data = await res.json();
      if (data.counsellor) {
        setProfile(data.counsellor);
        await refresh();
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const addTag = (field: "expertise" | "languages" | "qualifications") => {
    const inputKey = `${field}Input` as keyof typeof form;
    const val = String(form[inputKey]).trim();
    if (!val) return;
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], val],
      [inputKey]: "",
    }));
  };

  const removeTag = (field: "expertise" | "languages" | "qualifications", idx: number) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-8 animate-pulse h-64" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <p className="text-slate-500">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900">My Profile</h1>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-teal !py-2 !text-sm gap-1.5"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
          >
            <Edit2 size={14} /> Edit Profile
          </button>
        )}
      </div>

      {/* Header card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal to-emerald-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {profile.user.name[0]}
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-xl font-bold text-slate-900 border-b border-slate-300 outline-none bg-transparent w-full mb-1"
                placeholder="Your name"
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-900 mb-1">{profile.user.name}</h2>
            )}
            {editing ? (
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="text-slate-500 text-sm border-b border-slate-200 outline-none bg-transparent w-full"
                placeholder="Your tagline (e.g. Counselling Psychologist)"
              />
            ) : (
              <p className="text-slate-500 text-sm">{profile.tagline || profile.user.email}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400 fill-yellow-400" /> {profile.rating.toFixed(1)} ({profile.totalRatings} ratings)</span>
              <span className="flex items-center gap-1"><Briefcase size={12} /> {profile.experience} yrs exp</span>
              {profile.isVerified && (
                <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={12} /> Verified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-3">About</h3>
        {editing ? (
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full text-sm text-slate-700 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-teal resize-none"
            placeholder="Write a short bio about yourself..."
          />
        ) : (
          <p className="text-slate-600 text-sm leading-relaxed">{profile.bio || "No bio added yet."}</p>
        )}
      </div>

      {/* Consultation fee + availability */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Session Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5 flex items-center gap-1">
              <DollarSign size={12} /> Consultation Fee (₹)
            </label>
            {editing ? (
              <input
                type="number"
                value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-teal"
              />
            ) : (
              <p className="text-slate-900 font-semibold">₹{profile.consultationFee.toLocaleString("en-IN")}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">Availability</label>
            {editing ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                  className="w-4 h-4 accent-brand-teal"
                />
                <span className="text-sm text-slate-700">Available for new sessions</span>
              </label>
            ) : (
              <span className={`badge text-xs ${profile.isAvailable ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                {profile.isAvailable ? "Available" : "Not accepting new clients"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tags: expertise, languages, qualifications */}
      {(["expertise", "languages", "qualifications"] as const).map((field) => (
        <div key={field} className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            {field === "expertise" ? <Briefcase size={15} /> : field === "languages" ? <Languages size={15} /> : <CheckCircle2 size={15} />}
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {form[field].map((tag, idx) => (
              <span key={idx} className={`badge text-xs flex items-center gap-1 ${
                field === "expertise" ? "bg-brand-purple-pale text-brand-purple" :
                field === "languages" ? "bg-brand-teal-pale text-brand-teal" :
                "bg-blue-50 text-blue-600"
              }`}>
                {tag}
                {editing && (
                  <button onClick={() => removeTag(field, idx)} className="ml-1 hover:opacity-70">
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}
            {form[field].length === 0 && !editing && (
              <p className="text-slate-400 text-sm">None added yet.</p>
            )}
          </div>
          {editing && (
            <div className="flex gap-2">
              <input
                value={String(form[`${field}Input` as keyof typeof form])}
                onChange={(e) => setForm({ ...form, [`${field}Input`]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addTag(field)}
                placeholder={`Add ${field.slice(0, -1)}...`}
                className="text-sm flex-1 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-brand-teal"
              />
              <button
                onClick={() => addTag(field)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors"
              >
                Add
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Availability Schedule */}
      <AvailabilitySection />
    </div>
  );
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function AvailabilitySection() {
  const [schedule, setSchedule] = useState<{ id: string; dayOfWeek: number; startTime: string; endTime: string; slotDuration: number; isActive: boolean }[]>([]);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/counsellor/availability")
      .then((r) => r.json())
      .then((data) => setSchedule(data.availability || []));
  }, []);

  const getDay = (dow: number) => schedule.find((s) => s.dayOfWeek === dow);

  const handleToggle = async (dow: number) => {
    const existing = getDay(dow);
    setSaving(dow);
    const res = await fetch("/api/counsellor/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek: dow, isActive: !existing?.isActive, startTime: existing?.startTime || "09:00", endTime: existing?.endTime || "17:00" }),
    });
    const data = await res.json();
    setSchedule((prev) => {
      const idx = prev.findIndex((s) => s.dayOfWeek === dow);
      return idx >= 0 ? prev.map((s) => s.dayOfWeek === dow ? data.availability : s) : [...prev, data.availability];
    });
    setSaving(null);
  };

  const handleTimeChange = async (dow: number, field: "startTime" | "endTime", value: string) => {
    const existing = getDay(dow);
    setSchedule((prev) => prev.map((s) => s.dayOfWeek === dow ? { ...s, [field]: value } : s));
    await fetch("/api/counsellor/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayOfWeek: dow, [field]: value, isActive: existing?.isActive ?? true, startTime: existing?.startTime || "09:00", endTime: existing?.endTime || "17:00" }),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
        <Calendar size={15} /> Availability Schedule
      </h3>
      <p className="text-slate-400 text-xs mb-4">Set the days and hours you are available for sessions.</p>
      <div className="space-y-2">
        {[1,2,3,4,5,6,0].map((dow) => {
          const day = getDay(dow);
          const active = day?.isActive ?? false;
          return (
            <div key={dow} className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${active ? "border-brand-teal/30 bg-brand-teal-pale/20" : "border-slate-100 bg-slate-50"}`}>
              <button
                onClick={() => handleToggle(dow)}
                disabled={saving === dow}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${active ? "bg-brand-teal" : "bg-slate-200"} disabled:opacity-50`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-sm font-medium w-24 flex-shrink-0 ${active ? "text-slate-900" : "text-slate-400"}`}>{DAY_NAMES[dow]}</span>
              {active ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={day?.startTime || "09:00"}
                    onChange={(e) => handleTimeChange(dow, "startTime", e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-teal" />
                  <span className="text-slate-400 text-xs">to</span>
                  <input type="time" value={day?.endTime || "17:00"}
                    onChange={(e) => handleTimeChange(dow, "endTime", e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-teal" />
                </div>
              ) : (
                <span className="text-slate-400 text-xs">Not available</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
