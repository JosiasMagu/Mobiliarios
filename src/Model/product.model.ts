export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  gallery?: string[];
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  discount?: number;
  colors?: string[];
  inStock: boolean;
  categorySlug?: string;
}
