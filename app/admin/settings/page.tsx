"use client";

import { useEffect, useState } from "react";
import { Save, Bell, Shield, CreditCard, Mail, Globe, Clock, RotateCcw, Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneralSettings {
  platformName: string;
  tagline: string;
  supportEmail: string;
  contactPhone: string;
  websiteUrl: string;
  address: string;
}

interface NotificationSettings {
  emailNewRegistrations: boolean;
  emailNewAppointments: boolean;
  emailReminders24h: boolean;
  emailPaymentReceived: boolean;
  inAppNotifications: boolean;
  smsReminders: boolean;
}

interface PaymentSettings {
  platformCommission: number;
  counsellorShare: number;
  tdsRate: number;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  enableRazorpay: boolean;
  enableBankTransfer: boolean;
}

interface EmailSettings {
  fromName: string;
  fromEmail: string;
  resendApiKey: string;
  sendBookingConfirmation: boolean;
  sendSessionReminder: boolean;
  sendPaymentConfirmation: boolean;
}

interface SecuritySettings {
  sessionExpiry: number;
  requireEmailVerification: boolean;
  enableOtpLogin: boolean;
  forceHttps: boolean;
  enableAuditLogs: boolean;
}

interface SessionSettings {
  defaultSessionDuration: number;
  cancellationWindow: number;
  maxAdvanceBooking: number;
  videoPlatform: string;
  autoGenerateMeetingLinks: boolean;
  allowFreeFirstSession: boolean;
  allowGroupSessions: boolean;
}

interface AllSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  payments: PaymentSettings;
  email: EmailSettings;
  security: SecuritySettings;
  sessions: SessionSettings;
}

// ─── Sidebar sections ─────────────────────────────────────────────────────────

const SECTIONS = [
  { key: "general",       label: "General",       icon: Globe },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "payments",      label: "Payments",      icon: CreditCard },
  { key: "email",         label: "Email",         icon: Mail },
  { key: "security",      label: "Security",      icon: Shield },
  { key: "sessions",      label: "Sessions",      icon: Clock },
] as const;

type SectionKey = typeof SECTIONS[number]["key"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [active, setActive] = useState<SectionKey>("general");
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Fetch all settings on mount
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: active, values: settings[active] }),
      });
      if (res.ok) {
        showToast("Settings saved successfully", true);
      } else {
        showToast("Failed to save settings", false);
      }
    } catch {
      showToast("Network error — could not save", false);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm(`Reset ${active} settings to defaults?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings?section=${active}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && settings) {
        setSettings({ ...settings, [active]: data.defaults });
        showToast("Reset to defaults", true);
      }
    } catch {
      showToast("Reset failed", false);
    } finally {
      setSaving(false);
    }
  }

  function update<K extends SectionKey>(section: K, key: string, value: unknown) {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: { ...settings[section], [key]: value },
    });
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-purple" size={28} />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 text-slate-500 text-sm">Failed to load settings.</div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm">Manage platform-wide configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === key ? "bg-brand-purple text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-6 space-y-5">

          {/* ── General ── */}
          {active === "general" && (
            <>
              <h2 className="font-semibold text-slate-900">General Settings</h2>
              <Field label="Platform Name" value={settings.general.platformName}
                onChange={(v) => update("general", "platformName", v)} />
              <Field label="Tagline" value={settings.general.tagline}
                onChange={(v) => update("general", "tagline", v)} />
              <Field label="Support Email" value={settings.general.supportEmail} type="email"
                onChange={(v) => update("general", "supportEmail", v)} />
              <Field label="Contact Phone" value={settings.general.contactPhone}
                onChange={(v) => update("general", "contactPhone", v)} />
              <Field label="Website URL" value={settings.general.websiteUrl}
                onChange={(v) => update("general", "websiteUrl", v)} />
              <Field label="Address" value={settings.general.address}
                onChange={(v) => update("general", "address", v)} />
            </>
          )}

          {/* ── Notifications ── */}
          {active === "notifications" && (
            <>
              <h2 className="font-semibold text-slate-900">Notification Settings</h2>
              <Toggle label="Email notifications for new registrations"
                checked={settings.notifications.emailNewRegistrations}
                onChange={(v) => update("notifications", "emailNewRegistrations", v)} />
              <Toggle label="Email notifications for new appointments"
                checked={settings.notifications.emailNewAppointments}
                onChange={(v) => update("notifications", "emailNewAppointments", v)} />
              <Toggle label="Email reminders 24h before sessions"
                checked={settings.notifications.emailReminders24h}
                onChange={(v) => update("notifications", "emailReminders24h", v)} />
              <Toggle label="Email for payment received"
                checked={settings.notifications.emailPaymentReceived}
                onChange={(v) => update("notifications", "emailPaymentReceived", v)} />
              <Toggle label="In-app notifications for users"
                checked={settings.notifications.inAppNotifications}
                onChange={(v) => update("notifications", "inAppNotifications", v)} />
              <Toggle label="SMS reminders (requires SMS gateway)"
                checked={settings.notifications.smsReminders}
                onChange={(v) => update("notifications", "smsReminders", v)} />
            </>
          )}

          {/* ── Payments ── */}
          {active === "payments" && (
            <>
              <h2 className="font-semibold text-slate-900">Payment Settings</h2>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Platform Commission (%)" value={String(settings.payments.platformCommission)} type="number"
                  onChange={(v) => update("payments", "platformCommission", Number(v))} />
                <Field label="Counsellor Share (%)" value={String(settings.payments.counsellorShare)} type="number"
                  onChange={(v) => update("payments", "counsellorShare", Number(v))} />
                <Field label="TDS Rate (%)" value={String(settings.payments.tdsRate)} type="number"
                  onChange={(v) => update("payments", "tdsRate", Number(v))} />
              </div>
              <div className="pt-1 border-t border-slate-100 space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Razorpay Integration</p>
                <Field label="Razorpay Key ID" value={settings.payments.razorpayKeyId}
                  onChange={(v) => update("payments", "razorpayKeyId", v)}
                  hint="Starts with rzp_live_ or rzp_test_" />
                <Field label="Razorpay Key Secret" value={settings.payments.razorpayKeySecret} type="password"
                  onChange={(v) => update("payments", "razorpayKeySecret", v)}
                  hint="Leave blank to keep existing value" />
              </div>
              <div className="pt-1 border-t border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Payment Methods</p>
                <Toggle label="Enable Razorpay payments"
                  checked={settings.payments.enableRazorpay}
                  onChange={(v) => update("payments", "enableRazorpay", v)} />
                <Toggle label="Enable manual bank transfer payments"
                  checked={settings.payments.enableBankTransfer}
                  onChange={(v) => update("payments", "enableBankTransfer", v)} />
              </div>
            </>
          )}

          {/* ── Email ── */}
          {active === "email" && (
            <>
              <h2 className="font-semibold text-slate-900">Email Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="From Name" value={settings.email.fromName}
                  onChange={(v) => update("email", "fromName", v)} />
                <Field label="From Email" value={settings.email.fromEmail} type="email"
                  onChange={(v) => update("email", "fromEmail", v)} />
              </div>
              <Field label="Resend API Key" value={settings.email.resendApiKey} type="password"
                onChange={(v) => update("email", "resendApiKey", v)}
                hint="Get your key from resend.com — leave blank to keep existing" />
              <div className="pt-1 border-t border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Automated Emails</p>
                <Toggle label="Send booking confirmation emails"
                  checked={settings.email.sendBookingConfirmation}
                  onChange={(v) => update("email", "sendBookingConfirmation", v)} />
                <Toggle label="Send session reminder emails"
                  checked={settings.email.sendSessionReminder}
                  onChange={(v) => update("email", "sendSessionReminder", v)} />
                <Toggle label="Send payment confirmation emails"
                  checked={settings.email.sendPaymentConfirmation}
                  onChange={(v) => update("email", "sendPaymentConfirmation", v)} />
              </div>
            </>
          )}

          {/* ── Security ── */}
          {active === "security" && (
            <>
              <h2 className="font-semibold text-slate-900">Security Settings</h2>
              <Field label="Session / Token Expiry (hours)" value={String(settings.security.sessionExpiry)} type="number"
                onChange={(v) => update("security", "sessionExpiry", Number(v))} />
              <div className="pt-1 border-t border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Auth Options</p>
                <Toggle label="Require email verification on signup"
                  checked={settings.security.requireEmailVerification}
                  onChange={(v) => update("security", "requireEmailVerification", v)} />
                <Toggle label="Enable OTP login"
                  checked={settings.security.enableOtpLogin}
                  onChange={(v) => update("security", "enableOtpLogin", v)} />
              </div>
              <div className="pt-1 border-t border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Platform</p>
                <Toggle label="Force HTTPS"
                  checked={settings.security.forceHttps}
                  onChange={(v) => update("security", "forceHttps", v)} />
                <Toggle label="Enable audit logs"
                  checked={settings.security.enableAuditLogs}
                  onChange={(v) => update("security", "enableAuditLogs", v)} />
              </div>
            </>
          )}

          {/* ── Sessions ── */}
          {active === "sessions" && (
            <>
              <h2 className="font-semibold text-slate-900">Session Settings</h2>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Default Duration (min)" value={String(settings.sessions.defaultSessionDuration)} type="number"
                  onChange={(v) => update("sessions", "defaultSessionDuration", Number(v))} />
                <Field label="Cancellation Window (hrs)" value={String(settings.sessions.cancellationWindow)} type="number"
                  onChange={(v) => update("sessions", "cancellationWindow", Number(v))} />
                <Field label="Max Advance Booking (days)" value={String(settings.sessions.maxAdvanceBooking)} type="number"
                  onChange={(v) => update("sessions", "maxAdvanceBooking", Number(v))} />
              </div>
              <Field label="Video Platform" value={settings.sessions.videoPlatform}
                onChange={(v) => update("sessions", "videoPlatform", v)}
                hint='e.g. "Google Meet", "Zoom", "Daily.co"' />
              <div className="pt-1 border-t border-slate-100 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-2">Options</p>
                <Toggle label="Auto-generate meeting links"
                  checked={settings.sessions.autoGenerateMeetingLinks}
                  onChange={(v) => update("sessions", "autoGenerateMeetingLinks", v)} />
                <Toggle label="Allow free first session"
                  checked={settings.sessions.allowFreeFirstSession}
                  onChange={(v) => update("sessions", "allowFreeFirstSession", v)} />
                <Toggle label="Allow group sessions"
                  checked={settings.sessions.allowGroupSessions}
                  onChange={(v) => update("sessions", "allowGroupSessions", v)} />
              </div>
            </>
          )}

          {/* ── Footer actions ── */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Saving…" : "Save Settings"}
            </button>
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} /> Reset to Defaults
            </button>
            {toast && (
              <span className={`text-sm font-medium ${toast.ok ? "text-green-600" : "text-red-500"}`}>
                {toast.msg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  value,
  type = "text",
  hint,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  hint?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand-purple transition-colors"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-brand-purple" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
