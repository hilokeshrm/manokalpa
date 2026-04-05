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

  // Get counsellor record
  const counsellor = await db.counsellor.findUnique({
    where: { userId: user.userId },
  });
  if (!counsellor) return NextResponse.json({ error: "Counsellor not found" }, { status: 404 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allEarnings, monthEarnings] = await Promise.all([
    db.earning.findMany({
      where: { counsellorId: counsellor.id },
      orderBy: { createdAt: "desc" },
      include: {
        counsellor: {
          include: {
            user: false,
          },
        },
      },
    }),
    db.earning.findMany({
      where: { counsellorId: counsellor.id, createdAt: { gte: startOfMonth } },
    }),
  ]);

  // Get appointment details for each earning
  const earningsWithDetails = await Promise.all(
    allEarnings.map(async (e) => {
      const appointment = await db.appointment.findUnique({
        where: { id: e.appointmentId },
        select: {
          id: true,
          date: true,
          sessionType: true,
          user: { select: { name: true } },
        },
      });
      return {
        id: e.id,
        appointmentId: e.appointmentId,
        totalAmount: e.totalAmount,
        counsellorShare: e.counsellorShare,
        platformShare: e.platformShare,
        tdsDeduction: e.tdsDeduction,
        netPayable: e.netPayable,
        isPaid: e.isPaid,
        paidAt: e.paidAt,
        createdAt: e.createdAt,
        appointment,
      };
    })
  );

  const summary = {
    totalGross: monthEarnings.reduce((s, e) => s + e.totalAmount, 0),
    counsellorShare: monthEarnings.reduce((s, e) => s + e.counsellorShare, 0),
    platformShare: monthEarnings.reduce((s, e) => s + e.platformShare, 0),
    tdsDeduction: monthEarnings.reduce((s, e) => s + e.tdsDeduction, 0),
    netPayable: monthEarnings.reduce((s, e) => s + e.netPayable, 0),
    sessions: monthEarnings.length,
  };

  return NextResponse.json({ earnings: earningsWithDetails, summary });
}
