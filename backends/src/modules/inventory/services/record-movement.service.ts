import { createMovement } from "../repositories/create-movement.repository";
import type { RecordMovementInput } from "../inventory.type";
import type { QueryExecutor } from "../../sales/sales.type";

export async function recordMovementService(data: RecordMovementInput, db: QueryExecutor) {
  if (data.quantity === 0) return;
  return createMovement(data, db);
}
