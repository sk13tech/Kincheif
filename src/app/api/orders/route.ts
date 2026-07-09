import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
});

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item required"),
  deliveryAddress: z.string().min(5, "Address is required"),
  deliveryCity: z.string().optional(),
  deliveryPincode: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(authHeader.split(" ")[1]);
    if (!user || user.role !== "customer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = orderSchema.parse(body);

    // Fetch product details and calculate totals
    let totalAmount = 0;
    const itemsWithDetails: Array<{
      productId: number;
      productName: string;
      quantity: number;
      price: string;
      total: string;
    }> = [];

    for (const item of data.items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;

      itemsWithDetails.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal.toFixed(2),
      });
    }

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        customerId: user.id,
        totalAmount: totalAmount.toFixed(2),
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity || null,
        deliveryPincode: data.deliveryPincode || null,
        notes: data.notes || null,
      })
      .returning();

    // Create order items
    for (const item of itemsWithDetails) {
      await db.insert(orderItems).values({
        orderId: order.id,
        ...item,
      });

      // Decrease stock
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));
      if (product) {
        await db
          .update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.id, item.productId));
      }
    }

    return NextResponse.json({
      message: "Order placed successfully!",
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
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
    console.error("Order error:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}

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

    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, user.id))
      .orderBy(desc(orders.createdAt));

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      customerOrders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
