import * as repo from "../Repository/category.repository";
export const CategoryService = {
  list: () => repo.listCategories(),
  bySlug: (slug: string) => repo.getCategoryBySlug(slug),
};
