import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

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

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      avatar: true,
      profile: true,
      healthDetails: true,
      _count: {
        select: {
          appointmentsAsUser: true,
          reflections: true,
          assessmentAnswers: true,
        },
      },
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, profile: profileData, healthDetails } = body;

    if (name) {
      await db.user.update({ where: { id: userId }, data: { name } });
    }

    if (profileData) {
      // Remove undefined keys
      const cleanProfile = Object.fromEntries(
        Object.entries(profileData).filter(([, v]) => v !== undefined)
      );
      await db.profile.upsert({
        where: { userId },
        update: cleanProfile,
        create: { userId, ...cleanProfile },
      });
    }

    if (healthDetails) {
      const cleanHealth = Object.fromEntries(
        Object.entries(healthDetails).filter(([, v]) => v !== undefined)
      );
      await db.healthDetails.upsert({
        where: { userId },
        update: cleanHealth,
        create: { userId, ...cleanHealth },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
