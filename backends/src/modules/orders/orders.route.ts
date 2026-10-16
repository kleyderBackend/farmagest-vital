import { Router } from "express";
import { rateLimit } from "../../middlewares/rate-limit";
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

routes.post("/tracking/:code", rateLimit(), trackOrderByCodeController);

routes.use(authMiddleware, roleMiddleware(["admin", "staff"]));
routes.get("/", listOrdersController);
routes.get("/:id", findOrderByIdController);
routes.patch("/:id/status", updateOrderStatusController);
routes.patch("/:id/delivery", updateOrderDeliveryController);
