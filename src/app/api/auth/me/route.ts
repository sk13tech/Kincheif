import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(authHeader.split(" ")[1]);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [customer] = await db
      .select({
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
        email: customers.email,
        avatar: customers.avatar,
        address: customers.address,
        city: customers.city,
        pincode: customers.pincode,
      })
      .from(customers)
      .where(eq(customers.id, user.id));

    if (!customer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(authHeader.split(" ")[1]);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, address, city, pincode } = body;

    await db
      .update(customers)
      .set({
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(address !== undefined && { address: address || null }),
        ...(city !== undefined && { city: city || null }),
        ...(pincode !== undefined && { pincode: pincode || null }),
      })
      .where(eq(customers.id, user.id));

    return NextResponse.json({ message: "Profile updated" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
