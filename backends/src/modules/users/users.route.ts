import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { listUsersController } from "./controllers/list-users.controller";
import { createUserController } from "./controllers/create-user.controller";
import { updateUserController } from "./controllers/update-user.controller";

export const routes: Router = Router();

routes.use(authMiddleware, roleMiddleware(["admin"]));
routes.get("/", listUsersController);
routes.post("/", createUserController);
routes.put("/:id", updateUserController);
