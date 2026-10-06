import {
  findCategoryByIdService,
  findCategoryByNameService,
} from "../services/find-category.service";

import type { Request, Response } from "express";

export async function findCategoryByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de categoria invalido",
      });
    }
    const categoryId = Number(id);
    if (Number.isNaN(categoryId)) {
      return res.status(400).json({
        status: "fail",
        message: "ID de categoria invalido",
      });
    }
    const category = await findCategoryByIdService(categoryId);
    if (!category) {
      return res.status(404).json({
        status: "fail",
        message: "El id de la categoria no existe",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Categoria encontrada con exito",
      data: { category },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}

export async function findCategoryByNameController(
  req: Request,
  res: Response,
) {
  try {
    const { name } = req.params;
    if (!name || Array.isArray(name)) {
      return res.status(400).json({
        status: "fail",
        message: "Nombre de categoria invalido o no ingresado",
      });
    }
    const category = await findCategoryByNameService(name);
    if (!category) {
      return res.status(404).json({
        status: "fail",
        message: "La categoria no existe",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Categoria encontrada con exito",
      data: { category },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}
