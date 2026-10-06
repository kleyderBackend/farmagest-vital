import { Router } from "express";
import { createdCategoriesController } from "./controllers/created-categories.controller";
import {
  findCategoryByIdController,
  findCategoryByNameController,
} from "./controllers/find-category.controller";
import {
  listActiveCategoriesController,
  listCategoriesController,
} from "./controllers/list-categories.controller";
import {
  deactivateCategoryController,
  updateCategoryController,
} from "./controllers/update-category.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";

export const routes: Router = Router();

routes.get("/", listCategoriesController);
routes.get("/active", listActiveCategoriesController);
routes.get("/name/:name", findCategoryByNameController);
routes.get("/:id", findCategoryByIdController);

routes.post(
  "/creted-categorie",
  authMiddleware,
  roleMiddleware(["admin"]),
  createdCategoriesController,
);

routes.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateCategoryController,
);

routes.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deactivateCategoryController,
);
