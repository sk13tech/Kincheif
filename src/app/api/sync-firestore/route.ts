import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db.select().from(products).where(eq(products.active, true));
    const allCategories = await db.select().from(categories).where(eq(categories.active, true));

    return NextResponse.json({
      products: allProducts.map(p => ({
        pgId: p.id, name: p.name, description: p.description, price: String(p.price),
        image: p.image, images: p.images, sizes: p.sizes, categoryId: p.categoryId,
        stock: p.stock, unit: p.unit, weight: p.weight, active: true, featured: p.featured,
      })),
      categories: allCategories.map(c => ({
        pgId: c.id, name: c.name, description: c.description, image: c.image, active: true,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
