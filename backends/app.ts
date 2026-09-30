import express from "express";
import cors from "cors";
import type { Express } from "express";
import { routes as routesUser } from "./src/modules/auth/auth.route";
import { routes as routerCategories } from "./src/modules/categories/categories.route";
import { routes as routerCustomers } from "./src/modules/customers/customers.route";
import { routes as routerProducts } from "./src/modules/products/products.route";
import { routes as routerSales } from "./src/modules/sales/sales.route";
export const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", routesUser);
app.use("/api/categories", routerCategories);
app.use("/api/customers", routerCustomers);
app.use("/api/products", routerProducts);
app.use("/api/sales", routerSales);
app.get("/", (_req, res) => {
  res.json({ message: "API funcionando" });
});
