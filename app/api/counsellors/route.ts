import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const expertise = searchParams.get("expertise");
  const search = searchParams.get("search");

  const counsellors = await db.counsellor.findMany({
    where: {
      isVerified: true,
      isAvailable: true,
      ...(expertise ? { expertise: { has: expertise } } : {}),
      ...(search ? { user: { name: { contains: search, mode: "insensitive" } } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
    orderBy: { rating: "desc" },
  });

  return NextResponse.json({
    counsellors: counsellors.map((c) => ({
      ...c,
      userId: c.userId,
      name: c.user.name,
      tagline: c.tagline,
    })),
  });
}
