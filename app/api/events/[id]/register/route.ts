import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const registration = await db.eventRegistration.upsert({
      where: { userId_eventId: { userId, eventId: id } },
      update: {},
      create: { userId, eventId: id },
    });

    return NextResponse.json({ success: true, registration });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
