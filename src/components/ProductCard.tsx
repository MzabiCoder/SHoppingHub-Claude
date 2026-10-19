import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getStockStatus } from "@/lib/stock";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  const stock = getStockStatus(product.stock);

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="media-frame mb-4">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 80rem) 25vw, (min-width: 48rem) 33vw, 50vw"
          className={`group-hover:scale-[1.03] ${stock.state === "sold-out" ? "opacity-60" : ""}`}
        />
        {stock.state !== "in-stock" && (
          <span className="bg-background text-caption absolute top-3 left-3 px-2 py-1 uppercase">
            {stock.label}
          </span>
        )}
      </div>
      <p className="text-caption text-muted mb-1 uppercase">
        {product.category.name}
      </p>
      <h3 className="text-body group-hover:underline group-hover:underline-offset-4">
        {product.name}
      </h3>
      <p className="text-body text-muted">
        {formatPrice(product.price, product.currency)}
      </p>
    </Link>
  );
}
