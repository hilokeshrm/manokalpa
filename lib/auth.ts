import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "./db";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(token, secret);
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        avatar: true,
        profile: true,
        healthDetails: true,
        _count: {
          select: {
            appointmentsAsUser: true,
            reflections: true,
            assessmentAnswers: true,
          },
        },
      },
    });
    return user;
  } catch {
    return null;
  }
}

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth-token=([^;]+)/);
  if (!match) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const { payload } = await jwtVerify(match[1], secret);
    return payload.userId as string;
  } catch {
    return null;
  }
}
