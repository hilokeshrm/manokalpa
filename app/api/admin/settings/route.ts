import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

// ─── Default values ────────────────────────────────────────────────────────────

const DEFAULTS: Record<string, Record<string, unknown>> = {
  general: {
    platformName: "Manokalpa Wellness",
    tagline: "Your Mental Wellness Companion",
    supportEmail: "support@manokalpa.in",
    contactPhone: "+91 98765 43210",
    websiteUrl: "https://manokalpa.in",
    address: "Bengaluru, Karnataka, India",
  },
  notifications: {
    emailNewRegistrations: true,
    emailNewAppointments: true,
    emailReminders24h: true,
    emailPaymentReceived: true,
    inAppNotifications: true,
    smsReminders: false,
  },
  payments: {
    platformCommission: 30,
    counsellorShare: 70,
    tdsRate: 10,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    enableRazorpay: false,
    enableBankTransfer: true,
  },
  email: {
    fromName: "Manokalpa Team",
    fromEmail: "noreply@manokalpa.in",
    resendApiKey: "",
    sendBookingConfirmation: true,
    sendSessionReminder: true,
    sendPaymentConfirmation: true,
  },
  security: {
    sessionExpiry: 24,
    requireEmailVerification: false,
    enableOtpLogin: false,
    forceHttps: true,
    enableAuditLogs: true,
  },
  sessions: {
    defaultSessionDuration: 50,
    cancellationWindow: 24,
    maxAdvanceBooking: 30,
    videoPlatform: "Google Meet",
    autoGenerateMeetingLinks: false,
    allowFreeFirstSession: false,
    allowGroupSessions: true,
  },
};

const SECTIONS = Object.keys(DEFAULTS);

// ─── Auth helper ───────────────────────────────────────────────────────────────

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") return null;
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

// ─── GET — return all settings (merged with defaults) ─────────────────────────

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await db.platformSetting.findMany({
    where: { key: { in: SECTIONS } },
  });

  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value as Record<string, unknown>]));

  // Merge stored values over defaults so new fields always appear
  const settings = Object.fromEntries(
    SECTIONS.map((section) => [
      section,
      { ...DEFAULTS[section], ...(stored[section] ?? {}) },
    ])
  );

  return NextResponse.json({ settings });
}

// ─── PATCH — save one section ──────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { section, values } = body as { section: string; values: Record<string, unknown> };

  if (!SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  // Fetch current stored value so we can merge (avoids wiping unrelated keys)
  const current = await db.platformSetting.findUnique({ where: { key: section } });
  const currentValue = (current?.value as Record<string, unknown>) ?? {};

  // For secret fields — if the incoming value is the masked sentinel, keep the stored value
  const SENSITIVE_FIELDS: Record<string, string[]> = {
    payments: ["razorpayKeySecret"],
    email: ["resendApiKey"],
  };
  const sensitiveForSection = SENSITIVE_FIELDS[section] ?? [];

  const merged: Record<string, unknown> = { ...currentValue };
  for (const [k, v] of Object.entries(values)) {
    if (sensitiveForSection.includes(k) && v === "••••••••••••••••") {
      // Keep existing stored value
      merged[k] = currentValue[k] ?? "";
    } else {
      merged[k] = v;
    }
  }

  await db.platformSetting.upsert({
    where: { key: section },
    create: { key: section, value: merged as object, updatedBy: admin.userId as string },
    update: { value: merged as object, updatedBy: admin.userId as string },
  });

  return NextResponse.json({ success: true, section });
}

// ─── DELETE — reset one section to defaults ────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");

  if (!section || !SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  await db.platformSetting.deleteMany({ where: { key: section } });
  return NextResponse.json({ success: true, defaults: DEFAULTS[section] });
}
