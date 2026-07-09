import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customers, products } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { count, sum, eq } from "drizzle-orm";

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

    const [orderStats] = await db
      .select({
        totalOrders: count(),
        totalRevenue: sum(orders.totalAmount),
      })
      .from(orders);

    const [pendingStats] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "pending"));

    const [customerStats] = await db
      .select({ count: count() })
      .from(customers);

    const [productStats] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.active, true));

    return NextResponse.json({
      totalOrders: orderStats.totalOrders,
      totalRevenue: orderStats.totalRevenue || "0",
      pendingOrders: pendingStats.count,
      totalCustomers: customerStats.count,
      totalProducts: productStats.count,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
