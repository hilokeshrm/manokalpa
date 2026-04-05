import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch { return null; }
}

// PATCH /api/journal/[id] — update a reflection
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await db.reflection.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { thought, feeling, reaction, reframe, rating, tags } = await req.json();

  const reflection = await db.reflection.update({
    where: { id },
    data: {
      ...(thought !== undefined ? { thought } : {}),
      ...(feeling !== undefined ? { feeling } : {}),
      ...(reaction !== undefined ? { reaction } : {}),
      ...(reframe !== undefined ? { reframe } : {}),
      ...(rating !== undefined ? { rating } : {}),
      ...(tags !== undefined ? { tags } : {}),
    },
  });

  return NextResponse.json({ reflection });
}

// DELETE /api/journal/[id] — delete a reflection
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await db.reflection.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await db.reflection.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
