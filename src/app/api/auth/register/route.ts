import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { hashPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check if phone already exists
    const existing = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, data.phone));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    const [customer] = await db
      .insert(customers)
      .values({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        passwordHash,
        address: data.address || null,
        city: data.city || null,
        pincode: data.pincode || null,
      })
      .returning();

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
    if (error instanceof z.ZodError) {
      const zodErr = error as z.ZodError<unknown>;
      return NextResponse.json(
        { error: zodErr.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
