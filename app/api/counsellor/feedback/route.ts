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

// GET /api/counsellor/feedback — rating summary + completed session stats
export async function GET(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [counsellor, completedSessions, recentClients] = await Promise.all([
    db.counsellor.findUnique({
      where: { userId: user.userId },
      select: { rating: true, totalRatings: true, experience: true, level: true },
    }),
    db.appointment.count({
      where: { counsellorId: user.userId, status: "COMPLETED" },
    }),
    db.appointment.findMany({
      where: { counsellorId: user.userId, status: "COMPLETED" },
      orderBy: { date: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, avatar: true } },
        payment: { select: { amount: true } },
      },
    }),
  ]);

  return NextResponse.json({
    rating: counsellor?.rating ?? 0,
    totalRatings: counsellor?.totalRatings ?? 0,
    completedSessions,
    level: counsellor?.level ?? "ASSOCIATE",
    recentClients: recentClients.map((a) => ({
      id: a.id,
      clientName: a.user.name,
      clientAvatar: a.user.avatar,
      date: a.date,
      sessionType: a.sessionType,
      amount: a.payment?.amount ?? 0,
    })),
  });
}
