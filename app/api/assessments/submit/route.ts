import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;

    const { assessmentId, answers, score, level, feedback } = await req.json();

    const result = await db.assessmentResult.create({
      data: { userId, assessmentId, score, level: level || null, feedback: feedback || null },
    });

    if (answers && answers.length > 0) {
      await db.assessmentAnswer.createMany({
        data: answers.map((a: { questionId: string; answer: string }) => ({
          userId,
          questionId: a.questionId,
          answer: a.answer,
          resultId: result.id,
        })),
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Assessment submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
