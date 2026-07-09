import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, customers } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

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

    const allOrders = await db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        customerName: customers.name,
        customerPhone: customers.phone,
        status: orders.status,
        totalAmount: orders.totalAmount,
        deliveryAddress: orders.deliveryAddress,
        deliveryCity: orders.deliveryCity,
        deliveryPincode: orders.deliveryPincode,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(authHeader.split(" ")[1]);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ message: "Order updated" });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
