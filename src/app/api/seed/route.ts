import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products, adminUsers } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    // Check if already seeded
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) {
      return NextResponse.json({ message: "Already seeded" });
    }

    // Create admin user
    const adminHash = await hashPassword("admin123");
    await db.insert(adminUsers).values({
      username: "admin",
      passwordHash: adminHash,
      name: "Shop Owner",
    });

    // Create categories
    const [chipsCategory] = await db
      .insert(categories)
      .values({
        name: "Chips",
        description: "Crispy and crunchy raw chips",
        image: "/images/chips.jpg",
      })
      .returning();

    const [biscuitsCategory] = await db
      .insert(categories)
      .values({
        name: "Biscuits",
        description: "Delicious biscuits & cookies",
        image: "/images/biscuits.jpg",
      })
      .returning();

    // Create products - Chips
    const chipProducts = [
      { name: "Classic Salted Potato Chips", description: "Traditional crispy potato chips with perfect salt", price: "30.00", stock: 100, weight: "100g", featured: true },
      { name: "Masala Chips", description: "Spicy masala flavored potato chips", price: "35.00", stock: 80, weight: "100g", featured: true },
      { name: "Banana Chips", description: "Crispy Kerala-style banana chips", price: "40.00", stock: 60, weight: "150g", featured: false },
      { name: "Sweet Potato Chips", description: "Healthy and delicious sweet potato chips", price: "45.00", stock: 50, weight: "100g", featured: false },
      { name: "Tapioca Chips", description: "Crunchy tapioca root chips", price: "35.00", stock: 70, weight: "100g", featured: true },
      { name: "Raw Potato Chips (Unfried)", description: "Sun-dried raw potato chips ready to fry", price: "60.00", stock: 40, weight: "250g", featured: true },
      { name: "Pepper Chips", description: "Black pepper seasoned potato chips", price: "38.00", stock: 55, weight: "100g", featured: false },
      { name: "Garlic Chips", description: "Roasted garlic flavored chips", price: "38.00", stock: 45, weight: "100g", featured: false },
    ];

    for (const p of chipProducts) {
      await db.insert(products).values({
        ...p,
        categoryId: chipsCategory.id,
        unit: "packet",
      });
    }

    // Create products - Biscuits
    const biscuitProducts = [
      { name: "Butter Cookies", description: "Rich and buttery Danish-style cookies", price: "50.00", stock: 90, weight: "200g", featured: true },
      { name: "Chocolate Cream Biscuits", description: "Crunchy biscuits with chocolate cream filling", price: "25.00", stock: 120, weight: "100g", featured: true },
      { name: "Digestive Biscuits", description: "Healthy whole wheat digestive biscuits", price: "35.00", stock: 80, weight: "200g", featured: false },
      { name: "Coconut Biscuits", description: "Crispy biscuits with real coconut flavor", price: "30.00", stock: 100, weight: "150g", featured: true },
      { name: "Cream Wafer Rolls", description: "Light and crispy wafer rolls with cream", price: "45.00", stock: 60, weight: "150g", featured: false },
      { name: "Rusk Toast", description: "Crunchy cardamom-flavored rusk", price: "40.00", stock: 70, weight: "300g", featured: true },
      { name: "Marie Gold Biscuits", description: "Light and crispy Marie biscuits", price: "20.00", stock: 150, weight: "100g", featured: false },
      { name: "Cashew Cookies", description: "Premium cookies loaded with cashew nuts", price: "65.00", stock: 40, weight: "200g", featured: false },
    ];

    for (const p of biscuitProducts) {
      await db.insert(products).values({
        ...p,
        categoryId: biscuitsCategory.id,
        unit: "packet",
      });
    }

    return NextResponse.json({ message: "Seeded successfully!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
