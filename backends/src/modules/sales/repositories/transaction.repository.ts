import { pool } from "../../../config/db";
import type { QueryExecutor } from "../sales.type";

export async function executeSaleTransaction<T>(
  callback: (client: QueryExecutor) => Promise<T>,
) {
  const client = await pool.getConnection();

  try {
    await client.beginTransaction();
    const result = await callback(client);
    await client.commit();
    return result;
  } catch (error) {
    await client.rollback();
    throw error;
  } finally {
    client.release();
  }
}
