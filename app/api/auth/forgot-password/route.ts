import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const user = await db.user.findFirst({ where: { email: email.toLowerCase().trim() } });

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ success: true });

  // Invalidate previous reset tokens
  await db.otp.updateMany({
    where: { userId: user.id, type: "RESET_PASSWORD", isUsed: false },
    data: { isUsed: true },
  });

  // Generate a secure token and store as OTP
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await db.otp.create({
    data: { userId: user.id, code: token, type: "RESET_PASSWORD", expiresAt },
  });

  try {
    await sendPasswordResetEmail(user.email, user.name, token);
  } catch (err) {
    console.error("Failed to send reset email:", err);
  }

  return NextResponse.json({ success: true });
}
