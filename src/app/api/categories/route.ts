import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.active, true));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
