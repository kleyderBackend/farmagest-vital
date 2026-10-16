import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { createMovementController } from "./controllers/create-movement.controller";
import { listMovementsController } from "./controllers/list-movements.controller";

export const routes: Router = Router();

routes.use(authMiddleware, roleMiddleware(["admin", "staff"]));
routes.get("/", listMovementsController);
routes.post("/", createMovementController);
