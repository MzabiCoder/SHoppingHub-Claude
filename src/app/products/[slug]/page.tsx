import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Disclosure from "@/components/Disclosure";
import ProductCard from "@/components/ProductCard";
import StockStatus from "@/components/StockStatus";
import { formatPrice } from "@/lib/format";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/products";
import { getStockStatus } from "@/lib/stock";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = product.category.name;
  const soldOut = getStockStatus(product.stock).state === "sold-out";
  const related = await getRelatedProducts(product);

  return (
    <>
      <div className="container-page py-6 md:py-10">
        <nav aria-label="Breadcrumb" className="mb-6 md:mb-8">
          <ol className="text-caption text-muted flex flex-wrap items-center gap-2 uppercase">
            <li>
              <Link href="/" className="link-quiet">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/products" className="link-quiet">
                {category}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 md:grid-cols-12 md:gap-12 lg:gap-16">
          {/* Edge to edge on phones, 7 of 12 columns from md up. */}
          <div className="-mx-gutter md:col-span-7 md:mx-0">
            <div className="media-frame">
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                preload
                sizes="(min-width: 48rem) 58vw, 100vw"
              />
            </div>
          </div>

          <div className="flex flex-col gap-8 md:sticky md:top-[calc(var(--spacing-header)+2.5rem)] md:col-span-5 md:self-start">
            <header className="flex flex-col gap-3">
              <p className="eyebrow text-muted">{category}</p>
              <h1 className="text-title">{product.name}</h1>
              <p className="text-heading">
                {formatPrice(product.price, product.currency)}
              </p>
            </header>

            <StockStatus stock={product.stock} />

            <p className="text-muted max-w-prose">{product.description}</p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="btn btn-primary w-full"
                disabled={soldOut}
              >
                {soldOut ? "Sold out" : "Add to bag"}
              </button>
              <p className="text-caption text-muted">
                Complimentary shipping and 30-day returns.
              </p>
            </div>

            <div className="border-t">
              <Disclosure title="Details" defaultOpen>
                <ul className="flex flex-col gap-1">
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </Disclosure>
              <Disclosure title="Shipping & returns">
                <p>
                  Free express delivery in 2–4 business days. Returns and
                  exchanges are free within 30 days of delivery.
                </p>
              </Disclosure>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-page pt-section pb-section">
          <header className="mb-8 flex items-end justify-between gap-4 md:mb-12">
            <div className="flex flex-col gap-3">
              <p className="eyebrow text-muted">Discover more</p>
              <h2 className="text-title">You may also like</h2>
            </div>
            <Link href="/products" className="eyebrow link shrink-0">
              View all
            </Link>
          </header>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
