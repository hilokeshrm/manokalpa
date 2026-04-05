import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const assessments = await db.assessment.findMany({
    where: { isActive: true },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ assessments });
}
