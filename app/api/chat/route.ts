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
  } catch {
    return null;
  }
}

// GET /api/chat?with=userId — messages between current user and another user
// GET /api/chat               — list of conversations (latest message per contact)
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");

  if (withUserId) {
    // Fetch messages between the two users, mark incoming as read
    const messages = await db.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: withUserId },
          { senderId: withUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Mark all unread incoming messages as read
    await db.chatMessage.updateMany({
      where: { senderId: withUserId, receiverId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ messages });
  }

  // Return conversation list: unique contacts with latest message
  const latest = await db.chatMessage.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, avatar: true, role: true } },
      receiver: { select: { id: true, name: true, avatar: true, role: true } },
    },
  });

  // Dedupe by conversation partner
  const seen = new Set<string>();
  const conversations: typeof latest = [];
  for (const msg of latest) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!seen.has(partnerId)) {
      seen.add(partnerId);
      conversations.push(msg);
    }
  }

  // Count unread per partner
  const unreadCounts = await db.chatMessage.groupBy({
    by: ["senderId"],
    where: { receiverId: userId, isRead: false },
    _count: { id: true },
  });
  const unreadMap = Object.fromEntries(unreadCounts.map((r) => [r.senderId, r._count.id]));

  const result = conversations.map((msg) => {
    const partner = msg.senderId === userId ? msg.receiver : msg.sender;
    return {
      partnerId: partner.id,
      partnerName: partner.name,
      partnerAvatar: partner.avatar,
      partnerRole: partner.role,
      lastMessage: msg.content,
      lastMessageTime: msg.createdAt,
      isLastMessageMine: msg.senderId === userId,
      unread: unreadMap[partner.id] || 0,
    };
  });

  return NextResponse.json({ conversations: result });
}

// POST /api/chat — send a message
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to, content } = await req.json();
  if (!to || !content?.trim()) {
    return NextResponse.json({ error: "Missing recipient or content." }, { status: 400 });
  }

  const message = await db.chatMessage.create({
    data: { senderId: userId, receiverId: to, content: content.trim() },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  return NextResponse.json({ message }, { status: 201 });
}
