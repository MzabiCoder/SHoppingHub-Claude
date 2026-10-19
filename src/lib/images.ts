/**
 * Every Unsplash URL uses the same size-capping query so `next.config.ts` can
 * allow exactly this pattern. next/image then resizes from this source.
 */
export const UNSPLASH_QUERY = "?auto=format&fit=max&w=2000&q=80";

export function unsplash(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}${UNSPLASH_QUERY}`;
}
