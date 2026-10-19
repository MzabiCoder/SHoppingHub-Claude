# Database: PostgreSQL + Drizzle ORM

The storefront's catalog data (categories, products and stock) is stored in PostgreSQL and read through [Drizzle ORM](https://orm.drizzle.team). This document explains how it is structured, how to set it up, and how the pages get their data.

**In scope:** categories, products, stock.
**Not yet built:** cart, orders, payments, reviews, wishlist, product variants, admin.

---

## 1. Quick start

You need a running PostgreSQL database. The quickest way is Docker:

```bash
docker run -d --name storefront-pg \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=storefront \
  -p 5432:5432 postgres:17
```

Set the connection string in `.env` (copy `.env.example` if you don't have one):

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storefront"
```

Create the tables and load the sample catalog:

```bash
npm run db:migrate   # creates the tables
npm run db:seed      # inserts 3 categories and 8 products with stock
npm run dev          # http://localhost:3000
```

> **The build needs the database.** `npm run build` reads products from the database to prerender each product page. It fails if the database is unreachable or empty, so always migrate and seed first.

---

## 2. Commands

| Command               | What it does                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `npm run db:generate` | Compares `src/db/schema.ts` with the last migration and writes a new SQL migration into `drizzle/`. Does not touch the database. |
| `npm run db:migrate`  | Applies any migrations in `drizzle/` that haven't run yet against the `DATABASE_URL` database.                                   |
| `npm run db:seed`     | Inserts or updates the starter catalog. Safe to run repeatedly.                                                                  |
| `npm run db:studio`   | Opens Drizzle Studio, a browser UI for viewing and editing the data.                                                             |

---

## 3. Database structure

```
┌──────────────┐        ┌──────────────┐        ┌────────────────┐
│  categories  │ 1    * │   products   │ 1    1 │ product_stock  │
│──────────────│────────│──────────────│────────│────────────────│
│ id (PK)      │        │ id (PK)      │        │ product_id (PK,│
│ slug (unique)│        │ slug (unique)│        │   FK)          │
│ name         │        │ category_id  │        │ quantity       │
│ image_url    │        │   (FK)       │        │ updated_at     │
│ image_alt    │        │ name, price… │        └────────────────┘
│ sort_order   │        └──────────────┘
└──────────────┘
```

- **One category has many products.** Every product belongs to exactly one category.
- **One product has one stock row.** It holds how many units are available.

### `categories`

| Column                     | Type                     | Notes                                |
| -------------------------- | ------------------------ | ------------------------------------ |
| `id`                       | integer, auto-generated  | Primary key                          |
| `slug`                     | text, unique             | e.g. `women`, `men`, `accessories`   |
| `name`                     | text                     | Display name, e.g. "Women"           |
| `image_url`, `image_alt`   | text                     | Image for the homepage category tile |
| `sort_order`               | integer, default 0       | Order of the tiles on the homepage   |
| `created_at`, `updated_at` | timestamp with time zone | Set automatically                    |

### `products`

| Column                     | Type                        | Notes                                                       |
| -------------------------- | --------------------------- | ----------------------------------------------------------- |
| `id`                       | integer, auto-generated     | Primary key                                                 |
| `slug`                     | text, unique                | Used in the URL: `/products/<slug>`                         |
| `name`, `description`      | text                        |                                                             |
| `price`                    | integer, must be ≥ 0        | In **cents** (minor units): `189000` = $1,890.00            |
| `currency`                 | 3 characters, default `USD` |                                                             |
| `category_id`              | integer → `categories.id`   | A category **can't be deleted** while products still use it |
| `image_url`, `image_alt`   | text                        | One image per product                                       |
| `details`                  | list of text                | Material and care bullet points on the product page         |
| `is_active`                | boolean, default true       | Set to false to hide a product without deleting it          |
| `created_at`, `updated_at` | timestamp with time zone    | "New arrivals" are ordered by `created_at`, newest first    |

### `product_stock`

| Column       | Type                     | Notes                                                 |
| ------------ | ------------------------ | ----------------------------------------------------- |
| `product_id` | integer → `products.id`  | Primary key. Deleting a product deletes its stock row |
| `quantity`   | integer, must be ≥ 0     | `0` means sold out                                    |
| `updated_at` | timestamp with time zone |                                                       |

**Why stock has its own table:**

- **It changes often.** Stock changes much more often than product details, so updating it doesn't rewrite the product row.
- **It's ready for variants.** When product variants such as sizes or colours are added later, stock can move to a per-variant table without restructuring `products`.

**How the shop shows stock:** the database stores only the number. The code decides the label (`src/lib/stock.ts`):

| Quantity | Label shown                |
| -------- | -------------------------- |
| 0        | Sold out (button disabled) |
| 1–3      | Only N left (in red)       |
| 4+       | In stock                   |

---

## 4. Files

### Database layer (new)

| File                            | Purpose                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `drizzle.config.ts`             | Drizzle Kit settings: where the schema is, where migrations go, and which database to use. Reads `.env` the same way Next.js does.   |
| `src/db/schema.ts`              | The three tables, their constraints, and the relationships between them. **This is the source of truth for the database structure.** |
| `src/db/index.ts`               | Creates the database connection and exports `db`. Marked `server-only`, so it can never end up in browser code.                      |
| `src/db/seed.ts`                | The starter catalog, which was previously hard-coded in the app.                                                                     |
| `drizzle/0000_init_catalog.sql` | The generated SQL that creates the tables. Committed to git.                                                                         |
| `drizzle/meta/`                 | Drizzle's bookkeeping for migrations. Commit it and don't edit it by hand.                                                           |

### Data functions (rewritten to use the database)

| File                    | Functions                                                                |
| ----------------------- | ------------------------------------------------------------------------ |
| `src/lib/products.ts`   | `getProducts()`, `getProductBySlug(slug)`, `getRelatedProducts(product)` |
| `src/lib/categories.ts` | `getCategories()` (replaces the old `getCollections()`)                  |

### Updated to use the async functions

- `src/app/page.tsx` (homepage)
- `src/app/products/page.tsx` (listing)
- `src/app/products/[slug]/page.tsx` (product detail)
- `src/components/ProductCard.tsx`
- `src/types/product.ts`: `category` is now an object `{ slug, name }` instead of a fixed list of strings, and `id` is a number.

### Removed

- `src/lib/collections.ts`: category tiles now come from the `categories` table.

---

## 5. How pages get their data

```
Page (e.g. /products)
   │  await getProducts()
   ▼
src/lib/products.ts      ← cached for ~1 minute ("use cache")
   │  Drizzle query
   ▼
src/db/index.ts  →  PostgreSQL
```

- **Pages never talk to the database directly.** They call functions in `src/lib/`, which run the query and convert database rows into the shapes the components already used (`Product`, `Collection`). This is why the page designs didn't need to change.
- **Results are cached.** This project uses Next.js Cache Components, which requires database reads to be cached. Each data function is marked `"use cache"` with a lifetime of about a minute:
  - pages are served from cache and load fast;
  - a change in the database, like a new stock quantity, appears on the site within about a minute;
  - to show a change **immediately**, for example from a future admin screen or checkout, call `updateTag("products")` or `updateTag("categories")` from `next/cache` after writing.

---

## 6. Changing the schema later

Always follow these four steps:

1. **Edit** `src/db/schema.ts`.
2. **Generate** the migration: `npm run db:generate`.
3. **Review** the new `.sql` file in `drizzle/` and commit it.
4. **Apply** it: `npm run db:migrate`, locally and in every deployed environment.

Drizzle also has `drizzle-kit push`, which changes the database directly without a migration file. Only use it on a throwaway local database, never on a shared or production one.

**Deployments:** run `npm run db:migrate` before `npm run build`.

---

## 7. How it was verified

The setup was tested against a temporary PostgreSQL 17 container:

- **Migration:** it created the 3 tables, foreign keys, checks and unique slugs.
- **Seeding:** running it twice still gave exactly 3 categories, 8 products and 8 stock rows, with no duplicates.
- **Constraints:**
  - setting stock to `-1` was rejected;
  - deleting a category that still has products was rejected.
- **Build:** the production build prerendered all 8 product pages from the database.
- **Pages:**
  - the homepage, listing and product pages matched the earlier design;
  - stock labels matched the database;
  - unknown products show the not-found page.
- **Stock updates:** setting a product's quantity to 0 in the database made its page show "Sold out" within about 30 seconds.

---

## 8. Known limitations

- **No category filtering yet.** Category tiles and breadcrumbs link to `/products`, which shows everything.
- **Related products are picked in code.** "You may also like" filters the full product list rather than querying the database. That's fine for a small catalog; switch to a query as it grows.
- **Stock can lag by about a minute** because of caching. That's acceptable while there's no checkout; once there is one, refresh the cache after each order.
- **`npm audit` warning:** it reports an old version of esbuild inside `drizzle-kit`. drizzle-kit is a development-only tool that is never shipped to the site, and the suggested "fix" would downgrade it, so the warning has been left.
