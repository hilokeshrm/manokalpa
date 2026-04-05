import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);

    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        avatar: true,
        profile: true,
        healthDetails: true,
        counsellor: {
          select: {
            id: true,
            rating: true,
            totalRatings: true,
            experience: true,
            level: true,
            isVerified: true,
            isAvailable: true,
            consultationFee: true,
            expertise: true,
            bio: true,
            tagline: true,
          },
        },
        _count: {
          select: {
            appointmentsAsUser: true,
            reflections: true,
            assessmentAnswers: true,
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
