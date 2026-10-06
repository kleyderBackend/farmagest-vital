import type { Request, Response } from "express";
import type { CreateCategoryInput } from "../categories.type";
import { createCategoryService } from "../services/created-categories.service";

export async function createdCategoriesController(req: Request, res: Response) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Nombre de la categoria es obligatorio",
      });
    }
    const categoryData: CreateCategoryInput = {
      name,
    };

    if (description !== undefined) {
      categoryData.description = description;
    }

    const newCategory = await createCategoryService(categoryData);

    return res.status(201).json({
      status: "success",
      message: "Categoria creada con exito",
      data: { newCategory },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "fail",
      message: "Error del servidor",
      error: error.message,
    });
  }
}
