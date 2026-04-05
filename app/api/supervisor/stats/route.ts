import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

async function getSupervisorId(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
  const { payload } = await jwtVerify(token, secret);
  if (payload.role !== "SUPERVISOR") return null;
  return payload.userId as string;
}

export async function GET(req: NextRequest) {
  const userId = await getSupervisorId(req).catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalReports, pendingReports, submittedReports, reviewedReports, totalCounsellors] = await Promise.all([
    db.sessionReport.count(),
    db.sessionReport.count({ where: { status: "DRAFT" } }),
    db.sessionReport.count({ where: { status: "SUBMITTED" } }),
    db.sessionReport.count({ where: { status: "REVIEWED" } }),
    db.counsellor.count({ where: { isVerified: true } }),
  ]);

  const recentSubmitted = await db.sessionReport.findMany({
    where: { status: "SUBMITTED" },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      counsellor: { select: { name: true } },
      appointment: { include: { user: { select: { name: true } } } },
    },
  });

  return NextResponse.json({
    stats: { totalReports, pendingReports, submittedReports, reviewedReports, totalCounsellors },
    recentSubmitted,
  });
}
