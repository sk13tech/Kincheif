import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(authHeader.split(" ")[1]);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await db
      .select({
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
        email: customers.email,
        address: customers.address,
        city: customers.city,
        pincode: customers.pincode,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .orderBy(desc(customers.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
