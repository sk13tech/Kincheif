// Types shared between server page and client components
export type ProductData = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  images: string | null;
  sizes: string | null;
  categoryId: number;
  categoryName: string | null;
  stock: number;
  unit: string;
  weight: string | null;
  featured: boolean;
};

export type CategoryData = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
};

export type SiteConfig = {
  siteName: string;
  sitePhone: string;
  siteEmail: string;
  siteAddr: string;
  freeDelMin: string;
};

// Server-side fallback using PostgreSQL (used only if Firestore read fails on server)
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProductsPG(): Promise<ProductData[]> {
  return db
    .select({
      id: products.id, name: products.name, description: products.description,
      price: products.price, image: products.image, images: products.images,
      sizes: products.sizes, categoryId: products.categoryId,
      categoryName: categories.name, stock: products.stock, unit: products.unit,
      weight: products.weight, featured: products.featured,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.active, true));
}

export async function getCategoriesPG(): Promise<CategoryData[]> {
  return db
    .select({ id: categories.id, name: categories.name, description: categories.description, image: categories.image })
    .from(categories)
    .where(eq(categories.active, true));
}
