import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories } from "@/lib/categories";
import { unsplash } from "@/lib/images";
import { getProducts } from "@/lib/products";

const services = [
  {
    title: "Complimentary shipping",
    body: "Free express delivery on every order, packed in our signature box.",
  },
  {
    title: "Easy returns",
    body: "Return or exchange any piece within 30 days, free of charge.",
  },
  {
    title: "Client services",
    body: "Our advisors are available seven days a week by phone or email.",
  },
];

export default async function Home() {
  const [products, collections] = await Promise.all([
    getProducts().then((all) => all.slice(0, 8)),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero: one image on phones, a two-image diptych from md up. */}
      <section className="bg-surface relative h-[calc(100svh-var(--spacing-header))] min-h-[34rem] overflow-hidden">
        <div className="absolute inset-0 grid md:grid-cols-2">
          <div className="relative">
            <Image
              src={unsplash("1539533018447-63fcce2678e3")}
              alt="Model in a belted camel wool coat on stone steps"
              fill
              preload
              sizes="(min-width: 48rem) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative hidden md:block">
            <Image
              src={unsplash("1485968579580-b6d095142e6e")}
              alt="Woman in a dark plaid coat walking down a city street"
              fill
              loading="eager"
              sizes="50vw"
              className="object-cover"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
        <div className="container-page absolute inset-x-0 bottom-0 flex flex-col items-center gap-5 pb-12 text-center text-white md:pb-16">
          <p className="eyebrow">Autumn–Winter 2026</p>
          <h1 className="text-display">The Art of Layering</h1>
          <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/products" className="btn btn-light">
              Shop women
            </Link>
            <Link href="/products" className="btn btn-light">
              Shop men
            </Link>
          </div>
        </div>
      </section>

      {/* Collections: swipeable rail on phones, three columns from md up. */}
      <section className="container-page section">
        <header className="mb-8 flex flex-col items-center gap-3 text-center md:mb-12">
          <p className="eyebrow text-muted">Collections</p>
          <h2 className="text-title">Shop by category</h2>
        </header>
        <div className="no-scrollbar -mx-gutter px-gutter scroll-px-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href="/products"
              className="group block w-[78%] shrink-0 snap-start md:w-auto"
            >
              <div className="media-frame">
                <Image
                  src={collection.image.src}
                  alt={collection.image.alt}
                  fill
                  sizes="(min-width: 48rem) 33vw, 80vw"
                  className="group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h3 className="text-heading">{collection.name}</h3>
                <span className="eyebrow link-quiet group-hover:decoration-current">
                  Discover
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-page pb-section">
        <header className="mb-8 flex items-end justify-between gap-4 md:mb-12">
          <div className="flex flex-col gap-3">
            <p className="eyebrow text-muted">Just in</p>
            <h2 className="text-title">New arrivals</h2>
          </div>
          <Link href="/products" className="eyebrow link shrink-0">
            View all
          </Link>
        </header>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Editorial split: image and story side by side from md up. */}
      <section className="bg-surface grid md:grid-cols-2">
        <div className="relative aspect-4/5 md:aspect-auto md:min-h-[44rem]">
          <Image
            src={unsplash("1558769132-cb1aea458c5e")}
            alt="Neutral knitwear and coats hanging on a clothing rail"
            fill
            sizes="(min-width: 48rem) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="px-gutter py-section flex items-center justify-center">
          <div className="flex max-w-md flex-col items-start gap-6">
            <p className="eyebrow text-muted">The Edit</p>
            <h2 className="text-title">Quiet knitwear, made to last</h2>
            <p className="text-muted">
              Cashmere, merino and soft bouclé in a palette of stone, oat and
              charcoal. Pieces designed to be worn season after season.
            </p>
            <Link href="/products" className="btn btn-secondary btn-block">
              Explore the edit
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-page grid gap-10 py-16 text-center sm:grid-cols-3 md:py-20">
        {services.map((service) => (
          <div key={service.title} className="flex flex-col items-center gap-3">
            <h3 className="eyebrow">{service.title}</h3>
            <p className="text-muted max-w-xs">{service.body}</p>
          </div>
        ))}
      </section>
    </>
  );
}
