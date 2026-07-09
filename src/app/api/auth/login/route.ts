import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { verifyPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, phone));

    if (!customer) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, customer.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: customer.id,
      role: "customer",
      name: customer.name,
    });

    return NextResponse.json({
      token,
      user: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
