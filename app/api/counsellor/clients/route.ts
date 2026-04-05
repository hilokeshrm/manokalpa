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

  // Get all appointments for this counsellor with user details
  const appointments = await db.appointment.findMany({
    where: { counsellorId: user.userId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      sessionType: true,
      status: true,
      user: { select: { id: true, name: true, email: true, avatar: true, mobile: true } },
    },
  });

  // Aggregate by client
  const clientMap = new Map<string, {
    id: string;
    name: string;
    email: string;
    mobile: string;
    avatar?: string | null;
    sessions: number;
    lastSession: string;
    sessionTypes: Set<string>;
  }>();

  for (const appt of appointments) {
    const c = appt.user;
    if (!clientMap.has(c.id)) {
      clientMap.set(c.id, {
        id: c.id,
        name: c.name,
        email: c.email,
        mobile: c.mobile,
        avatar: c.avatar,
        sessions: 0,
        lastSession: appt.date.toISOString(),
        sessionTypes: new Set(),
      });
    }
    const entry = clientMap.get(c.id)!;
    entry.sessions += 1;
    entry.sessionTypes.add(appt.sessionType);
    if (new Date(appt.date) > new Date(entry.lastSession)) {
      entry.lastSession = appt.date.toISOString();
    }
  }

  const clients = Array.from(clientMap.values()).map((c) => ({
    ...c,
    sessionTypes: Array.from(c.sessionTypes),
  }));

  return NextResponse.json({ clients, total: clients.length });
}
