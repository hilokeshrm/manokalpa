import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ContentType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as ContentType | null;
  const category = searchParams.get("category");

  const content = await db.content.findMany({
    where: {
      status: "PUBLISHED",
      ...(type ? { type } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ content });
}
