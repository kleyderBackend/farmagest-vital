import { pool } from "../../../config/db";
import type { QueryExecutor } from "../../sales/sales.type";
import type { RecordMovementInput } from "../inventory.type";

export async function createMovement(data: RecordMovementInput, db: QueryExecutor = pool) {
  await db.query(
    `
    INSERT INTO inventory_movements (
      product_id, user_id, movement_type, quantity, reason
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [data.productId, data.userId, data.type, Math.abs(data.quantity), data.reason],
  );
}
