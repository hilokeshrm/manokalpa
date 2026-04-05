import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { verifyPaymentEffects } from "@/lib/payments";

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

// GET /api/counsellor/payments — pending payments for this counsellor's appointments
export async function GET(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const payments = await db.payment.findMany({
    where: {
      appointment: { counsellorId: user.userId },
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      appointment: {
        select: { id: true, date: true, time: true, sessionType: true, status: true },
      },
    },
  });

  return NextResponse.json({ payments });
}

// PATCH /api/counsellor/payments — verify or reject a payment
export async function PATCH(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json();
  if (!["VERIFIED", "FAILED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  // Ensure payment belongs to this counsellor's appointment
  const payment = await db.payment.findFirst({
    where: { id, appointment: { counsellorId: user.userId } },
  });
  if (!payment) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const updated = await db.payment.update({ where: { id }, data: { status } });

  if (status === "VERIFIED" && updated.appointmentId) {
    await verifyPaymentEffects(updated.appointmentId, updated.amount);
  }

  return NextResponse.json({ success: true, payment: updated });
}
