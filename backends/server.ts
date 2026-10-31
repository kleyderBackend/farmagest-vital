import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

// La raíz tiene prioridad; backends/.env respalda instalaciones anteriores.
dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const { app } = await import("./app");
const { initPostgresDatabase } = await import("./src/db/init-postgres");
const { migrateDatabase } = await import("./src/db/migrate");

const PORT = process.env.PORT || 3001;

try {
  await initPostgresDatabase();
  await migrateDatabase();
} catch (error) {
  const code = (error as NodeJS.ErrnoException).code || "ERROR_DB";
  console.error(process.env.DATABASE_URL
    ? `No se pudo iniciar PostgreSQL (${code}). Revisa DATABASE_URL y DB_SSL en Render.`
    : `No se pudo iniciar MySQL (${code}). Inicia MySQL en XAMPP, revisa DB_HOST/DB_PORT y verifica que farma_vital esté importada. Configuración: .env o backends/.env.`);
  process.exit(1);
}

const server = app.listen(PORT);
server.once("listening", () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
server.once("error", (error: NodeJS.ErrnoException) => {
  console.error(error.code === "EADDRINUSE"
    ? `El puerto ${PORT} está ocupado por otra aplicación. Configura PORT en .env y la misma dirección en frontends/js/api-config.js.`
    : `No se pudo iniciar el servidor (${error.code || "ERROR_SERVIDOR"}).`);
  process.exit(1);
});
