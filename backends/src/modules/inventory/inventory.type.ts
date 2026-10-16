export type MovementType = "in" | "out" | "adjustment";

export interface CreateMovementInput {
  productId: number;
  userId: number;
  type: MovementType;
  quantity: number;
  reason: string;
}

export interface RecordMovementInput {
  productId: number;
  userId: number | null;
  type: MovementType;
  quantity: number;
  reason: string;
}
