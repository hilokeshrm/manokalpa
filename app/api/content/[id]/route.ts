import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const content = await db.content.findFirst({
    where: { OR: [{ id }, { slug: id }], status: "PUBLISHED" },
  });

  if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count
  await db.content.update({ where: { id: content.id }, data: { views: { increment: 1 } } });

  return NextResponse.json({ content });
}
