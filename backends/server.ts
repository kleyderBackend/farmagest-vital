import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const { app } = await import("./app");
const { initPostgresDatabase } = await import("./src/db/init-postgres");

const PORT = process.env.PORT || 3000;

await initPostgresDatabase();

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
