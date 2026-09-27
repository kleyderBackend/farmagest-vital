export interface CreateProductInput {
  categoryId: number;
  name: string;
  presentation?: string;
  description?: string;
  salePrice: number;
  currentStock?: number;
  minimumStock?: number;
  expirationDate?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}
