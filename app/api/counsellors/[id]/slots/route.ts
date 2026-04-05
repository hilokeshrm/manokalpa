import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/counsellors/[id]/slots?date=YYYY-MM-DD
// [id] here is the counsellor's userId
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: counsellorUserId } = await params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");

  if (!dateStr) return NextResponse.json({ error: "date is required" }, { status: 400 });

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

  // Find counsellor record
  const counsellor = await db.counsellor.findUnique({ where: { userId: counsellorUserId } });
  if (!counsellor) return NextResponse.json({ slots: [] });

  // Get availability for this day
  const avail = await db.availability.findFirst({
    where: { counsellorId: counsellor.id, dayOfWeek, isActive: true },
  });

  if (!avail) return NextResponse.json({ slots: [] }); // No availability set for this day

  // Generate all time slots between startTime and endTime
  const [startH, startM] = avail.startTime.split(":").map(Number);
  const [endH, endM] = avail.endTime.split(":").map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  const slotDur = avail.slotDuration || 50;

  const allSlots: string[] = [];
  for (let m = startMins; m + slotDur <= endMins; m += slotDur) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    allSlots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }

  // Get already booked appointments for this counsellor on this date
  const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

  const booked = await db.appointment.findMany({
    where: {
      counsellorId: counsellorUserId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { time: true },
  });

  const bookedTimes = new Set(booked.map((a) => a.time));

  const slots = allSlots.map((time) => ({
    time,
    available: !bookedTimes.has(time),
  }));

  return NextResponse.json({ slots });
}
