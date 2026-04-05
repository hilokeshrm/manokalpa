import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { verifyPaymentEffects } from "@/lib/payments";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const payments = await db.payment.findMany({
    where: status ? { status: status as "PENDING" | "VERIFIED" | "FAILED" | "REFUNDED" } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
      appointment: {
        select: {
          date: true,
          sessionType: true,
          counsellor: { select: { name: true } },
        },
      },
    },
  });

  const summary = await db.payment.groupBy({
    by: ["status"],
    _sum: { amount: true },
    _count: true,
  });

  return NextResponse.json({ payments, summary });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json();
  const payment = await db.payment.update({ where: { id }, data: { status } });

  // When verifying, confirm appointment + create earning
  if (status === "VERIFIED" && payment.appointmentId) {
    await verifyPaymentEffects(payment.appointmentId, payment.amount);
  }

  return NextResponse.json({ success: true, payment });
}
