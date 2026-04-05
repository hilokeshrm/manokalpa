"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/platform/TopBar";
import { User, Mail, Phone, MapPin, Edit2, Save, Camera } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useUser } from "@/components/providers/UserProvider";

interface ProfileState {
  name: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  qualification: string;
  designation: string;
  institution: string;
  bio: string;
}

interface HealthState {
  energyLevel: number;
  sleepQuality: number;
  wellbeing: number;
  painFrequency: number;
}

export default function ProfilePage() {
  const { user, refresh } = useUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileState>({
    name: "", email: "", mobile: "", dob: "", gender: "",
    city: "", state: "", qualification: "", designation: "", institution: "", bio: "",
  });
  const [health, setHealth] = useState<HealthState>({
    energyLevel: 5, sleepQuality: 5, wellbeing: 5, painFrequency: 3,
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        dob: user.profile?.dob ? user.profile.dob.split("T")[0] : "",
        gender: user.profile?.gender || "",
        city: user.profile?.city || "",
        state: user.profile?.state || "",
        qualification: user.profile?.qualification || "",
        designation: user.profile?.designation || "",
        institution: user.profile?.institution || "",
        bio: user.profile?.bio || "",
      });
      if (user.healthDetails) {
        setHealth({
          energyLevel: user.healthDetails.energyLevel ?? 5,
          sleepQuality: user.healthDetails.sleepQuality ?? 5,
          wellbeing: user.healthDetails.wellbeing ?? 5,
          painFrequency: user.healthDetails.painFrequency ?? 3,
        });
      }
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          profile: {
            dob: profile.dob ? new Date(profile.dob) : undefined,
            gender: profile.gender || undefined,
            city: profile.city || undefined,
            state: profile.state || undefined,
            qualification: profile.qualification || undefined,
            designation: profile.designation || undefined,
            institution: profile.institution || undefined,
            bio: profile.bio || undefined,
          },
          healthDetails: health,
        }),
      });
      if (res.ok) {
        setEditing(false);
        refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile.name || user?.name || "User";

  return (
    <>
      <TopBar pageTitle="My Profile" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Profile header */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 text-center relative">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-purple to-brand-teal flex items-center justify-center text-white text-2xl font-bold mx-auto">
              {getInitials(displayName)}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-purple text-white flex items-center justify-center shadow-md hover:bg-brand-purple-light">
              <Camera size={13} />
            </button>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">{displayName}</h2>
          <p className="text-slate-500 text-sm">
            {profile.designation || "—"}{profile.city ? ` · ${profile.city}` : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span className="badge bg-brand-purple-pale text-brand-purple text-xs">
              {user?._count?.appointmentsAsUser ?? 0} Sessions
            </span>
            <span className="badge bg-brand-teal-pale text-brand-teal text-xs">
              {user?._count?.reflections ?? 0} Journal Entries
            </span>
            <span className="badge bg-blue-50 text-blue-600 text-xs">
              {user?._count?.assessmentAnswers ?? 0} Assessments
            </span>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
          >
            <Edit2 size={12} /> {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <User size={17} className="text-brand-purple" /> Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name", key: "name", icon: User },
              { label: "Email", key: "email", icon: Mail },
              { label: "Mobile", key: "mobile", icon: Phone },
              { label: "City", key: "city", icon: MapPin },
              { label: "Date of Birth", key: "dob", type: "date" },
              { label: "Gender", key: "gender", type: "select", options: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"] },
              { label: "Qualification", key: "qualification" },
              { label: "Designation", key: "designation" },
            ].map(({ label, key, icon: Icon, type, options }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                {editing ? (
                  type === "select" ? (
                    <select
                      value={profile[key as keyof ProfileState]}
                      onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                      className="input-field !py-2 text-sm"
                    >
                      <option value="">Select...</option>
                      {options?.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
                    </select>
                  ) : (
                    <input
                      type={type || "text"}
                      value={profile[key as keyof ProfileState]}
                      onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                      className="input-field !py-2 text-sm"
                    />
                  )
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-700 py-2 px-3 bg-slate-50 rounded-xl">
                    {Icon && <Icon size={14} className="text-slate-400" />}
                    <span>{profile[key as keyof ProfileState] || "—"}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bio */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Bio</label>
            {editing ? (
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="input-field resize-none text-sm"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-sm text-slate-700 py-2 px-3 bg-slate-50 rounded-xl min-h-[60px]">
                {profile.bio || "No bio added yet."}
              </p>
            )}
          </div>

          {editing && (
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary gap-2 disabled:opacity-50"
              >
                <Save size={15} /> {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Health details */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-5">Health & Wellness Profile</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { label: "Energy Level", key: "energyLevel" as keyof HealthState, color: "bg-brand-teal" },
              { label: "Sleep Quality", key: "sleepQuality" as keyof HealthState, color: "bg-brand-purple" },
              { label: "Overall Wellbeing", key: "wellbeing" as keyof HealthState, color: "bg-blue-500" },
              { label: "Pain Frequency", key: "painFrequency" as keyof HealthState, color: "bg-orange-400" },
            ].map(({ label, key, color }) => (
              <div key={key}>
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>{label}</span>
                  <span className="font-medium">{health[key]}/10</span>
                </div>
                {editing ? (
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={health[key]}
                    onChange={(e) => setHealth({ ...health, [key]: parseInt(e.target.value) })}
                    className="w-full accent-brand-purple"
                  />
                ) : (
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${(health[key] / 10) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <p className="text-xs text-slate-400 mt-3">
              Drag sliders to update. Changes save with the &quot;Save Changes&quot; button above.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
