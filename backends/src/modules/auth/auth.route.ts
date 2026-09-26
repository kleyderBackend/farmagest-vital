import { LoginController } from "./login/login.controller";
import { RegisterUserController } from "./register/register.controller";
import { Router } from "express";

export const routes: Router = Router();

routes.post("/register", RegisterUserController);
routes.post("/login", LoginController);
