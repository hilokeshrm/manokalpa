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
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const dateFilter = searchParams.get("date"); // "today"

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const where: Record<string, unknown> = {
    counsellorId: user.userId,
    ...(status ? { status: { in: status.split(",") } } : {}),
    ...(dateFilter === "today" ? { date: { gte: startOfDay, lt: endOfDay } } : {}),
  };

  const appointments = await db.appointment.findMany({
    where,
    orderBy: { date: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      payment: { select: { id: true, status: true, amount: true, utr: true, method: true } },
      report: { select: { id: true, status: true } },
    },
  });

  return NextResponse.json({ appointments });
}

export async function PATCH(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status, meetingLink } = await req.json();

  const appointment = await db.appointment.findFirst({
    where: { id, counsellorId: user.userId },
  });
  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.appointment.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(meetingLink !== undefined ? { meetingLink } : {}),
    },
  });

  return NextResponse.json({ appointment: updated });
}
