import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { ContentType, ContentStatus } from "@prisma/client";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "ADMIN") return null;
    return payload as { userId: string };
  } catch { return null; }
}

// GET /api/admin/content — all content (all statuses)
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as ContentType | null;
  const status = searchParams.get("status") as ContentStatus | null;
  const search = searchParams.get("search") || "";

  const content = await db.content.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    },
    include: {
      author: { select: { name: true } },
      _count: { select: { feedback: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ content });
}

// POST /api/admin/content — create new content
export async function POST(req: NextRequest) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { title, type, body, mediaUrl, thumbnail, category, tags, status } = await req.json();
  if (!title || !type) return NextResponse.json({ error: "Title and type are required." }, { status: 400 });

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

  const content = await db.content.create({
    data: {
      title,
      slug,
      type: type as ContentType,
      body: body || null,
      mediaUrl: mediaUrl || null,
      thumbnail: thumbnail || null,
      category: category || null,
      tags: tags || [],
      authorId: user.userId,
      status: (status as ContentStatus) || "DRAFT",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  return NextResponse.json({ content }, { status: 201 });
}

// PATCH /api/admin/content — update content
export async function PATCH(req: NextRequest) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, title, type, body, mediaUrl, thumbnail, category, tags, status } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const content = await db.content.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(type !== undefined ? { type: type as ContentType } : {}),
      ...(body !== undefined ? { body } : {}),
      ...(mediaUrl !== undefined ? { mediaUrl } : {}),
      ...(thumbnail !== undefined ? { thumbnail } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(status !== undefined ? {
        status: status as ContentStatus,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      } : {}),
    },
  });

  return NextResponse.json({ content });
}

// DELETE /api/admin/content — delete content
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  await db.content.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
