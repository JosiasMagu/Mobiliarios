// Tipos base para toda a app (loja + admin)

export type ProductStatus = "published" | "draft";

export interface ProductDimensions {
  width?: number;   // cm
  height?: number;  // cm
  depth?: number;   // cm
  weight?: number;  // kg
}

export interface Product {
  // já existentes no teu projeto (mantidos para compatibilidade)
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];     // usado na loja
  gallery?: string[];    // usado na loja
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  discount?: number;
  colors?: string[];
  inStock: boolean;
  categorySlug?: string;

  // extensões para o Admin (todos opcionais para não quebrar nada)
  description?: string;
  categoryId?: string;
  categoryName?: string;
  stockQty?: number;            // quantidade
  status?: ProductStatus;       // published|draft
  dimensions?: ProductDimensions;
  tags?: string[];              // SEO/pesquisa
  createdAt?: string;
  updatedAt?: string;
}

// Listagens paginadas no Admin
export interface ProductQuery {
  search?: string;
  page?: number;
  pageSize?: number;
  categoryId?: string;
  status?: ProductStatus | "all";
  sort?: "name_asc" | "name_desc" | "price_asc" | "price_desc" | "created_desc";
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Form shapes para Admin
export type ProductCreate = Omit<
  Product,
  "id" | "createdAt" | "updatedAt"
>;

export type ProductUpdate = Partial<Product>;
