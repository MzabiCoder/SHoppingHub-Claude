import { getStockStatus } from "@/lib/stock";

const dotClass = {
  "in-stock": "bg-foreground",
  "low-stock": "bg-danger",
  "sold-out": "border border-muted",
} as const;

export default function StockStatus({ stock }: { stock: number }) {
  const status = getStockStatus(stock);

  return (
    <p className="text-label flex items-center gap-2 uppercase">
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${dotClass[status.state]}`}
      />
      <span className={status.state === "low-stock" ? "text-danger" : ""}>
        {status.label}
      </span>
    </p>
  );
}
