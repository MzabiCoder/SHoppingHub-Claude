import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <nav className="container-page h-header grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center gap-6">
          <Link href="/products" className="eyebrow link-quiet">
            Products
          </Link>
        </div>
        <Link href="/" className="text-heading tracking-[0.3em] uppercase">
          Store
        </Link>
        <div />
      </nav>
    </header>
  );
}
