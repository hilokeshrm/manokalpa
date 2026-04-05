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

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const appointments = await db.appointment.findMany({
    where: {
      userId,
      ...(status ? { status: { in: status.split(",") as ("PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW")[] } } : {}),
    },
    include: {
      counsellor: {
        select: {
          id: true,
          name: true,
          avatar: true,
          counsellor: { select: { expertise: true, level: true, consultationFee: true } },
        },
      },
      payment: { select: { amount: true, status: true, utr: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ appointments });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { counsellorId, date, time, sessionType, notes } = body;

    if (!counsellorId || !date || !time) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const appointment = await db.appointment.create({
      data: { userId, counsellorId, date: new Date(date), time, sessionType: sessionType || "INDIVIDUAL", notes },
      include: { counsellor: { select: { name: true } } },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
