export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  parentId?: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
