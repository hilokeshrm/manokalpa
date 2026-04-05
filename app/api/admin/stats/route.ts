import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalCounsellors,
      pendingCounsellors,
      sessionsThisMonth,
      revenueResult,
      recentUsers,
      pendingPayments,
      pendingEnquiries,
      pendingReports,
    ] = await Promise.all([
      db.user.count({ where: { role: "USER" } }),
      db.user.count({ where: { role: "COUNSELLOR", isActive: true } }),
      db.counsellor.count({ where: { isVerified: false } }),
      db.appointment.count({
        where: {
          date: { gte: startOfMonth },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      }),
      db.payment.aggregate({
        where: { status: "VERIFIED", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      }),
      db.payment.count({ where: { status: "PENDING" } }),
      db.contactEnquiry.count({ where: { isRead: false } }),
      db.sessionReport.count({ where: { status: "SUBMITTED" } }),
    ]);

    // Monthly revenue for last 6 months
    const monthlyRevenue = await Promise.all(
      Array.from({ length: 6 }).map(async (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
        const result = await db.payment.aggregate({
          where: { status: "VERIFIED", createdAt: { gte: date, lt: endDate } },
          _sum: { amount: true },
        });
        return {
          month: date.toLocaleString("default", { month: "short" }),
          value: result._sum.amount || 0,
        };
      })
    );

    return NextResponse.json({
      totalUsers,
      totalCounsellors,
      pendingCounsellors,
      sessionsThisMonth,
      revenueThisMonth: revenueResult._sum.amount || 0,
      recentUsers,
      pendingPayments,
      pendingEnquiries,
      pendingReports,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
