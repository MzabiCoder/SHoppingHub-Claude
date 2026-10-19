export type StockStatus = {
  state: "in-stock" | "low-stock" | "sold-out";
  label: string;
};

/** Stock at or below this count is shown as low stock. */
const LOW_STOCK_THRESHOLD = 3;

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return { state: "sold-out", label: "Sold out" };
  if (stock <= LOW_STOCK_THRESHOLD) {
    return { state: "low-stock", label: `Only ${stock} left` };
  }
  return { state: "in-stock", label: "In stock" };
}
