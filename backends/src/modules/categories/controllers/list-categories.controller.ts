import type { Request, Response } from "express";
import {
  listActiveCategoriesService,
  listCategoriesService,
} from "../services/list-categories.service";

export async function listCategoriesController(_req: Request, res: Response) {
  try {
    const categories = await listCategoriesService();

    return res.status(200).json({
      status: "success",
      message: "Categorias listadas con exito",
      data: { categories },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}

export async function listActiveCategoriesController(
  _req: Request,
  res: Response,
) {
  try {
    const categories = await listActiveCategoriesService();

    return res.status(200).json({
      status: "success",
      message: "Categorias activas listadas con exito",
      data: { categories },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}
