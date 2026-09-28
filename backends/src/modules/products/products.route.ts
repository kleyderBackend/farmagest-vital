import { Router } from "express";
import { createProductController } from "./controllers/create-products.controller";
import {
  findProductByIdController,
  findProductByNameController,
} from "./controllers/find-products.controller";
import {
  listActiveProductController,
  listAvailableProductController,
  listProductController,
  listProductsByCategoryController,
} from "./controllers/list-products.controller";
import {
  deactivateProductController,
  updateProductController,
} from "./controllers/update-products.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";

export const routes: Router = Router();

routes.get("/", listProductController);
routes.get("/active", listActiveProductController);
routes.get("/available", listAvailableProductController);
routes.get("/category/:id", listProductsByCategoryController);
routes.get("/name/:name", findProductByNameController);
routes.get("/:id", findProductByIdController);

routes.post(
  "/created-products",
  authMiddleware,
  roleMiddleware(["admin"]),
  createProductController,
);

routes.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateProductController,
);

routes.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deactivateProductController,
);

