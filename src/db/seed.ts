/**
 * Loads the starter catalog. Safe to rerun: rows are upserted by slug.
 * Run with `npm run db:seed` after `npm run db:migrate`.
 */
import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { unsplash } from "@/lib/images";
import { categories, products, productStock } from "./schema";

loadEnvConfig(process.cwd());

type CategorySeed = typeof categories.$inferInsert;
type ProductSeed = Omit<typeof products.$inferInsert, "categoryId"> & {
  category: string;
  stock: number;
};

const categorySeed: CategorySeed[] = [
  {
    slug: "women",
    name: "Women",
    sortOrder: 1,
    imageUrl: unsplash("1539109136881-3be0616acf4b"),
    imageAlt: "Woman in a pale blue coat in a cathedral square",
  },
  {
    slug: "men",
    name: "Men",
    sortOrder: 2,
    imageUrl: unsplash("1617137968427-85924c800a22"),
    imageAlt: "Man in a navy tailored suit walking past a glass facade",
  },
  {
    slug: "accessories",
    name: "Accessories",
    sortOrder: 3,
    imageUrl: unsplash("1594223274512-ad4803739b7c"),
    imageAlt: "Teal leather top-handle bag beside a plant and books",
  },
];

const productSeed: ProductSeed[] = [
  {
    slug: "leather-biker-jacket",
    name: "Leather Biker Jacket",
    description:
      "Supple black leather cut close to the body, with an asymmetric zip and silver-tone hardware.",
    price: 189000,
    currency: "USD",
    category: "men",
    imageUrl: unsplash("1551028719-00167b16eac5"),
    imageAlt: "Black leather biker jacket laid flat on white fabric",
    stock: 12,
    details: [
      "100% lambskin leather",
      "Viscose lining",
      "Asymmetric zip closure",
      "Made in Italy",
      "Specialist leather clean only",
    ],
  },
  {
    slug: "tailored-bomber",
    name: "Tailored Bomber",
    description:
      "A lightweight bomber in rust technical twill with ribbed trims and a clean zip front.",
    price: 98000,
    currency: "USD",
    category: "women",
    imageUrl: unsplash("1591047139829-d91aecb6caea"),
    imageAlt: "Rust bomber jacket held up on a hanger against a grey wall",
    stock: 3,
    details: [
      "68% polyester, 32% cotton twill",
      "Ribbed collar, cuffs and hem",
      "Two welt pockets",
      "Machine wash cold",
    ],
  },
  {
    slug: "crochet-poncho",
    name: "Crochet Poncho",
    description:
      "Hand-finished open crochet in ivory cotton, edged with a long fringe.",
    price: 64000,
    currency: "USD",
    category: "women",
    imageUrl: unsplash("1434389677669-e08b4cac3105"),
    imageAlt: "Ivory crochet poncho with fringe on a wooden hanger",
    stock: 8,
    details: [
      "100% organic cotton",
      "Hand-finished crochet",
      "Fringed hem",
      "Hand wash cold, dry flat",
    ],
  },
  {
    slug: "classic-tee",
    name: "Classic Tee",
    description:
      "Heavyweight organic cotton jersey with a relaxed fit and a narrow rib collar.",
    price: 32000,
    currency: "USD",
    category: "men",
    imageUrl: unsplash("1521572163474-6864f9cf17ab"),
    imageAlt: "Model wearing a plain white crew-neck t-shirt",
    stock: 40,
    details: [
      "100% organic cotton, 240gsm",
      "Relaxed fit",
      "Narrow rib collar",
      "Machine wash at 30°C",
    ],
  },
  {
    slug: "round-metal-sunglasses",
    name: "Round Metal Sunglasses",
    description:
      "Fine gold-tone frames with dark green lenses and adjustable nose pads.",
    price: 45000,
    currency: "USD",
    category: "accessories",
    imageUrl: unsplash("1511499767150-a48a237f0083"),
    imageAlt: "Round gold-frame sunglasses on a white surface",
    stock: 15,
    details: [
      "Gold-tone metal frame",
      "Green mineral glass lenses",
      "100% UV protection",
      "Leather case included",
    ],
  },
  {
    slug: "floral-stiletto-pump",
    name: "Floral Stiletto Pump",
    description: "A pointed-toe pump in printed satin on a slim 100mm heel.",
    price: 79000,
    currency: "USD",
    category: "women",
    imageUrl: unsplash("1543163521-1bf539c55dd2"),
    imageAlt: "Pair of blue floral stiletto pumps against a pale blue wall",
    stock: 0,
    details: [
      "Printed silk satin upper",
      "Leather lining and sole",
      "100mm heel",
      "Made in Italy",
    ],
  },
  {
    slug: "leather-strap-watch",
    name: "Leather Strap Watch",
    description:
      "A minimal 38mm dial with a rose-gold case on a soft suede strap.",
    price: 120000,
    currency: "USD",
    category: "accessories",
    imageUrl: unsplash("1524592094714-0f0654e20314"),
    imageAlt: "Hand holding a watch with a white dial and taupe strap",
    stock: 2,
    details: [
      "38mm rose-gold-tone steel case",
      "Swiss quartz movement",
      "Suede strap with pin buckle",
      "Water resistant to 30m",
    ],
  },
  {
    slug: "tan-moto-jacket",
    name: "Tan Moto Jacket",
    description: "Soft tan lambskin with a wide notch collar and a belted hem.",
    price: 215000,
    currency: "USD",
    category: "men",
    imageUrl: unsplash("1487222477894-8943e31ef7b2"),
    imageAlt: "Model in a tan leather moto jacket and round sunglasses",
    stock: 5,
    details: [
      "100% lambskin leather",
      "Cotton lining",
      "Belted hem with buckle",
      "Specialist leather clean only",
    ],
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  try {
    await db.transaction(async (tx) => {
      const categoryIds = new Map<string, number>();
      for (const category of categorySeed) {
        const [row] = await tx
          .insert(categories)
          .values(category)
          .onConflictDoUpdate({ target: categories.slug, set: category })
          .returning({ id: categories.id });
        categoryIds.set(category.slug, row.id);
      }

      for (const { category, stock, ...product } of productSeed) {
        const categoryId = categoryIds.get(category);
        if (!categoryId) throw new Error(`Unknown category "${category}"`);

        const values = { ...product, categoryId };
        const [row] = await tx
          .insert(products)
          .values(values)
          .onConflictDoUpdate({ target: products.slug, set: values })
          .returning({ id: products.id });

        await tx
          .insert(productStock)
          .values({ productId: row.id, quantity: stock })
          .onConflictDoUpdate({
            target: productStock.productId,
            set: { quantity: stock },
          });
      }
    });

    console.log(
      `Seeded ${categorySeed.length} categories and ${productSeed.length} products.`,
    );
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
