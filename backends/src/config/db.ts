import dotenv from "dotenv";
import mysql from "mysql2/promise";
import pg from "pg";

dotenv.config();

type QueryResultTuple = [any, any];

type DbConnection = {
  query(sql: string, values?: any[]): Promise<QueryResultTuple>;
  beginTransaction(): Promise<any>;
  commit(): Promise<any>;
  rollback(): Promise<any>;
  release(): void;
};

type DbExecutor = {
  query(sql: string, values?: any[]): Promise<QueryResultTuple>;
  getConnection(): Promise<DbConnection>;
};

const postgresPrimaryKeys: Record<string, string> = {
  users: "user_id",
  categories: "category_id",
  products: "product_id",
  customers: "customer_id",
  carts: "cart_id",
  cart_items: "cart_item_id",
  orders: "order_id",
  order_items: "order_item_id",
  inventory_movements: "movement_id",
};

const toPostgresQuery = (sql: string) => {
  let index = 0;
  let nextSql = sql.replace(/\?/g, () => `$${++index}`);
  const insertMatch = nextSql.trim().match(/^INSERT\s+INTO\s+([a-z_]+)/i);
  const hasReturning = /\bRETURNING\b/i.test(nextSql);

  if (insertMatch && !hasReturning) {
    const primaryKey = postgresPrimaryKeys[insertMatch[1]!.toLowerCase()];
    if (primaryKey) nextSql = `${nextSql.trim()} RETURNING ${primaryKey}`;
  }

  return nextSql;
};

const toMysqlShape = (result: pg.QueryResult): QueryResultTuple => {
  const command = result.command.toUpperCase();

  if (command === "SELECT") {
    return [result.rows, result.fields];
  }

  const insertedRow = result.rows[0] ?? {};
  const insertId =
    Object.values(postgresPrimaryKeys)
      .map((primaryKey) => insertedRow[primaryKey])
      .find((value) => value !== undefined) ?? 0;

  return [
    {
      affectedRows: result.rowCount ?? 0,
      insertId,
    },
    result.fields,
  ];
};

const createPostgresExecutor = (postgresPool: pg.Pool): DbExecutor => ({
  async query(sql: string, values?: any[]) {
    const result = await postgresPool.query(toPostgresQuery(sql), values);
    return toMysqlShape(result);
  },
  async getConnection() {
    const client = await postgresPool.connect();

    return {
      async query(sql: string, values?: any[]) {
        const result = await client.query(toPostgresQuery(sql), values);
        return toMysqlShape(result);
      },
      beginTransaction: () => client.query("BEGIN"),
      commit: () => client.query("COMMIT"),
      rollback: () => client.query("ROLLBACK"),
      release: () => client.release(),
    };
  },
});

const createPool = (): DbExecutor => {
  if (process.env.DATABASE_URL) {
    const config: pg.PoolConfig = {
      connectionString: process.env.DATABASE_URL,
    };

    if (process.env.DB_SSL === "true") {
      config.ssl = { rejectUnauthorized: false };
    }

    return createPostgresExecutor(
      new pg.Pool(config),
    );
  }

  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || "farma_vital",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    connectionLimit: 2,
    waitForConnections: true,
    queueLimit: 0,
  }) as unknown as DbExecutor;
};

export const pool = createPool();

export async function testConnection() {
  try {
    const [rows]: any = await pool.query('SELECT NOW() AS fecha');
    console.log('✅ Conexión exitosa:', rows[0].fecha);
  } catch (err: any) {
    console.error('❌ Error de conexión:', err.message);
  }
}
