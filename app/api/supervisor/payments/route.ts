import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { verifyPaymentEffects } from "@/lib/payments";

async function requireSupervisor(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "SUPERVISOR" && payload.role !== "ADMIN") return null;
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/supervisor/payments
// Returns all PENDING payments so supervisor can review and approve/reject
export async function GET(req: NextRequest) {
  const user = await requireSupervisor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // optional filter

  const payments = await db.payment.findMany({
    where: status ? { status: status as "PENDING" | "VERIFIED" | "FAILED" | "REFUNDED" } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true, mobile: true } },
      appointment: {
        select: {
          id: true,
          date: true,
          time: true,
          sessionType: true,
          status: true,
          counsellor: { select: { name: true, email: true } },
        },
      },
    },
  });

  const summary = {
    pending:  payments.filter((p) => p.status === "PENDING").length,
    verified: payments.filter((p) => p.status === "VERIFIED").length,
    failed:   payments.filter((p) => p.status === "FAILED").length,
    totalVerifiedAmount: payments
      .filter((p) => p.status === "VERIFIED")
      .reduce((s, p) => s + p.amount, 0),
  };

  return NextResponse.json({ payments, summary });
}

// PATCH /api/supervisor/payments
// Supervisor verifies or rejects a pending payment
export async function PATCH(req: NextRequest) {
  const user = await requireSupervisor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status } = await req.json() as { id: string; status: "VERIFIED" | "FAILED" };

  if (!["VERIFIED", "FAILED"].includes(status)) {
    return NextResponse.json({ error: "Status must be VERIFIED or FAILED." }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  const updated = await db.payment.update({ where: { id }, data: { status } });

  // When verified: confirm appointment + create earning record
  if (status === "VERIFIED" && updated.appointmentId) {
    await verifyPaymentEffects(updated.appointmentId, updated.amount);
  }

  return NextResponse.json({ success: true, payment: updated });
}
