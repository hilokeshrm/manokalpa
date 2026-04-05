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

  const counsellors = await db.counsellor.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { rating: "desc" },
  });

  // Get report and appointment counts per counsellor user
  const counts = await Promise.all(
    counsellors.map(async (c) => {
      const [reportCount, appointmentCount] = await Promise.all([
        db.sessionReport.count({ where: { counsellorId: c.userId } }),
        db.appointment.count({ where: { counsellorId: c.userId } }),
      ]);
      return { id: c.id, reportCount, appointmentCount };
    })
  );

  const result = counsellors.map((c) => {
    const cnt = counts.find((x) => x.id === c.id);
    return { ...c, reportCount: cnt?.reportCount ?? 0, appointmentCount: cnt?.appointmentCount ?? 0 };
  });

  return NextResponse.json({ counsellors: result });
}
