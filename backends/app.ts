import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import type { Express } from "express";
import { routes as routesUser } from "./src/modules/auth/auth.route";
import { routes as routerCategories } from "./src/modules/categories/categories.route";
import { routes as routerCustomers } from "./src/modules/customers/customers.route";
import { routes as routerOrders } from "./src/modules/orders/orders.route";
import { routes as routerProducts } from "./src/modules/products/products.route";
import { routes as routerSales } from "./src/modules/sales/sales.route";

export const app: Express = express();

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5500",
  "https://kleyderbackend.github.io",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
  }),
);
app.use(express.json());

app.use("/api/auth", routesUser);
app.use("/api/categories", routerCategories);
app.use("/api/customers", routerCustomers);
app.use("/api/products", routerProducts);
app.use("/api/sales", routerSales);
app.use("/api/orders", routerOrders);

app.get("/", (_req, res) => {
  res.json({ message: "API funcionando" });
});
