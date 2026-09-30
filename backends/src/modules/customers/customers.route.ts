import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { createCustomerController } from "./controllers/create-customer.controller";
import {
  findCustomerByEmailController,
  findCustomerByIdController,
} from "./controllers/find-customer.controller";
import { listCustomersController } from "./controllers/list-customers.controller";
import { updateCustomerController } from "./controllers/update-customer.controller";

export const routes: Router = Router();

routes.use(authMiddleware, roleMiddleware(["admin", "staff"]));

routes.get("/", listCustomersController);
routes.get("/email/:email", findCustomerByEmailController);
routes.get("/:id", findCustomerByIdController);
routes.post("/created-customer", createCustomerController);
routes.put("/:id", updateCustomerController);
