import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import {
  findOrderByIdController,
  listOrdersController,
  trackOrderByCodeController,
  updateOrderDeliveryController,
  updateOrderStatusController,
} from "./controllers/order.controller";

export const routes: Router = Router();

routes.get("/tracking/:code", trackOrderByCodeController);

routes.use(authMiddleware, roleMiddleware(["admin", "staff"]));
routes.get("/", listOrdersController);
routes.get("/:id", findOrderByIdController);
routes.patch("/:id/status", updateOrderStatusController);
routes.patch("/:id/delivery", updateOrderDeliveryController);
