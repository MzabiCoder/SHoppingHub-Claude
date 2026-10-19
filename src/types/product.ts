export type Category = {
  slug: string;
  name: string;
};

export type ProductImage = {
  src: string;
  alt: string;
};

/** A category with its editorial image, as shown in the homepage tiles. */
export type Collection = Category & {
  image: ProductImage;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  /** Price in the smallest currency unit (e.g. cents). */
  price: number;
  currency: string;
  category: Category;
  image: ProductImage;
  /** Units available to sell. 0 means sold out. */
  stock: number;
  /** Short material, fit and care notes shown on the product page. */
  details: string[];
};
