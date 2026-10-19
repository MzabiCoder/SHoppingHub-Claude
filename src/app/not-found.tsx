import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-start gap-4 py-10 md:py-14">
      <h1 className="text-title">Page not found</h1>
      <Link href="/" className="btn btn-secondary">
        Back to home
      </Link>
    </div>
  );
}
