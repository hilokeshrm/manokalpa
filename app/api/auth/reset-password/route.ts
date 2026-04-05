import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Find the OTP record matching this token
    const otp = await db.otp.findFirst({
      where: {
        code: token,
        type: "RESET_PASSWORD",
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashed = await bcrypt.hash(password, 12);

    // Update password + mark token used in a single transaction
    await db.$transaction([
      db.user.update({
        where: { id: otp.userId },
        data: { password: hashed },
      }),
      db.otp.update({
        where: { id: otp.id },
        data: { isUsed: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

// GET — validate token without consuming it (used to check link before showing the form)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "No token provided." }, { status: 400 });
  }

  const otp = await db.otp.findFirst({
    where: {
      code: token,
      type: "RESET_PASSWORD",
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) {
    return NextResponse.json({ valid: false, error: "This reset link is invalid or has expired." });
  }

  // Return how many minutes are left
  const minutesLeft = Math.max(0, Math.floor((otp.expiresAt.getTime() - Date.now()) / 60000));
  return NextResponse.json({ valid: true, minutesLeft });
}
