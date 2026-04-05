import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { verifyPaymentEffects } from "@/lib/payments";

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch {
    return null;
  }
}

// POST /api/payments — user submits manual bank/UPI transfer details
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { appointmentId, method, utr, amount } = await req.json();

  if (!appointmentId || !method || !utr || !amount) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // Verify the appointment belongs to this user
  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, userId },
  });
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }
  if (appointment.status === "CANCELLED") {
    return NextResponse.json({ error: "Cannot pay for a cancelled appointment." }, { status: 400 });
  }

  // Upsert: allow re-submission if previously failed/pending
  const existing = await db.payment.findUnique({ where: { appointmentId } });
  const amountInPaise = Math.round(Number(amount) * 100);

  let payment;
  if (existing) {
    payment = await db.payment.update({
      where: { appointmentId },
      data: {
        method: method as "UPI" | "CARD" | "NET_BANKING" | "WALLET" | "RAZORPAY",
        utr,
        amount: amountInPaise,
        status: "PENDING",
      },
    });
  } else {
    payment = await db.payment.create({
      data: {
        userId,
        appointmentId,
        method: method as "UPI" | "CARD" | "NET_BANKING" | "WALLET" | "RAZORPAY",
        utr,
        amount: amountInPaise,
        status: "PENDING",
        description: `Manual payment for appointment`,
      },
    });
  }

  return NextResponse.json({ payment }, { status: 201 });
}

// PUT — Razorpay webhook (kept for future use)
export async function PUT(req: NextRequest) {
  try {
    const { paymentId, razorpayPaymentId, utr, status } = await req.json();

    const payment = await db.payment.update({
      where: { id: paymentId },
      data: {
        razorpayPaymentId,
        utr,
        status: status === "paid" ? "VERIFIED" : "FAILED",
      },
    });

    if (payment.status === "VERIFIED" && payment.appointmentId) {
      await verifyPaymentEffects(payment.appointmentId, payment.amount);
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

