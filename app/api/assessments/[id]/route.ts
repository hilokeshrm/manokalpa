import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const assessment = await db.assessment.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    });
    if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ assessment });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
