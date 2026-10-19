import { asc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";
import type { Collection } from "@/types/product";

/** Categories with their tile images, in homepage order. */
export async function getCategories(): Promise<Collection[]> {
  "use cache";
  cacheTag("categories");
  cacheLife("minutes");

  const rows = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.id)],
  });
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    image: { src: row.imageUrl, alt: row.imageAlt },
  }));
}
