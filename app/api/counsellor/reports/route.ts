import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

async function requireCounsellor(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "COUNSELLOR" && payload.role !== "ADMIN") return null;
    return payload as { userId: string };
  } catch { return null; }
}

// GET /api/counsellor/reports — counsellor's session reports
export async function GET(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const reports = await db.sessionReport.findMany({
    where: {
      counsellorId: user.userId,
      ...(status ? { status: status as "DRAFT" | "SUBMITTED" | "REVIEWED" } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      appointment: { select: { id: true, date: true, sessionType: true } },
    },
  });

  // Completed appointments without a report — available to write report for
  const completedWithoutReport = await db.appointment.findMany({
    where: {
      counsellorId: user.userId,
      status: "COMPLETED",
      report: null,
    },
    include: { user: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 20,
  });

  return NextResponse.json({ reports, completedWithoutReport });
}

// POST /api/counsellor/reports — create a new session report
export async function POST(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { appointmentId, sessionSummary, interventions, nextSteps, status } = await req.json();
  if (!appointmentId) return NextResponse.json({ error: "appointmentId required." }, { status: 400 });

  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, counsellorId: user.userId },
  });
  if (!appointment) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });

  const report = await db.sessionReport.create({
    data: {
      appointmentId,
      userId: appointment.userId,
      counsellorId: user.userId,
      sessionSummary: sessionSummary || "",
      interventions: interventions || [],
      nextSteps: nextSteps || "",
      status: status || "DRAFT",
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}

// PATCH /api/counsellor/reports — update existing report
export async function PATCH(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, sessionSummary, interventions, nextSteps, status } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const existing = await db.sessionReport.findFirst({ where: { id, counsellorId: user.userId } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const report = await db.sessionReport.update({
    where: { id },
    data: {
      ...(sessionSummary !== undefined ? { sessionSummary } : {}),
      ...(interventions !== undefined ? { interventions } : {}),
      ...(nextSteps !== undefined ? { nextSteps } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  });

  return NextResponse.json({ report });
}
