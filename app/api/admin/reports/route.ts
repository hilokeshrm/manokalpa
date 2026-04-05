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

// GET /api/admin/reports — all session reports
export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const reports = await db.sessionReport.findMany({
    where: status ? { status: status as "DRAFT" | "SUBMITTED" | "REVIEWED" } : {},
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      counsellor: { select: { name: true } },
      appointment: { select: { date: true, sessionType: true } },
    },
  });

  const summary = await db.sessionReport.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  return NextResponse.json({ reports, summary });
}

// PATCH /api/admin/reports — add supervisor note / change status
export async function PATCH(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status, supervisorNote } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const report = await db.sessionReport.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(supervisorNote !== undefined ? { supervisorNote } : {}),
    },
  });

  return NextResponse.json({ report });
}
