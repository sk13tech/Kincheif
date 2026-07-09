import { getProductsPG, getCategoriesPG } from "@/lib/data";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [products, categories] = await Promise.all([
    getProductsPG(),
    getCategoriesPG(),
  ]);
  return <ShopClient initialProducts={products} initialCategories={categories} />;
}
