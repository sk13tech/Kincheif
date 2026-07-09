import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

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
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        categoryId: products.categoryId,
        categoryName: categories.name,
        stock: products.stock,
        unit: products.unit,
        weight: products.weight,
        active: products.active,
        featured: products.featured,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(authHeader.split(" ")[1]);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const [product] = await db
      .insert(products)
      .values({
        name: body.name,
        description: body.description || null,
        price: body.price,
        image: body.image || null,
        categoryId: body.categoryId,
        stock: body.stock || 0,
        unit: body.unit || "packet",
        weight: body.weight || null,
        active: body.active ?? true,
        featured: body.featured ?? false,
      })
      .returning();

    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
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

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    await db.update(products).set(updateData).where(eq(products.id, id));

    return NextResponse.json({ message: "Product updated" });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
