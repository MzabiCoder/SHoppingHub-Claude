import { and, asc, desc, eq, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { products } from "@/db/schema";
import type { Product } from "@/types/product";

function findProducts(where?: SQL) {
  return db.query.products.findMany({
    where: and(eq(products.isActive, true), where),
    with: {
      category: { columns: { slug: true, name: true } },
      stock: { columns: { quantity: true } },
    },
    orderBy: [desc(products.createdAt), asc(products.id)],
  });
}

type ProductRow = Awaited<ReturnType<typeof findProducts>>[number];

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    currency: row.currency,
    category: row.category,
    image: { src: row.imageUrl, alt: row.imageAlt },
    stock: row.stock?.quantity ?? 0,
    details: row.details,
  };
}

/** Active products, newest first. */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag("products", "categories");
  cacheLife("minutes");

  const rows = await findProducts();
  return rows.map(toProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  "use cache";
  cacheTag("products", "categories");
  cacheLife("minutes");

  const [row] = await findProducts(eq(products.slug, slug));
  return row ? toProduct(row) : undefined;
}

/** Other products, same category first, for "You may also like". */
export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const others = (await getProducts()).filter((o) => o.id !== product.id);
  const sameCategory = others.filter(
    (o) => o.category.slug === product.category.slug,
  );
  const rest = others.filter((o) => o.category.slug !== product.category.slug);
  return [...sameCategory, ...rest].slice(0, limit);
}
