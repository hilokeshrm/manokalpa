import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, mobile, email, password, role } = await req.json();

    if (!name || !mobile || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.user.findFirst({
      where: { OR: [{ email }, { mobile }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or mobile already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        mobile,
        email,
        password: hashedPassword,
        role: role === "COUNSELLOR" ? "COUNSELLOR" : "USER",
        profile: { create: {} },
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user, success: true }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
