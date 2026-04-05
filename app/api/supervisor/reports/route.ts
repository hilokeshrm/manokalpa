import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jwtVerify } from "jose";

async function getSupervisorId(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
  const { payload } = await jwtVerify(token, secret);
  if (payload.role !== "SUPERVISOR") return null;
  return payload.userId as string;
}

export async function GET(req: NextRequest) {
  const userId = await getSupervisorId(req).catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const reports = await db.sessionReport.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      counsellor: { select: { id: true, name: true, email: true } },
      appointment: {
        include: { user: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json({ reports });
}

export async function PATCH(req: NextRequest) {
  const userId = await getSupervisorId(req).catch(() => null);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, supervisorNote } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const report = await db.sessionReport.update({
    where: { id },
    data: {
      supervisorNote: supervisorNote ?? undefined,
      supervisorId: userId,
      status: "REVIEWED",
    },
  });

  return NextResponse.json({ report });
}
