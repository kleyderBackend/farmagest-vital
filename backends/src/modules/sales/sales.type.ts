export type SaleStatus =
  | "pending"
  | "processing"
  | "preparing"
  | "on_the_way"
  | "completed"
  | "delivered"
  | "cancelled";

export interface QueryExecutor {
  query(sql: string, values?: any[]): Promise<[any, any]>;
}

export interface CreateSaleInput {
  customerId: number;
  total?: number;
  status?: SaleStatus;
  deliveryAddress?: string;
  deliveryNeighborhood?: string;
  deliveryCity?: string;
  deliveryNote?: string;
  notes?: string;
}

export interface CreateSaleServiceItemInput {
  productId: number;
  quantity: number;
}

export interface CheckoutCustomerInput {
  fullName: string;
  phone: string;
  email: string;
  address?: string;
}

export interface CreateSaleServiceInput {
  customerId?: number;
  customer?: CheckoutCustomerInput;
  delivery?: {
    address?: string;
    neighborhood?: string;
    city?: string;
    note?: string;
  };
  notes?: string;
  items: CreateSaleServiceItemInput[];
}

export interface CreateSaleItemInput {
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleProductRow {
  product_id: number;
  name: string;
  sale_price: string;
  current_stock: number;
  is_available: boolean;
  is_active: boolean;
  expiration_date: string | null;
}

export interface SaleDateRangeInput {
  startDate?: string;
  endDate?: string;
}
