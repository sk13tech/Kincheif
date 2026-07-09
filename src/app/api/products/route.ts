import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const conditions = [eq(products.active, true)];

    if (categoryId) {
      conditions.push(eq(products.categoryId, parseInt(categoryId)));
    }

    if (featured === "true") {
      conditions.push(eq(products.featured, true));
    }

    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
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
        featured: products.featured,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
