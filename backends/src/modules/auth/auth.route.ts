import { LoginController } from "./login/login.controller";
import { RegisterUserController } from "./register/register.controller";
import { Router } from "express";
import { rateLimit } from "../../middlewares/rate-limit";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";

export const routes: Router = Router();

routes.post("/register", authMiddleware, roleMiddleware(["admin"]), RegisterUserController);
routes.post("/login", rateLimit(10), LoginController);
