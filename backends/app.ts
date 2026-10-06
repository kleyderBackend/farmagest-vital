import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import type { Express } from "express";
import { routes as routesUser } from "./src/modules/auth/auth.route";
import { routes as routerCategories } from "./src/modules/categories/categories.route";
import { routes as routerProducts } from "./src/modules/products/products.route";

export const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", routesUser);
app.use("/api/categories", routerCategories);
app.use("/api/products", routerProducts);

app.get("/", (_req, res) => {
  res.json({ message: "API funcionando" });
});