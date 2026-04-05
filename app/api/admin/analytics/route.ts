import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") return null;
    return true;
  } catch { return null; }
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function last6Months() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return { key: monthKey(d), label: d.toLocaleString("en-IN", { month: "short", year: "2-digit" }) };
  });
}

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const months = last6Months();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);

  const [users, appointments, payments, assessmentResults, topContent, counsellors] = await Promise.all([
    db.user.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true, role: true } }),
    db.appointment.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true, status: true } }),
    db.payment.findMany({ where: { status: "VERIFIED", createdAt: { gte: sixMonthsAgo } }, select: { amount: true, createdAt: true } }),
    db.assessmentResult.groupBy({ by: ["level"], _count: { id: true } }),
    db.content.findMany({ orderBy: { views: "desc" }, take: 5, select: { id: true, title: true, type: true, views: true } }),
    db.counsellor.findMany({
      orderBy: { rating: "desc" },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
  ]);

  // Build monthly maps
  const userGrowth = months.map(({ key, label }) => ({
    label,
    users: users.filter((u) => monthKey(u.createdAt) === key && u.role === "USER").length,
    counsellors: users.filter((u) => monthKey(u.createdAt) === key && u.role === "COUNSELLOR").length,
  }));

  const appointmentsByMonth = months.map(({ key, label }) => ({
    label,
    total: appointments.filter((a) => monthKey(a.createdAt) === key).length,
    completed: appointments.filter((a) => monthKey(a.createdAt) === key && a.status === "COMPLETED").length,
  }));

  const revenueByMonth = months.map(({ key, label }) => ({
    label,
    amount: payments.filter((p) => monthKey(p.createdAt) === key).reduce((s, p) => s + p.amount, 0),
  }));

  const assessmentBreakdown = assessmentResults.map((r) => ({
    level: r.level || "UNKNOWN",
    count: r._count.id,
  }));

  return NextResponse.json({
    userGrowth,
    appointmentsByMonth,
    revenueByMonth,
    assessmentBreakdown,
    topContent,
    topCounsellors: counsellors.map((c) => ({
      name: c.user.name,
      rating: c.rating,
      totalRatings: c.totalRatings,
      experience: c.experience,
    })),
  });
}
