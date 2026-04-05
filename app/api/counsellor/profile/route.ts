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
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const counsellor = await db.counsellor.findUnique({
    where: { userId: user.userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, mobile: true, avatar: true },
      },
    },
  });

  if (!counsellor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ counsellor });
}

export async function PATCH(req: NextRequest) {
  const user = await requireCounsellor(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, bio, tagline, expertise, qualifications, languages, consultationFee, isAvailable } = body;

  // Update user name if provided
  if (name) {
    await db.user.update({ where: { id: user.userId }, data: { name } });
  }

  const counsellor = await db.counsellor.update({
    where: { userId: user.userId },
    data: {
      ...(bio !== undefined ? { bio } : {}),
      ...(tagline !== undefined ? { tagline } : {}),
      ...(expertise !== undefined ? { expertise } : {}),
      ...(qualifications !== undefined ? { qualifications } : {}),
      ...(languages !== undefined ? { languages } : {}),
      ...(consultationFee !== undefined ? { consultationFee } : {}),
      ...(isAvailable !== undefined ? { isAvailable } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, mobile: true, avatar: true } },
    },
  });

  return NextResponse.json({ counsellor });
}
