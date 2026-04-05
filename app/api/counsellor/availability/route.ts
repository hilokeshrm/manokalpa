import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

async function requireCounsellor(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "COUNSELLOR" && payload.role !== "ADMIN") return null;
    return payload as { userId: string };
  } catch { return null; }
}

// GET — counsellor's availability schedule
export async function GET(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const counsellor = await db.counsellor.findUnique({ where: { userId: user.userId } });
  if (!counsellor) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const availability = await db.availability.findMany({
    where: { counsellorId: counsellor.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ availability });
}

// POST — upsert availability for a day
export async function POST(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const counsellor = await db.counsellor.findUnique({ where: { userId: user.userId } });
  if (!counsellor) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const { dayOfWeek, startTime, endTime, slotDuration, isActive } = await req.json();

  // Upsert: one record per day per counsellor
  const existing = await db.availability.findFirst({
    where: { counsellorId: counsellor.id, dayOfWeek },
  });

  let availability;
  if (existing) {
    availability = await db.availability.update({
      where: { id: existing.id },
      data: {
        startTime: startTime ?? existing.startTime,
        endTime: endTime ?? existing.endTime,
        slotDuration: slotDuration ?? existing.slotDuration,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });
  } else {
    availability = await db.availability.create({
      data: {
        counsellorId: counsellor.id,
        dayOfWeek,
        startTime: startTime || "09:00",
        endTime: endTime || "17:00",
        slotDuration: slotDuration || 50,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
  }

  return NextResponse.json({ availability });
}

// DELETE — remove availability for a day
export async function DELETE(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const counsellor = await db.counsellor.findUnique({ where: { userId: user.userId } });
  if (!counsellor) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const { id } = await req.json();
  await db.availability.deleteMany({ where: { id, counsellorId: counsellor.id } });
  return NextResponse.json({ success: true });
}
