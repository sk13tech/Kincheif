import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { verifyPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username));

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: admin.id,
      role: "admin",
      name: admin.name,
    });

    return NextResponse.json({
      token,
      user: { id: admin.id, name: admin.name, role: "admin" },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
