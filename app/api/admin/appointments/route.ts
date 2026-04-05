import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search") || "";

  const appointments = await db.appointment.findMany({
    where: {
      ...(status ? { status: status as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" } : {}),
      ...(search
        ? {
            OR: [
              { user: { name: { contains: search, mode: "insensitive" as const } } },
              { counsellor: { name: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    },
    orderBy: { date: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true, email: true } },
      counsellor: { select: { id: true, name: true, email: true } },
      payment: { select: { status: true, amount: true } },
    },
  });

  return NextResponse.json({ appointments });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status, meetingLink } = await req.json();
  const updated = await db.appointment.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(meetingLink !== undefined ? { meetingLink } : {}),
    },
  });
  return NextResponse.json({ appointment: updated });
}
