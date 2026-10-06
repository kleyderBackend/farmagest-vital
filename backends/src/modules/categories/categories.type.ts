export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  categoryId: number;
  name?: string;
  description?: string;
  isActive?: boolean;
}
