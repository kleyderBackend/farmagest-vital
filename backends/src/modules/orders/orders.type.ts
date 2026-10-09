export type OrderStatus =
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

export interface UpdateOrderStatusInput {
  orderId: number;
  status: OrderStatus;
}

export interface UpdateOrderDeliveryInput {
  orderId: number;
  deliveryAddress?: string;
  deliveryNeighborhood?: string;
  deliveryCity?: string;
  deliveryNote?: string;
}
