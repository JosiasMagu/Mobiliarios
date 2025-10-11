import cats from "../Data/categories.mock.json";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  [k: string]: any;
};

const ALL: Category[] = (cats as any[]) as Category[];

export async function listCategories(): Promise<Category[]> {
  return ALL;
}
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return ALL.find(c => c.slug === slug);
}
