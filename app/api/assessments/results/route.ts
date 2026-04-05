import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const results = await db.assessmentResult.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
