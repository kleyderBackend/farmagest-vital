import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import {
  checkoutSaleController,
  createSaleController,
} from "./controllers/create-sales.controller";
import {
  findSaleByIdController,
  findSalesByDateController,
} from "./controllers/find-sales.controller";
import {
  listSalesByDateRangeController,
  listSalesController,
} from "./controllers/list-sales.controller";
import {
  getIncomeByDayController,
  getIncomeByHourController,
  getTotalSoldController,
} from "./controllers/sales-report.controller";

export const routes: Router = Router();

routes.post("/checkout", checkoutSaleController);

routes.use(authMiddleware, roleMiddleware(["admin", "staff"]));
routes.get("/", listSalesController);
routes.get("/range", listSalesByDateRangeController);
routes.get("/total-sold", getTotalSoldController);
routes.get("/daily-income", getIncomeByDayController);
routes.get("/hourly-income", getIncomeByHourController);
routes.get("/date/:date", findSalesByDateController);
routes.get("/:id", findSaleByIdController);
routes.post("/created-sale", createSaleController);
